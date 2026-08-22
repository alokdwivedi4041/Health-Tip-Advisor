import { useNavigate } from "react-router-dom";

function Navbar({ onNewChat }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <h3>Health Tips Advisor</h3>

      <div>
        <button onClick={onNewChat} style={{ marginRight: "10px" }}>
          + New Chat
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;