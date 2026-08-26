const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  console.log("USER:", message);

  res.json({
    reply: `PROJECT X received: ${message}`,
  });
});

app.listen(5000, () => {
  console.log("PROJECT X AI SERVER ONLINE");
});