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
    max_tokens: 4096,
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

  let result;
  try {
    result = JSON.parse(response.choices[0].message.content);
  } catch (e) {
    throw new Error(`Failed to parse AI response for ${testFilePath}: ${e.message}`);
  }
  return result;
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

    console.log(`Fixing ${failingFiles.size} failing file(s): ${[...failingFiles].join(', ')}`);

    const results = [];
    const sourceCodeFixes = [];

    for (const testFile of failingFiles) {
      if (!fs.existsSync(testFile)) {
        console.error(`Test file not found: ${testFile}`);
        continue;
      }

      const sourceFile = testFile.replace(/^tests\//, '').replace(/\.test\.js$/, '.js');
      const fileErrors = extractErrorsForFile(jestOutput, testFile);

      console.log(`Analyzing ${testFile}...`);
      const result = await fixTestFile(testFile, sourceFile, fileErrors);

      // Write the fixed test file
      if (result.fixedTestCode) {
        fs.writeFileSync(testFile, result.fixedTestCode);
        console.log(`✅ Fixed test: ${testFile}`);
        results.push(testFile);
      }

      // Apply source code fixes if the agent identified code bugs
      if (result.sourceCodeFixes && result.sourceCodeFixes.length > 0) {
        for (const fix of result.sourceCodeFixes) {
          console.log(`⚠️  Source code fix needed: ${fix.file} — ${fix.issue}`);
          sourceCodeFixes.push(fix);
        }
      }
    }

    // Apply source code fixes using auto-fix agent instructions
    if (sourceCodeFixes.length > 0) {
      console.log(`\nApplying ${sourceCodeFixes.length} source code fix(es)...`);
      const { OpenAI: OAI } = require('openai');
      const autoFixInstructions = fs.readFileSync('.github/agents/auto-fix-agent.md', 'utf8')
        .replace(/^---[\s\S]*?---\n/, '').trim();

      const bySourceFile = {};
      for (const fix of sourceCodeFixes) {
        if (!bySourceFile[fix.file]) bySourceFile[fix.file] = [];
        bySourceFile[fix.file].push(fix);
      }

      for (const [filePath, fixes] of Object.entries(bySourceFile)) {
        if (!fs.existsSync(filePath)) {
          console.error(`Source file not found: ${filePath}`);
          continue;
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const issueList = fixes
          .map((f, idx) => `${idx + 1}. ${f.issue} — Fix: ${f.fix}`)
          .join('\n');

        const fixResponse = await client.chat.completions.create({
          model: 'gpt-4o',
          temperature: 0.1,
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `${autoFixInstructions}

FILE: ${filePath}

ISSUES TO FIX:
${issueList}

CURRENT CODE:
${fileContent}`
          }]
        });

        let fixedSource = fixResponse.choices?.[0]?.message?.content || fileContent;
        fixedSource = fixedSource.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
        fs.writeFileSync(filePath, fixedSource + '\n');
        console.log(`✅ Fixed source: ${filePath}`);
        results.push(filePath);
      }
    }

    fs.writeFileSync('fix_results.txt', results.join('\n'));
    console.log(`\nFixed ${results.length} file(s) total.`);

  } catch (err) {
    console.error('Test Fix Agent Error:', err.message);
    process.exit(1);
  }
}

run();
