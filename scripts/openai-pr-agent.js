const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Convert ESLint JSON output → structured comment objects
function parseEslintFindings() {
  try {
    const raw = fs.readFileSync("eslint_output.json", "utf8");
    const results = JSON.parse(raw);
    const findings = [];

    for (const fileResult of results) {
      const relPath = fileResult.filePath
        .replace(process.cwd() + "/", "")
        .replace(process.cwd() + "\\", "")
        .replace(/\\/g, "/");

      for (const msg of fileResult.messages) {
        if (msg.severity === 2) {
          findings.push({
            file: relPath,
            line: msg.line,
            severity: "bug",
            comment: `[ESLint: ${msg.ruleId}] ${msg.message}`,
          });
        }
      }
    }
    return findings;
  } catch (e) {
    return [];
  }
}

async function run() {
  try {
    const diff = fs.readFileSync("diff.txt", "utf8");
    const context = fs.readFileSync("full_context.txt", "utf8");

    // ESLint findings are ground truth — include them regardless of AI output
    const eslintFindings = parseEslintFindings();
    const eslintSummary = eslintFindings.length
      ? eslintFindings.map(f => `- ${f.file}:${f.line} — ${f.comment}`).join("\n")
      : "No ESLint errors found.";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
You are a senior software engineer performing a strict code review.

Analyze the pull request below and return a JSON review.

--- GIT DIFF ---
${diff}

--- FULL FILE CONTEXT ---
${context}

--- ESLINT STATIC ANALYSIS (treat these as confirmed bugs) ---
${eslintSummary}

INSTRUCTIONS:
- Read the diff carefully. Each hunk header looks like: @@ -oldStart,oldCount +newStart,newCount @@
- Use the hunk headers to calculate exact absolute line numbers in the NEW version of the file.
- Only add comments for lines that appear in the diff (lines starting with +).
- The "file" field must exactly match the path after "b/" in the diff header (e.g. "src/app.js").
- The "line" field must be the integer line number in the new version of the file.
- ESLint errors listed above are already confirmed bugs — include them in your comments.
- Also look for: logic errors, wrong variable names, missing validations, divide by zero, etc.

Respond with ONLY valid JSON — no markdown, no explanation:

{
  "summary": "Brief overall summary of the PR and issues found",
  "verdict": "APPROVED" or "REJECTED",
  "comments": [
    {
      "file": "src/app.js",
      "line": 6,
      "severity": "bug" | "security" | "performance" | "suggestion",
      "comment": "Detailed explanation"
    }
  ]
}

Verdict rules:
- "REJECTED" if any comment has severity "bug"
- "APPROVED" only if zero bugs found
          `,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices?.[0]?.message?.content || "{}";

    let reviewData;
    try {
      reviewData = JSON.parse(rawContent);
    } catch (e) {
      console.error("Failed to parse AI JSON:", e.message);
      reviewData = { summary: "⚠️ AI returned invalid JSON.", verdict: "UNKNOWN", comments: [] };
    }

    reviewData.verdict  = reviewData.verdict  || "UNKNOWN";
    reviewData.summary  = reviewData.summary  || "No summary provided.";
    reviewData.comments = Array.isArray(reviewData.comments) ? reviewData.comments : [];

    // Merge ESLint findings — deduplicate by file+line
    const seen = new Set(reviewData.comments.map(c => `${c.file}:${c.line}`));
    for (const finding of eslintFindings) {
      if (!seen.has(`${finding.file}:${finding.line}`)) {
        reviewData.comments.push(finding);
      }
    }

    // ESLint errors always force a rejection
    if (eslintFindings.length > 0) {
      reviewData.verdict = "REJECTED";
    }

    fs.writeFileSync("review_result.json", JSON.stringify(reviewData, null, 2));
    fs.writeFileSync("review_verdict.txt", reviewData.verdict);

    console.log(`Verdict: ${reviewData.verdict}`);
    console.log(`Total comments: ${reviewData.comments.length} (ESLint: ${eslintFindings.length})`);
  } catch (err) {
    console.error("AI Agent Error:", err.message);
    const eslintFindings = parseEslintFindings();
    const errorResult = {
      summary: "⚠️ AI review failed. ESLint findings below.",
      verdict: eslintFindings.length > 0 ? "REJECTED" : "ERROR",
      comments: eslintFindings,
    };
    fs.writeFileSync("review_result.json", JSON.stringify(errorResult, null, 2));
    fs.writeFileSync("review_verdict.txt", errorResult.verdict);
  }
}

run();
