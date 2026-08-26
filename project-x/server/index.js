const express = require("express");
const cors = require("cors");
const { Ollama } = require("ollama");

const app = express();

const ollama = new Ollama({
  host: "http://127.0.0.1:11434",
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PROJECT X SERVER ONLINE");
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  console.log("USER:", message);

  try {
    const response = await ollama.chat({
      model: "llama3.2:3b",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    console.log("AI:", response.message.content);

    res.json({
      reply: response.message.content,
    });
  } catch (error) {
    console.error("OLLAMA ERROR:", error);

    res.status(500).json({
      reply: "NEURAL CORE ERROR",
    });
  }
});

app.listen(5000, () => {
  console.log("PROJECT X SERVER ONLINE → http://localhost:5000");
});