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
You are a senior software engineer reviewing a PR.

Analyze this:

--- GIT DIFF ---
${diff}

--- FULL CONTEXT ---
${context}

Return ONLY in this format:

## 🐞 Bugs
- ...

## 🔐 Security
- ...

## ⚡ Performance
- ...

## 🧠 Summary
...
          `,
        },
      ],
      temperature: 0.2,
    });

    const review = response.choices?.[0]?.message?.content || "⚠️ No response from AI";

    // IMPORTANT: ALWAYS output something
    process.stdout.write(review);

  } catch (err) {
    console.error("AI Agent Error:", err.message);
    process.stdout.write("⚠️ AI review failed due to error.");
  }
}

run();