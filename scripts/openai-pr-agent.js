const fs = require("fs");
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function run() {
  const diff = fs.readFileSync("diff.txt", "utf8");
  const context = fs.readFileSync("full_context.txt", "utf8");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `
You are a senior engineer reviewing a PR.

GIT DIFF:
${diff}

FULL CONTEXT:
${context}

Return a clean human-readable PR review:
- Bugs
- Security issues
- Performance issues
- Summary
        `,
      },
    ],
    temperature: 0.2,
  });

  const review = response.choices[0].message.content;

  // ⚠️ IMPORTANT: print ONLY final output
  process.stdout.write(review);
}

run();