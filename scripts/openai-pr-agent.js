const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

function loadAgentInstructions(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf8");
  // Strip YAML frontmatter (--- ... ---) — that section is for VS Code Copilot only
  return raw.replace(/^---[\s\S]*?---\n/, "").trim();
}

function parseEslintFindings() {
  try {
    const raw = fs.readFileSync("eslint_output.json", "utf8");
    const results = JSON.parse(raw);
    const findings = [];
    const cwd = process.cwd().replace(/\\/g, "/").replace(/\/?$/, "/");

    for (const fileResult of results) {
      const relPath = fileResult.filePath
        .replace(/\\/g, "/")
        .replace(cwd, "");

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
    console.error("ESLint parse error:", e.message);
    return [];
  }
}

async function run() {
  try {
    const instructions = loadAgentInstructions(".github/agents/pr-review-agent.md");
    const diff    = fs.readFileSync("diff.txt", "utf8");
    const context = fs.readFileSync("full_context.txt", "utf8");

    const eslintFindings = parseEslintFindings();
    const eslintSummary  = eslintFindings.length
      ? eslintFindings.map(f => `- ${f.file}:${f.line} — ${f.comment}`).join("\n")
      : "No ESLint errors found.";

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `${instructions}

--- GIT DIFF ---
${diff}

--- FULL FILE CONTENT ---
${context}

--- ESLINT FINDINGS (confirmed bugs, always include) ---
${eslintSummary}
          `,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
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
    reviewData.summary  = reviewData.summary  || "No summary.";
    reviewData.comments = Array.isArray(reviewData.comments) ? reviewData.comments : [];

    // Merge ESLint findings — deduplicate by file+line
    const seen = new Set(reviewData.comments.map(c => `${c.file}:${c.line}`));
    for (const f of eslintFindings) {
      if (!seen.has(`${f.file}:${f.line}`)) {
        reviewData.comments.push(f);
      }
    }

    // ESLint errors always force rejection
    if (eslintFindings.length > 0) {
      reviewData.verdict = "REJECTED";
    } else if (reviewData.comments.some(c => c.severity === "bug" || c.severity === "security")) {
      reviewData.verdict = "REJECTED";
    }

    fs.writeFileSync("review_result.json", JSON.stringify(reviewData, null, 2));
    fs.writeFileSync("review_verdict.txt", reviewData.verdict);

    console.log(`Verdict: ${reviewData.verdict}`);
    console.log(`Total comments: ${reviewData.comments.length} (ESLint: ${eslintFindings.length})`);
    console.log("Comments:", JSON.stringify(reviewData.comments, null, 2));
  } catch (err) {
    console.error("AI Agent Error:", err.message);
    console.error("Error status:", err.status || "n/a");
    console.error("Error type:", err.constructor?.name || "unknown");
    const eslintFindings = parseEslintFindings();
    const errorResult = {
      summary: "⚠️ AI review failed. Showing ESLint findings only.",
      verdict: eslintFindings.length > 0 ? "REJECTED" : "ERROR",
      comments: eslintFindings,
    };
    fs.writeFileSync("review_result.json", JSON.stringify(errorResult, null, 2));
    fs.writeFileSync("review_verdict.txt", errorResult.verdict);
  }
}

run();
