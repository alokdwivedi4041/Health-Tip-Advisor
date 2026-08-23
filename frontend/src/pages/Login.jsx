import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      localStorage.setItem("token", response.data.access_token);
      navigate("/chat");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left branding panel */}
        <div className="auth-brand">
          <div className="auth-logo">💚</div>
          <h1>
            Health Tips <br />
            <span>Advisor</span>
          </h1>
          <p className="auth-tagline">Your wellness, our priority.</p>

          <div className="auth-feature">
            <div className="auth-feature-icon">🌿</div>
            <div>
              <h4>Personalized Advice</h4>
              <p>Get tips tailored to your daily health goals.</p>
            </div>
          </div>

          <div className="auth-feature">
            <div className="auth-feature-icon">🛡️</div>
            <div>
              <h4>Trusted &amp; Safe</h4>
              <p>Reliable information from health experts.</p>
            </div>
          </div>

          <div className="auth-feature">
            <div className="auth-feature-icon">📈</div>
            <div>
              <h4>Track Progress</h4>
              <p>Monitor your habits and improve every day.</p>
            </div>
          </div>

          <p className="auth-quote">“Small daily choices lead to a healthier you.”</p>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <h2>Welcome back 👋</h2>
          <p>Login to continue to Health Tips Advisor</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <div className="auth-input-wrap">
                <span>📧</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <span>🔒</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Login →
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;