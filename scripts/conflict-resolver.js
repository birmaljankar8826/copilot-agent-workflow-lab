const fs = require('fs');
const { execSync } = require('child_process');
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Strategy passed from workflow: 'current' | 'incoming' | 'merge'
const STRATEGY = process.env.RESOLVE_STRATEGY || 'merge';

const STRATEGY_INSTRUCTIONS = {
  current: `
STRATEGY: PREFER CURRENT (HEAD)
- Always keep the code from the HEAD / current branch (between <<<<<<< and =======)
- Only take from incoming if the current version is clearly broken (syntax error, missing code)
- This preserves the developer's PR changes`,

  incoming: `
STRATEGY: PREFER INCOMING (BASE BRANCH)
- Always keep the code from the incoming / base branch (between ======= and >>>>>>>)
- Only take from current if the incoming version is clearly broken (syntax error, missing code)
- This ensures the latest base branch changes are adopted`,

  merge: `
STRATEGY: SMART MERGE (AI DECIDES)
- Read both versions carefully and understand what each side changed
- If one side adds a feature and other side fixes a bug — keep BOTH changes
- If both sides changed the same logic differently — pick the more correct/complete version
- If one side is clearly better (safer, more complete, fixes a bug) — pick that side
- NEVER just pick one side blindly — always reason about correctness`
};

function findConflictedFiles() {
  try {
    const result = execSync(
      'grep -rl "<<<<<<< " . --include="*.js" --include="*.ts" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || true',
      { encoding: 'utf8' }
    ).trim();
    return result ? result.split('\n').filter(Boolean).map(f => f.replace(/^\.\//, '')) : [];
  } catch (e) {
    return [];
  }
}

async function resolveFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('<<<<<<<')) return null;

  const strategyInstruction = STRATEGY_INSTRUCTIONS[STRATEGY] || STRATEGY_INSTRUCTIONS.merge;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    messages: [{
      role: 'user',
      content: `
You are a senior software engineer. Resolve ALL git merge conflicts in this file.

FILE: ${filePath}

CONFLICT MARKERS EXPLAINED:
- <<<<<<< HEAD      → start of CURRENT branch code (the PR branch)
- =======           → separator between the two versions
- >>>>>>> branch    → end of INCOMING code (the base branch being merged in)

${strategyInstruction}

ALWAYS:
- Remove ALL conflict markers (<<<<<<< , =======, >>>>>>>)
- Ensure the final code is correct, complete and functional
- Do NOT wrap output in markdown code fences
- Return ONLY the complete resolved file as plain text

CONFLICTED FILE:
${content}
      `
    }]
  });

  let resolved = response.choices[0].message.content || content;
  resolved = resolved.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
  return resolved;
}

async function run() {
  try {
    console.log(`Resolve strategy: ${STRATEGY}`);

    const conflictedFiles = findConflictedFiles();

    if (conflictedFiles.length === 0) {
      console.log('No conflicted files found.');
      fs.writeFileSync('resolve_summary.txt', '');
      fs.writeFileSync('resolved_files.txt', '');
      return;
    }

    console.log(`Found ${conflictedFiles.length} conflicted file(s): ${conflictedFiles.join(', ')}`);

    const resolved = [];
    const failed  = [];

    for (const file of conflictedFiles) {
      try {
        console.log(`Resolving ${file}...`);
        const resolvedContent = await resolveFile(file);
        if (resolvedContent) {
          fs.writeFileSync(file, resolvedContent + '\n');
          resolved.push(file);
          console.log(`✅ Resolved: ${file}`);
        }
      } catch (err) {
        console.error(`❌ Failed: ${file} — ${err.message}`);
        failed.push(file);
      }
    }

    const strategyLabel = { current: '🔵 Preferred current branch', incoming: '🟢 Preferred incoming branch', merge: '🤖 AI smart merge' }[STRATEGY];

    const lines = [
      `Strategy: ${strategyLabel}`,
      `Resolved ${resolved.length} file(s):`,
      ...resolved.map(f => `  ✅ ${f}`),
      ...(failed.length > 0
        ? [`\nFailed to resolve ${failed.length} file(s):`, ...failed.map(f => `  ❌ ${f}`)]
        : [])
    ];

    fs.writeFileSync('resolve_summary.txt', lines.join('\n'));
    fs.writeFileSync('resolved_files.txt', resolved.join('\n'));
    console.log(lines.join('\n'));

  } catch (err) {
    console.error('Conflict Resolver Error:', err.message);
    process.exit(1);
  }
}

run();
