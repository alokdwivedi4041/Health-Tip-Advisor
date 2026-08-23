import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

function Navbar({ onNewChat }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="chat-navbar">
      <h3>
        Health Tips <span>Advisor</span>
      </h3>
      <div className="chat-navbar-actions">
        <button className="new-chat-btn" onClick={onNewChat}>
          + New Chat
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;