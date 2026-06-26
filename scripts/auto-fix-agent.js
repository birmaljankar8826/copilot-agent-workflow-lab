const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function loadAgentInstructions(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf8");
  return raw.replace(/^---[\s\S]*?---\n/, "").trim();
}

async function fixFile(filePath, fileContent, issues) {
  const issueList = issues
    .map((i, idx) => `${idx + 1}. Line ${i.line} [${i.severity.toUpperCase()}]: ${i.comment}`)
    .join("\n");

  const instructions = loadAgentInstructions(".github/agents/auto-fix-agent.md");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `${instructions}

FILE: ${filePath}

ISSUES TO FIX:
${issueList}

CURRENT CODE:
${fileContent}`,
      },
    ],
    temperature: 0.1,
  });

  let fixed = response.choices?.[0]?.message?.content || fileContent;
  fixed = fixed.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
  return fixed;
}

async function run() {
  try {
    const reviewData = JSON.parse(fs.readFileSync("review_result.json", "utf8"));
    const comments   = reviewData.comments || [];

    if (comments.length === 0) {
      console.log("No issues found to fix.");
      fs.writeFileSync("fix_summary.txt", "✅ No issues found — nothing to fix.");
      return;
    }

    const byFile = {};
    for (const c of comments) {
      if (!byFile[c.file]) byFile[c.file] = [];
      byFile[c.file].push(c);
    }

    console.log(`Files to fix: ${Object.keys(byFile).join(", ")}`);

    const fixed  = [];
    const failed = [];

    for (const [filePath, issues] of Object.entries(byFile)) {
      try {
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          failed.push(filePath);
          continue;
        }

        const original = fs.readFileSync(filePath, "utf8");
        console.log(`Fixing ${filePath} (${issues.length} issue(s))...`);

        const fixedContent = await fixFile(filePath, original, issues);
        fs.writeFileSync(filePath, fixedContent + "\n");

        console.log(`✅ Fixed: ${filePath}`);
        fixed.push({ file: filePath, count: issues.length });
      } catch (err) {
        console.error(`Failed to fix ${filePath}: ${err.message}`);
        failed.push(filePath);
      }
    }

    const lines = [
      `Fixed ${fixed.length} file(s):`,
      ...fixed.map(f => `  ✅ ${f.file} — ${f.count} issue(s) resolved`),
      ...(failed.length > 0
        ? [`\nFailed to fix ${failed.length} file(s):`, ...failed.map(f => `  ❌ ${f}`)]
        : []),
    ];

    const summary = lines.join("\n");
    fs.writeFileSync("fix_summary.txt", summary);
    console.log(summary);

  } catch (err) {
    console.error("Auto-Fix Agent Error:", err.message);
    fs.writeFileSync("fix_summary.txt", `❌ Auto-fix agent failed: ${err.message}`);
    process.exit(1);
  }
}

run();
