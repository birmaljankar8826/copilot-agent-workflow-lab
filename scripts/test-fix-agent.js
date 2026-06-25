const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractErrorsForFile(jestOutput, testFile) {
  const lines = jestOutput.split('\n');
  const errors = [];
  let capturing = false;

  for (const line of lines) {
    if (line.includes(testFile)) capturing = true;
    if (capturing) {
      errors.push(line);
      if (errors.length > 1 && (line.startsWith('FAIL ') || line.startsWith('PASS '))) {
        errors.pop();
        break;
      }
    }
  }

  return errors.length > 0 ? errors.join('\n') : jestOutput;
}

async function fixTestFile(testFilePath, sourceFilePath, jestError) {
  const testCode = fs.readFileSync(testFilePath, 'utf8');
  const sourceCode = fs.existsSync(sourceFilePath)
    ? fs.readFileSync(sourceFilePath, 'utf8')
    : '';

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `
You are a senior QA engineer. Fix the failing Jest test file based on the error output.

Source file: ${sourceFilePath}
Source code:
${sourceCode}

Test file: ${testFilePath}
Current test code:
${testCode}

Jest error output:
${jestError}

Fix ALL issues in the test file:
- Fix wrong imports or require paths
- Fix incorrect mocks or missing mocks
- Fix wrong assertions or expected values
- Fix syntax errors
- Do NOT remove any existing test scenarios
- Add a single-line comment above each it() block describing the scenario

CRITICAL — Test Isolation:
- If the source module holds in-memory state (arrays, objects, Maps) at module level, use jest.resetModules() in beforeEach and re-require the module — do NOT use a top-level require.
- Pattern:
    let fnA, fnB;
    beforeEach(() => {
      jest.resetModules();
      ({ fnA, fnB } = require('./path/to/module'));
    });
- A local variable copy (e.g. let arr = []) does NOT reset the module's internal state.

Return ONLY valid JSON:
{
  "fixedTestCode": "complete fixed test file content"
}
      `
    }]
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result.fixedTestCode;
}

async function run() {
  try {
    if (!fs.existsSync('jest_output.txt')) {
      console.error('jest_output.txt not found.');
      process.exit(1);
    }

    const jestOutput = fs.readFileSync('jest_output.txt', 'utf8');

    // Parse failing test files from Jest output (lines starting with "FAIL")
    const failingFiles = new Set();
    for (const line of jestOutput.split('\n')) {
      const match = line.match(/^FAIL\s+(.+\.test\.js)/);
      if (match) failingFiles.add(match[1].trim());
    }

    if (failingFiles.size === 0) {
      console.log('No failing test files detected in Jest output.');
      return;
    }

    console.log(`Fixing ${failingFiles.size} failing file(s): ${[...failingFiles].join(', ')}`);

    const results = [];

    for (const testFile of failingFiles) {
      if (!fs.existsSync(testFile)) {
        console.error(`Test file not found: ${testFile}`);
        continue;
      }

      // Derive source file: tests/<dir>/<name>.test.js → <dir>/<name>.js
      const sourceFile = testFile.replace(/^tests\//, '').replace(/\.test\.js$/, '.js');
      const fileErrors = extractErrorsForFile(jestOutput, testFile);

      console.log(`Fixing ${testFile}...`);
      const fixedCode = await fixTestFile(testFile, sourceFile, fileErrors);
      fs.writeFileSync(testFile, fixedCode);
      console.log(`✅ Fixed: ${testFile}`);
      results.push(testFile);
    }

    fs.writeFileSync('fix_results.txt', results.join('\n'));
    console.log(`Fixed ${results.length} test file(s).`);

  } catch (err) {
    console.error('Test Fix Agent Error:', err.message);
    process.exit(1);
  }
}

run();
