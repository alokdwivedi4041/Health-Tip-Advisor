import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../services/api";
import Navbar from "../components/Navbar";
import QuickReplies from "../components/QuickReplies";
import "../styles/chat.css";

function Chat() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      loadHistory(currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, sending]);

  const loadSessions = async () => {
    try {
      const response = await api.get("/sessions");
      setSessions(response.data);

      if (response.data.length > 0) {
        setCurrentSessionId(response.data[0].id);
      } else {
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

  const handleFeedback = async (messageId, rating) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, userRating: rating } : m))
    );

    try {
      await api.post("/feedback", { message_id: messageId, rating });
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, userRating: undefined } : m))
      );
      setError("Could not save feedback.");
    }
  };

  const handleSend = async (overrideText) => {
    const textToSend = overrideText ?? inputText;
    if (!textToSend.trim() || !currentSessionId) return;

    setInputText("");
    setSending(true);

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
      <div className="chat-page">
        <p style={{ margin: "50px", color: "#f87171" }}>{error}</p>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="chat-page">
        <p style={{ margin: "50px", color: "#7c8b9a" }}>Loading MindBot...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <Navbar onNewChat={handleNewChat} />

      <div className="chat-layout">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <h4>Past Chats</h4>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setCurrentSessionId(s.id)}
              className={`chat-session-item ${s.id === currentSessionId ? "active" : ""}`}
            >
              Chat #{s.id}
            </div>
          ))}
        </div>

        {/* Main chat area */}
        <div className="chat-main">
          <div className="chat-main-inner">
            <h4>Session #{currentSessionId}</h4>

            <div className="chat-messages">
              {messages.length === 0 && (
                <p className="chat-empty">No messages yet. Say hello!</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`chat-bubble-row ${m.sender}`}>
                  <div>
                    <div className={`chat-bubble ${m.sender}`}>
                      {m.sender === "ai" ? (
                        <div className="markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.sender === "ai" && typeof m.id === "number" && (
                      <div className="chat-feedback">
                        <button
                          onClick={() => handleFeedback(m.id, 1)}
                          style={{ opacity: m.userRating === 1 ? 1 : 0.4 }}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleFeedback(m.id, -1)}
                          style={{ opacity: m.userRating === -1 ? 1 : 0.4 }}
                        >
                          👎
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && <p className="chat-typing">MindBot is typing...</p>}
              <div ref={messagesEndRef} />
            </div>

            <QuickReplies onSelect={(text) => handleSend(text)} disabled={sending} />

            <div className="chat-input-row">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a health question..."
                disabled={sending}
              />
              <button onClick={() => handleSend()} disabled={sending}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;