const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parse the git diff and return a map of { filePath -> Set<lineNumber> }
 * containing every line number (in the NEW file) that appears in any diff hunk.
 * GitHub's inline comment API only accepts line numbers within this set.
 */
function parseDiffLineRanges(diffText) {
  const ranges = {};
  let currentFile = null;
  let newLine = 0;

  for (const line of diffText.split("\n")) {
    // New file marker: +++ b/src/app.js
    const fileMatch = line.match(/^\+\+\+ b\/(.+)/);
    if (fileMatch) {
      currentFile = fileMatch[1].trim();
      if (!ranges[currentFile]) ranges[currentFile] = new Set();
      continue;
    }

    // Hunk header: @@ -old,count +newStart,count @@
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      newLine = parseInt(hunkMatch[1], 10) - 1;
      continue;
    }

    if (!currentFile) continue;
    if (line.startsWith("---") || line.startsWith("+++")) continue;
    if (line.startsWith("\\")) continue; // "No newline at end of file"

    if (line.startsWith("-")) {
      // Removed line — does not exist in new file, no increment
    } else {
      // Added (+) or context line — exists in new file
      newLine++;
      ranges[currentFile].add(newLine);
    }
  }

  return ranges;
}

// Convert ESLint JSON output → structured comment objects
function parseEslintFindings() {
  try {
    const raw = fs.readFileSync("eslint_output.json", "utf8");
    const results = JSON.parse(raw);
    const findings = [];
    const cwd = process.cwd().replace(/\\/g, "/");

    for (const fileResult of results) {
      const relPath = fileResult.filePath
        .replace(/\\/g, "/")
        .replace(cwd + "/", "");

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
    const diff    = fs.readFileSync("diff.txt", "utf8");
    const context = fs.readFileSync("full_context.txt", "utf8");

    const diffLineRanges = parseDiffLineRanges(diff);
    const eslintFindings = parseEslintFindings();
    const eslintSummary  = eslintFindings.length
      ? eslintFindings.map(f => `- ${f.file}:${f.line} — ${f.comment}`).join("\n")
      : "No ESLint errors found.";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
You are a senior software engineer performing a thorough code review.

Review ALL of the code in the changed files — both new and existing code.

--- GIT DIFF (what changed) ---
${diff}

--- FULL FILE CONTENT (review the entire file, not just the diff) ---
${context}

--- ESLINT STATIC ANALYSIS (confirmed bugs — always include these) ---
${eslintSummary}

WHAT TO LOOK FOR in the entire file:
- Undefined or wrong variable names (e.g. using a variable that doesn't exist)
- Unused or ignored function parameters
- Division by zero risks
- Missing input validation
- Logic errors or wrong return values
- Security issues (injection, unsafe eval, etc.)
- Null / undefined access without guards
- Any other bugs, even in unchanged lines

RESPONSE FORMAT — ONLY valid JSON, no markdown:
{
  "summary": "Overall summary of the PR and all issues found",
  "verdict": "APPROVED" or "REJECTED",
  "comments": [
    {
      "file": "src/app.js",
      "line": 6,
      "severity": "bug" | "security" | "performance" | "suggestion",
      "comment": "Clear explanation of the issue"
    }
  ]
}

VERDICT RULES:
- "REJECTED" if ANY comment has severity "bug" or "security"
- "APPROVED" only if zero bugs and zero security issues
- Report every issue found — do not skip issues in unchanged code
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

    // ESLint errors always force rejection
    if (eslintFindings.length > 0) {
      reviewData.verdict = "REJECTED";
    } else if (reviewData.comments.some(c => c.severity === "bug" || c.severity === "security")) {
      reviewData.verdict = "REJECTED";
    }

    // Split: inline comments (on diff lines) vs summary issues (on non-diff lines)
    const inlineComments  = [];
    const summaryIssues   = [];

    for (const comment of reviewData.comments) {
      const fileRanges = diffLineRanges[comment.file];
      if (fileRanges && fileRanges.has(comment.line)) {
        inlineComments.push(comment);
      } else {
        summaryIssues.push(comment);
      }
    }

    // Append non-diff issues to the summary so they are never lost
    if (summaryIssues.length > 0) {
      const issueList = summaryIssues
        .map(i => `- \`${i.file}:${i.line}\` **[${i.severity.toUpperCase()}]**: ${i.comment}`)
        .join("\n");
      reviewData.summary += `\n\n### Issues in existing code (outside diff)\n${issueList}`;
    }

    // Only inline-commentable issues go into the comments array
    reviewData.comments = inlineComments;

    fs.writeFileSync("review_result.json", JSON.stringify(reviewData, null, 2));
    fs.writeFileSync("review_verdict.txt", reviewData.verdict);

    console.log(`Verdict: ${reviewData.verdict}`);
    console.log(`Inline comments: ${inlineComments.length}, Summary issues: ${summaryIssues.length}`);
  } catch (err) {
    console.error("AI Agent Error:", err.message);
    const eslintFindings = parseEslintFindings();
    const errorResult = {
      summary: "⚠️ AI review failed. ESLint findings attached.",
      verdict: eslintFindings.length > 0 ? "REJECTED" : "ERROR",
      comments: eslintFindings,
    };
    fs.writeFileSync("review_result.json", JSON.stringify(errorResult, null, 2));
    fs.writeFileSync("review_verdict.txt", errorResult.verdict);
  }
}

run();
