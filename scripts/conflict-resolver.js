const fs = require('fs');
const { execSync } = require('child_process');
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    messages: [{
      role: 'user',
      content: `
You are a senior software engineer. Resolve ALL git merge conflicts in this file.

FILE: ${filePath}

RULES:
- Analyze BOTH versions of each conflict carefully
- Keep the best logic from both versions — do NOT just pick one side blindly
- Ensure the final code is correct, complete and functional
- Remove ALL conflict markers (<<<<<<< , =======, >>>>>>>)
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

    const lines = [
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
