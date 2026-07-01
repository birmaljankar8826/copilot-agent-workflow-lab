const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

function loadAgentInstructions(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8');
  return raw.replace(/^---[\s\S]*?---\n/, '').trim();
}

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

  const instructions = loadAgentInstructions('.github/agents/test-fix-agent.md');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `${instructions}

Source file: ${sourceFilePath}
Source code:
${sourceCode}

Test file: ${testFilePath}
Current test code:
${testCode}

Jest error output:
${jestError}`
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
