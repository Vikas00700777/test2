import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function reviewCode(code) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a code reviewer. Format response with emojis: 🐛 Bugs, ⚡ Improvements, ✅ Best Practices, 🔒 Security, 📝 Fixed Code. Be concise." },
        { role: "user", content: `Review:\n${code}` }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return (await response.json()).choices[0].message.content;
}

app.post("/review", async (req, res) => {
  try {
    if (!req.body.code) return res.status(400).json({ error: "No code" });
    res.json({ review: await reviewCode(req.body.code) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("✅ Server running"));