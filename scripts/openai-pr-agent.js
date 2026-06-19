const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  try {
    const diff = fs.readFileSync("diff.txt", "utf8");
    const context = fs.readFileSync("full_context.txt", "utf8");

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
You are a senior software engineer performing a strict code review.

Analyze the pull request diff below and return a JSON review.

--- GIT DIFF ---
${diff}

--- FULL CONTEXT ---
${context}

INSTRUCTIONS:
- Read the diff carefully. Each hunk header looks like: @@ -oldStart,oldCount +newStart,newCount @@
- Use these headers to calculate the exact line number in the NEW version of each file.
- Only comment on lines that are added (lines starting with +) in the diff.
- The "file" field must exactly match the path after "b/" in the diff header (e.g. "src/app.js").
- The "line" field must be the absolute line number in the new version of the file.

Respond with ONLY a valid JSON object — no markdown, no explanation:

{
  "summary": "string — brief overall summary of the PR",
  "verdict": "APPROVED" or "REJECTED",
  "comments": [
    {
      "file": "relative/path/to/file.js",
      "line": <integer line number in the new file>,
      "severity": "bug" | "security" | "performance" | "suggestion",
      "comment": "Detailed explanation of the issue on this line"
    }
  ]
}

Verdict rules:
- "REJECTED" if any comment has severity "bug"
- "APPROVED" if no bugs found (security/performance/suggestion comments alone do not reject)
- If no issues at all, return empty comments array and "APPROVED"
          `,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices?.[0]?.message?.content || "{}";

    let reviewData;
    try {
      reviewData = JSON.parse(rawContent);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", e.message);
      reviewData = {
        summary: "⚠️ AI returned invalid JSON. Manual review required.",
        verdict: "UNKNOWN",
        comments: [],
      };
    }

    reviewData.verdict = reviewData.verdict || "UNKNOWN";
    reviewData.summary = reviewData.summary || "No summary provided.";
    reviewData.comments = Array.isArray(reviewData.comments) ? reviewData.comments : [];

    fs.writeFileSync("review_result.json", JSON.stringify(reviewData, null, 2));
    fs.writeFileSync("review_verdict.txt", reviewData.verdict);

    console.log(`Verdict: ${reviewData.verdict}`);
    console.log(`Inline comments: ${reviewData.comments.length}`);
  } catch (err) {
    console.error("AI Agent Error:", err.message);
    const errorResult = {
      summary: "⚠️ AI review failed. Please review manually.",
      verdict: "ERROR",
      comments: [],
    };
    fs.writeFileSync("review_result.json", JSON.stringify(errorResult, null, 2));
    fs.writeFileSync("review_verdict.txt", "ERROR");
  }
}

run();
