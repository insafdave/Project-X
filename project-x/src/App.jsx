import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./App.css";

const systems = [
  "NEURAL CORE",
  "VISUAL SYSTEM",
  "VOICE SYSTEM",
  "GESTURE SYSTEM",
];

function App() {
  const [progress, setProgress] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);

          setTimeout(() => {
            setBootComplete(true);
          }, 700);

          return 100;
        }

        return prev + 1;
      });
    }, 25);

    return () => clearInterval(timer);
  }, []);

  const openPanel = (panel) => {
    setActivePanel(panel);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "AI SERVER OFFLINE",
        },
      ]);
    }
  };

  const startVoiceCommand = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceText("VOICE API NOT SUPPORTED");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText("LISTENING...");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();

      setVoiceText(text);

      if (
        text.includes("open projects") ||
        text.includes("show projects") ||
        text.includes("projects")
      ) {
        setActivePanel("PROJECTS");
      } else if (
        text.includes("open system") ||
        text.includes("system status") ||
        text.includes("system")
      ) {
        setActivePanel("SYSTEM");
      } else if (
        text.includes("open neural") ||
        text.includes("neural core") ||
        text.includes("ai")
      ) {
        setActivePanel("NEURAL");
      } else if (text.includes("open command") || text.includes("voice")) {
        setActivePanel("COMMAND");
      } else if (
        text.includes("close") ||
        text.includes("exit") ||
        text.includes("go back")
      ) {
        setActivePanel(null);
      } else if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
      ) {
        setVoiceText("HELLO, INSAF. SYSTEM READY.");
      } else {
        setVoiceText(`UNKNOWN COMMAND: ${text}`);
      }
      setTimeout(() => {
        setVoiceText("COMMAND EXECUTED");
      }, 1200);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceText("VOICE ERROR");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <main className="system">
      <div className="grid" />

      <AnimatePresence mode="wait">
        {!bootComplete ? (
          <motion.section
            key="boot"
            className="boot"
            exit={{
              opacity: 0,
              scale: 1.2,
              filter: "blur(15px)",
            }}
          >
            <p className="label">PROJECT X</p>

            <h1>INITIALIZING...</h1>

            <div className="status">
              {systems.map((system, index) => (
                <p key={system}>
                  {system} ........{" "}
                  <span>
                    {progress >= (index + 1) * 25 ? "ONLINE" : "LOADING"}
                  </span>
                </p>
              ))}
            </div>

            <div className="progress-container">
              <motion.div
                className="progress-bar"
                animate={{ width: `${progress}%` }}
              />
            </div>

            <p className="percentage">{progress}%</p>

            {progress === 100 && (
              <motion.p
                className="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                WELCOME, INSAF.
              </motion.p>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="dashboard"
            className="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <header className="topbar">
              <div>
                <p className="project-name">PROJECT X</p>
                <p className="system-status">● SYSTEM ONLINE</p>
              </div>

              <div className="time">{new Date().toLocaleTimeString()}</div>
            </header>

            <div className="dashboard-grid">
              <button className="panel" onClick={() => openPanel("NEURAL")}>
                <span>01</span>
                <h2>NEURAL CORE</h2>
                <p>AI SYSTEM</p>
              </button>

              <button className="panel" onClick={() => openPanel("PROJECTS")}>
                <span>02</span>
                <h2>PROJECTS</h2>
                <p>ACTIVE PROJECTS</p>
              </button>

              <button className="panel" onClick={() => openPanel("SYSTEM")}>
                <span>03</span>
                <h2>SYSTEM</h2>
                <p>DEVICE STATUS</p>
              </button>

              <button className="panel" onClick={() => openPanel("COMMAND")}>
                <span>04</span>
                <h2>COMMAND</h2>
                <p>VOICE INTERFACE</p>
              </button>
            </div>

            <div className="center-core">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: 360,
                }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                  },
                  rotate: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              >
                ◉
              </motion.div>

              <p>PROJECT X CORE</p>
            </div>

            <AnimatePresence>
              {activePanel && (
                <motion.div
                  className="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="neural-panel"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <button
                      className="close"
                      onClick={() => setActivePanel(null)}
                    >
                      ×
                    </button>

                    {activePanel === "NEURAL" && (
                      <>
                        <p className="panel-label">NEURAL CORE</p>

                        <div className="ai-orb">
                          <motion.div
                            animate={{
                              scale: [1, 1.3, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          >
                            ◉
                          </motion.div>
                        </div>

                        <h2>AI CORE ONLINE</h2>

                        <div className="chat-box">
                          {chatMessages.map((chat, index) => (
                            <div
                              key={index}
                              className={`chat-message ${chat.role}`}
                            >
                              <span>
                                {chat.role === "user" ? "USER" : "PROJECT X"}
                              </span>

                              <p>{chat.text}</p>
                            </div>
                          ))}
                        </div>

                        <input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Enter command..."
                        />

                        <button className="send" onClick={sendMessage}>
                          EXECUTE
                        </button>
                      </>
                    )}

                    {activePanel === "PROJECTS" && (
                      <>
                        <p className="panel-label">PROJECT DATABASE</p>

                        <h2>ACTIVE PROJECTS</h2>

                        <div className="project-list">
                          <p>01 — HAND CONTROLLER</p>
                          <p>02 — AI ASSISTANT</p>
                          <p>03 — PROJECT X</p>
                          <p>04 — PORTFOLIO</p>
                        </div>
                      </>
                    )}

                    {activePanel === "SYSTEM" && (
                      <>
                        <p className="panel-label">SYSTEM STATUS</p>

                        <h2>DEVICE ONLINE</h2>

                        <div className="system-info">
                          <p>CPU ........ ACTIVE</p>
                          <p>MEMORY ..... STABLE</p>
                          <p>NETWORK .... CONNECTED</p>
                          <p>SECURITY ... ENABLED</p>
                        </div>
                      </>
                    )}

                    {activePanel === "COMMAND" && (
                      <>
                        <p className="panel-label">COMMAND CENTER</p>

                        <h2>VOICE INTERFACE</h2>

                        <motion.button
                          className={`voice-core ${
                            isListening ? "listening" : ""
                          }`}
                          onClick={startVoiceCommand}
                          animate={
                            isListening
                              ? {
                                  scale: [1, 1.15, 1],
                                }
                              : {}
                          }
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                          }}
                        >
                          🎙
                        </motion.button>

                        <p className="voice-status">
                          {isListening ? "LISTENING..." : "TAP TO SPEAK"}
                        </p>

                        <div className="voice-output">
                          {voiceText || "Awaiting command..."}
                        </div>

                        <p className="voice-hint">Try saying: "Something..."</p>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
