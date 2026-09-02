const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Ollama } = require("ollama");

const app = express();

app.use(cors());
app.use(express.json());

const ollama = new Ollama({
  host: "http://127.0.0.1:11434",
});

const memoryFile = path.join(__dirname, "memory.json");

function loadMemory() {
  try {
    return JSON.parse(fs.readFileSync(memoryFile, "utf8"));
  } catch {
    return { memories: [] };
  }
}

function saveMemory(data) {
  fs.writeFileSync(
    memoryFile,
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;

  console.log("USER:", message);

  try {
    const memory = loadMemory();

    // Ask Ollama to extract important information
    const memoryCheck = await ollama.chat({
      model: "llama3.2:3b",
      messages: [
        {
          role: "system",
          content: `
You are the memory system of PROJECT X.

Extract useful personal information from the user's message.

Save things such as:
- name
- education
- college
- programming languages
- skills
- projects
- hobbies
- preferences
- goals
- location
- other useful long-term information

Return ONLY the important information as a short statement.

Examples:

User: My name is Insaf
Output: User's name is Insaf

User: I am studying Computer Science
Output: User is studying Computer Science

User: I love Python
Output: User likes Python

User: What is the weather today?
Output: NONE

If there is nothing worth remembering, return:
NONE
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const newMemory = memoryCheck.message.content.trim();

    console.log("MEMORY CHECK:", newMemory);

    if (
      newMemory.toUpperCase() !== "NONE" &&
      newMemory.length > 2 &&
      newMemory.length < 300
    ) {
      if (!memory.memories.includes(newMemory)) {
        memory.memories.push(newMemory);
        saveMemory(memory);

        console.log("MEMORY SAVED:", newMemory);
      }
    }

    // Build AI conversation
    const messages = [
      {
        role: "system",
        content: `
You are PROJECT X, a futuristic personal AI assistant.

Personality:
- Intelligent
- Calm
- Professional
- Slightly futuristic
- Helpful
- Concise

Important memories about the user:

${memory.memories.join("\n")}

Use these memories naturally when relevant.
Never invent memories.
        `,
      },

      ...history.map((chat) => ({
        role: chat.role === "user" ? "user" : "assistant",
        content: chat.text,
      })),

      {
        role: "user",
        content: message,
      },
    ];

    const response = await ollama.chat({
      model: "llama3.2:3b",
      messages,
    });

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
  console.log("PROJECT X AI SERVER ONLINE");
});