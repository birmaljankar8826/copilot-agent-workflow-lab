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

Review this pull request carefully.

--- GIT DIFF ---
${diff}

--- FULL CONTEXT ---
${context}

Return a review in this exact format:

## 🐞 Bugs
- List each bug found, or write "None" if no bugs found

## 🔐 Security Issues
- List each security issue, or write "None" if no issues found

## ⚡ Performance Issues
- List each performance issue, or write "None" if no issues found

## 🧠 Summary
Brief summary of the changes and overall code quality.

## ✅ Verdict
Write exactly one of:
- APPROVED — if no bugs were found
- REJECTED — if one or more bugs were found

Rules:
- Only bugs in the "🐞 Bugs" section count toward rejection
- Security and performance issues alone do not cause rejection
          `,
        },
      ],
      temperature: 0.2,
    });

    const review =
      response.choices?.[0]?.message?.content ||
      "⚠️ No AI response generated";

    process.stdout.write(review);

    // Extract verdict from the review output
    const verdictMatch = review.match(/##\s*✅\s*Verdict\s*\n[-\s]*(APPROVED|REJECTED)/i);
    const verdict = verdictMatch ? verdictMatch[1].toUpperCase() : "UNKNOWN";

    fs.writeFileSync("review_verdict.txt", verdict);

  } catch (err) {
    console.error("AI Agent Error:", err.message);
    process.stdout.write("⚠️ AI review failed safely.");
    fs.writeFileSync("review_verdict.txt", "ERROR");
  }
}

run();
