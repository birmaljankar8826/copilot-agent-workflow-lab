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
You are a senior software engineer.

Review this pull request carefully.

--- GIT DIFF ---
${diff}

--- FULL CONTEXT ---
${context}

Return a clean review in this format:

## 🐞 Bugs
- 

## 🔐 Security Issues
- 

## ⚡ Performance Issues
- 

## 🧠 Summary
          `,
        },
      ],
      temperature: 0.2,
    });

    const review =
      response.choices?.[0]?.message?.content ||
      "⚠️ No AI response generated";

    // ALWAYS output safely
    process.stdout.write(review);

  } catch (err) {
    console.error("AI Agent Error:", err.message);
    process.stdout.write("⚠️ AI review failed safely.");
  }
}

run();