const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getTestFilePath(sourceFile) {
  const dir = path.dirname(sourceFile);
  const ext = path.extname(sourceFile);
  const name = path.basename(sourceFile, ext);

  return `${dir}/${name}.test${ext}`;
}

async function generateTestForFile(filePath) {
  const sourceCode = fs.readFileSync(filePath, "utf8");

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

Source file:
${filePath}

Source code:
${sourceCode}

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
      .filter(f => !f.includes(".test."));

    const generated = [];

    for (const file of changedFiles) {

      if (!fs.existsSync(file)) {
        continue;
      }

      const testFile = getTestFilePath(file);

      if (fs.existsSync(testFile)) {
        console.log(`Skipping existing test: ${testFile}`);
        continue;
      }

      console.log(`Generating tests for ${file}`);

      const testCode =
        await generateTestForFile(file);

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