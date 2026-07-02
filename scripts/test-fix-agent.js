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

function stripMarkdown(code) {
  return code
    .replace(/^FILE:.*\n+/, '')
    .replace(/^```[\w]*\n?/, '')
    .replace(/\n?```$/, '')
    .trim();
}

async function fixTestFile(testFilePath, sourceFilePath, jestError) {
  const testCode = fs.readFileSync(testFilePath, 'utf8');
  const sourceCode = fs.existsSync(sourceFilePath) ? fs.readFileSync(sourceFilePath, 'utf8') : '';

  const exportedFns = getExportedFunctions(sourceFilePath);
  const requirePath = path.relative(path.dirname(testFilePath), sourceFilePath)
    .replace(/\\/g, '/')
    .replace(/\.js$/, '');

  const scaffoldPreview = buildScaffold(exportedFns, requirePath);
  const instructions = loadAgentInstructions('.github/agents/test-fix-agent.md');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: instructions + "\n\n" +
        "Source file: " + sourceFilePath + "\n" +
        "Source code:\n" + sourceCode + "\n\n" +
        "SCAFFOLD (already handled — DO NOT include any of this in your response):\n" +
        "```js\n" + scaffoldPreview + "\n```\n\n" +
        "Test file: " + testFilePath + "\n" +
        "Current test code:\n" + testCode + "\n\n" +
        "Jest error output:\n" + jestError + "\n\n" +
        "Return JSON with exactly these fields:\n" +
        '{\n' +
        '  "mocks": "corrected jest.mock() calls if needed (empty string if none)",\n' +
        '  "testCases": "ONLY the corrected describe() and it() blocks — no let, no const, no beforeEach, no require, no jest.resetModules()",\n' +
        '  "sourceCodeFixes": [{ "file": "...", "issue": "...", "fixedSourceCode": "..." }]\n' +
        '}'
    }]
  });

  let result;
  try {
    result = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error('Failed to parse AI response for ' + testFilePath + ': ' + e.message);
  }

  const scaffold = buildScaffold(exportedFns, requirePath, result.mocks || '');
  const fixedTestCode = scaffold + '\n\n' + result.testCases.trim() + '\n';

  return { fixedTestCode, sourceCodeFixes: result.sourceCodeFixes || [] };
}

async function run() {
  try {
    if (!fs.existsSync('jest_output.txt')) {
      console.error('jest_output.txt not found.');
      process.exit(1);
    }

    const jestOutput = fs.readFileSync('jest_output.txt', 'utf8');
    const failingFiles = new Set();
    for (const line of jestOutput.split('\n')) {
      const match = line.match(/^FAIL\s+(.+\.test\.js)/);
      if (match) failingFiles.add(match[1].trim());
    }

    if (failingFiles.size === 0) {
      console.log('No failing test files detected in Jest output.');
      return;
    }

    console.log('Fixing ' + failingFiles.size + ' failing file(s): ' + [...failingFiles].join(', '));
    const results = [];

    for (const testFile of failingFiles) {
      if (!fs.existsSync(testFile)) {
        console.error('Test file not found: ' + testFile);
        continue;
      }

      const sourceFile = testFile.replace(/^tests\//, '').replace(/\.test\.js$/, '.js');
      const fileErrors = extractErrorsForFile(jestOutput, testFile);

      console.log('Analyzing ' + testFile + '...');
      const result = await fixTestFile(testFile, sourceFile, fileErrors);

      if (result.fixedTestCode) {
        fs.writeFileSync(testFile, result.fixedTestCode);
        console.log('Fixed test: ' + testFile);
        results.push(testFile);
      }

      if (result.sourceCodeFixes && result.sourceCodeFixes.length > 0) {
        for (const fix of result.sourceCodeFixes) {
          console.log('Source code fix: ' + fix.file + ' - ' + fix.issue);
          if (!fix.fixedSourceCode) {
            console.error('  Skipping ' + fix.file + ': no fixedSourceCode provided');
            continue;
          }
          if (!fs.existsSync(fix.file)) {
            console.error('  Skipping ' + fix.file + ': file not found');
            continue;
          }
          fs.writeFileSync(fix.file, stripMarkdown(fix.fixedSourceCode) + '\n');
          console.log('Fixed source: ' + fix.file);
          results.push(fix.file);
        }
      }
    }

    fs.writeFileSync('fix_results.txt', results.join('\n'));
    console.log('\nFixed ' + results.length + ' file(s) total.');
  } catch (err) {
    console.error('Test Fix Agent Error:', err.message);
    process.exit(1);
  }
}

run();
