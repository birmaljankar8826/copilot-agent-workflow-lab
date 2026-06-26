const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function loadAgentInstructions(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf8");
  return raw.replace(/^---[\s\S]*?---\n/, "").trim();
}

function getTestFilePath(sourceFile) {
  const ext = path.extname(sourceFile);
  const name = path.basename(sourceFile, ext);
  const dir = path.dirname(sourceFile);

  return path.join("tests", dir, `${name}.test${ext}`);
}

async function generateTestForFile(filePath, existingTestCode = null) {
  const sourceCode = fs.readFileSync(filePath, "utf8");

  const existingTestSection = existingTestCode
    ? `Existing test file (preserve all existing tests, only add tests for new/changed code):
${existingTestCode}`
    : `No existing tests — generate tests for all exported functions.`;

  const instructions = loadAgentInstructions(".github/agents/test-generator-agent.md");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `${instructions}

Source file: ${filePath}

Source code:
${sourceCode}

${existingTestSection}`,
      },
    ],
  });

  const result = JSON.parse(
    response.choices[0].message.content
  );

  return result.testCode;
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
      .filter(f => !f.startsWith("tests/"));

    const generated = [];

    for (const file of changedFiles) {

      if (!fs.existsSync(file)) {
        continue;
      }

      const testFile = getTestFilePath(file);

      const existingTestCode = fs.existsSync(testFile)
        ? fs.readFileSync(testFile, "utf8")
        : null;

      if (existingTestCode) {
        console.log(`Updating tests for ${file} (existing tests preserved)`);
      } else {
        console.log(`Generating tests for ${file}`);
      }

      const testCode =
        await generateTestForFile(file, existingTestCode);

      fs.mkdirSync(path.dirname(testFile), { recursive: true });
      fs.writeFileSync(testFile, testCode);

      generated.push({
        source: file,
        test: testFile,
      });

      console.log(`Created ${testFile}`);
    }

    fs.writeFileSync(
      "generated_tests.json",
      JSON.stringify(generated, null, 2)
    );

    console.log(
      `Generated ${generated.length} test files`
    );

  } catch (err) {
    console.error(err);
    throw err;
  }
}

if (require.main === module) {
  run().catch(() => process.exit(1));
}

module.exports = { getTestFilePath, generateTestForFile, run };