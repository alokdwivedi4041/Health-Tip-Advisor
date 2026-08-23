import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import QuickReplies from "../components/QuickReplies";

function Chat() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  // Load all sessions when the page first loads
  useEffect(() => {
    loadSessions();
  }, []);

  // Whenever the selected session changes, load its history
  useEffect(() => {
    if (currentSessionId) {
      loadHistory(currentSessionId);
    }
  }, [currentSessionId]);

  const loadSessions = async () => {
    try {
      const response = await api.get("/sessions");
      setSessions(response.data);

      // If there are existing sessions, open the most recent one
      if (response.data.length > 0) {
        setCurrentSessionId(response.data[0].id);
      } else {
        // No sessions yet — create the first one automatically
        await handleNewChat();
      }
    } catch (err) {
      setError("Not authorized. Please login again.");
    } finally {
      setPageLoading(false);
    }
  };

  const loadHistory = async (sessionId) => {
    try {
      const response = await api.get(`/history/${sessionId}`);
      setMessages(response.data);
    } catch (err) {
      setError("Could not load chat history.");
    }
  };
  const handleFeedback = async (messageId, rating) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, userRating: rating } : m))
    );

    try {
      await api.post("/feedback", { message_id: messageId, rating });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, userRating: undefined } : m
        )
      );
        setError("Could not save feedback.");
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await api.post("/session");
      const newSession = response.data;
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
    } catch (err) {
      setError("Could not start a new chat.");
    }
  };

  const handleSend = async (overrideText) => {
    const textToSend = overrideText ?? inputText;
    if (!textToSend.trim() || !currentSessionId) return;

    
    setInputText("");
    setSending(true);

    // Show the user's message immediately (optimistic update)
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      content: textToSend,
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await api.post("/chat", {
        session_id: currentSessionId,
        message: textToSend,
      });

      const aiMessage = {
         id: response.data.ai_message_id,
        sender: "ai",
        content: response.data.ai_response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div style={{ margin: "50px" }}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (pageLoading) {
    return <div style={{ margin: "50px" }}>Loading MindBot...</div>;
  }

  return (
    <div>
      <Navbar onNewChat={handleNewChat} />

      <div style={{ display: "flex" }}>
        {/* Sidebar: list of past sessions */}
        <div style={{ width: "200px", borderRight: "1px solid #ccc", padding: "10px" }}>
          <h4>Past Chats</h4>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setCurrentSessionId(s.id)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: s.id === currentSessionId ? "#eee" : "transparent",
              }}
            >
              Chat #{s.id}
            </div>
          ))}
        </div>

        {/* Main chat area */}
        <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", height: "80vh" }}>
          <h4>Session #{currentSessionId}</h4>

          <div style={{ flex: 1, overflowY: "auto", marginBottom: "10px" }}>
            {messages.length === 0 && <p>No messages yet. Say hello!</p>}
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: "10px" }}>
                <strong>{m.sender === "user" ? "You" : "MindBot"}:</strong> {m.content}
                 {m.sender === "ai" && typeof m.id === "number" && (
      <div style={{ marginTop: "4px" }}>
        <button
          onClick={() => handleFeedback(m.id, 1)}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            opacity: m.userRating === 1 ? 1 : 0.4,
          }}
        >
          👍
        </button>

        <button
          onClick={() => handleFeedback(m.id, -1)}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            opacity: m.userRating === -1 ? 1 : 0.4,
          }}
        >
          👎
        </button>
      </div>
    )}
              </div>
            ))}
            {sending && <p style={{ color: "#888" }}><em>MindBot is typing...</em></p>}
          </div>
          <QuickReplies onSelect={(text) => handleSend(text)} disabled={sending} />
          <div style={{ display: "flex" }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a health question..."
              style={{ flex: 1, padding: "8px" }}
              disabled={sending}
            />
            <button onClick={handleSend} disabled={sending} style={{ marginLeft: "8px" }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;