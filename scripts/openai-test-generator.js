const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

function loadAgentInstructions(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf8");
  return raw.replace(/^---[\s\S]*?---\n/, "").trim();
}

function getTestFilePath(sourceFile) {
  const ext = path.extname(sourceFile);
  const name = path.basename(sourceFile, ext);
  const dir = path.dirname(sourceFile);
  return path.join("tests", dir, name + ".test" + ext);
}

function getExportedFunctions(filePath) {
  try {
    const absPath = path.resolve(filePath);
    delete require.cache[absPath];
    const mod = require(absPath);
    return Object.keys(mod).filter(k => typeof mod[k] === 'function');
  } catch (e) {
    console.warn("Could not load " + filePath + " for export detection: " + e.message);
    return [];
  }
}

// Scaffold is built programmatically — AI never writes boilerplate.
// mocksCode: optional jest.mock() calls injected inside beforeEach after resetModules, before require.
function buildScaffold(exportedFns, requirePath, mocksCode) {
  const decl = exportedFns.join(', ');
  const lines = [
    'let ' + decl + ';',
    '',
    'beforeEach(() => {',
    '  jest.resetModules();'
  ];
  if (mocksCode && mocksCode.trim()) {
    for (const line of mocksCode.trim().split('\n')) {
      lines.push('  ' + line);
    }
  }
  lines.push("  ({ " + decl + " } = require('" + requirePath + "'));");
  lines.push('});');
  return lines.join('\n');
}

async function generateTestForFile(filePath) {
  const sourceCode = fs.readFileSync(filePath, "utf8");
  const testFile = getTestFilePath(filePath);
  const requirePath = path.relative(path.dirname(testFile), filePath)
    .replace(/\\/g, '/')
    .replace(/\.js$/, '');

  const exportedFns = getExportedFunctions(filePath);
  if (exportedFns.length === 0) {
    console.warn("No exported functions detected in " + filePath + " — skipping");
    return null;
  }

  const scaffoldPreview = buildScaffold(exportedFns, requirePath);
  const instructions = loadAgentInstructions(".github/agents/test-generator-agent.md");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [{
      role: "user",
      content: instructions + "\n\n" +
        "Source file: " + filePath + "\n" +
        "Exported functions: " + exportedFns.join(', ') + "\n\n" +
        "SCAFFOLD (already generated for you — DO NOT include any of this in your response):\n" +
        "```js\n" + scaffoldPreview + "\n```\n\n" +
        "Source code:\n" + sourceCode + "\n\n" +
        "Return JSON with exactly these two fields:\n" +
        '{\n' +
        '  "mocks": "jest.mock() call(s) for external dependencies (empty string if none needed)",\n' +
        '  "testCases": "ONLY the describe() and it() blocks — no let, no const, no beforeEach, no require, no jest.resetModules()"\n' +
        '}'
    }]
  });

  let result;
  try {
    result = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error("Failed to parse AI response for " + filePath + ": " + e.message);
  }

  const scaffold = buildScaffold(exportedFns, requirePath, result.mocks || '');
  return scaffold + '\n\n' + result.testCases.trim() + '\n';
}

async function run() {
  try {
    const changedFiles = fs
      .readFileSync("files.txt", "utf8")
      .split("\n")
      .map(f => f.trim())
      .filter(Boolean)
      .filter(f => f.endsWith(".js"))
      .filter(f => !f.includes(".test."))
      .filter(f => !f.startsWith("tests/"))
      .filter(f => !f.startsWith("scripts/"))
      .filter(f => !f.startsWith(".github/"));

    const generated = [];

    for (const file of changedFiles) {
      if (!fs.existsSync(file)) continue;

      const testFile = getTestFilePath(file);
      console.log("Generating tests for " + file);

      const testCode = await generateTestForFile(file);
      if (!testCode) continue;

      fs.mkdirSync(path.dirname(testFile), { recursive: true });
      fs.writeFileSync(testFile, testCode);

      generated.push({ source: file, test: testFile });
      console.log("Created " + testFile);
    }

    fs.writeFileSync("generated_tests.json", JSON.stringify(generated, null, 2));
    console.log("Generated " + generated.length + " test files");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

if (require.main === module) {
  run().catch(() => process.exit(1));
}

module.exports = { getTestFilePath, generateTestForFile, buildScaffold, getExportedFunctions, run };