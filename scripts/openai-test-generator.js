const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `
You are a senior QA automation engineer.

Generate production-ready Jest unit tests.

Requirements:
- Cover all exported functions
- Cover happy paths
- Cover edge cases
- Cover invalid inputs
- Cover exceptions
- Mock external dependencies
- Mock APIs
- Mock databases
- Use Jest best practices
- Do NOT duplicate existing test cases
- Return the complete updated test file
- Add a single-line comment above EVERY it() block describing the scenario being tested (e.g. // Scenario: returns 404 when user not found)

CRITICAL — Test Isolation:
- If the module under test holds any in-memory state (arrays, objects, Maps) at module level, you MUST reset it between tests using jest.resetModules() and re-requiring the module in beforeEach.
- Use this exact pattern instead of a top-level require:

  let fnA, fnB; // declare all imported functions at top
  beforeEach(() => {
    jest.resetModules();
    ({ fnA, fnB } = require('./path/to/module'));
  });

- NEVER reset state with a local variable copy (e.g. let arr = []) — that does not affect the module's internal state.
- If the module has NO in-memory state (pure functions, stateless), a normal top-level require is fine.

Source file: ${filePath}

Source code:
${sourceCode}

${existingTestSection}

Return ONLY valid JSON:

{
  "testCode": "complete Jest test file"
}
        `,
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