const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function fixFile(filePath, fileContent, issues) {
  const issueList = issues
    .map((i, idx) => `${idx + 1}. Line ${i.line} [${i.severity.toUpperCase()}]: ${i.comment}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `
You are a senior software engineer. Fix ALL the issues listed below in the given code.

FILE: ${filePath}

ISSUES TO FIX:
${issueList}

CURRENT CODE:
${fileContent}

INSTRUCTIONS:
- Fix every issue listed above
- Do NOT change any code unrelated to the listed issues
- Do NOT add comments explaining your fixes
- Return ONLY the complete fixed file content — no markdown, no code fences, no explanation
        `,
      },
    ],
    temperature: 0.1,
  });

  let fixed = response.choices?.[0]?.message?.content || fileContent;

  // Strip markdown code fences if AI wrapped the response
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

    // Group comments by file
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
