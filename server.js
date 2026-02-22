import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const { messages, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const FREE_LIMIT = 3;

    const user = db.data.users[userId] || {
      count: 0,
      isPro: false
    };

    // If not Pro and limit exceeded
    if (!user.isPro && user.count >= FREE_LIMIT) {
      return res.status(403).json({
        error: "Free limit reached. Upgrade to Chanakya Pro."
      });
    }

    // Increase usage only if not Pro
    if (!user.isPro) {
      user.count += 1;
    }

    db.data.users[userId] = user;
    await db.write();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages
    });

    res.json({
      reply: completion.choices[0].message.content,
      remaining: user.isPro ? "Unlimited" : FREE_LIMIT - user.count
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});