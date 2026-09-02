import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/admin.css";

function Admin() {
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, topicsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/topics"),
      ]);
      setStats(statsRes.data);
      setTopics(topicsRes.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have admin access.");
      } else {
        setError("Could not load admin data.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Navbar onNewChat={() => {}} />
        <p className="admin-loading">Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <Navbar onNewChat={() => {}} />
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.total_users },
    { label: "Total Sessions", value: stats.total_sessions },
    { label: "Total Messages", value: stats.total_messages },
    { label: "👍 Positive Feedback", value: stats.positive_feedback, cls: "positive" },
    { label: "👎 Negative Feedback", value: stats.negative_feedback, cls: "negative" },
    { label: "Average Rating", value: stats.average_rating ?? "N/A" },
  ];

  return (
    <div className="admin-page">
      <Navbar onNewChat={() => {}} />

      <div className="admin-content">
        <h2>Admin Analytics</h2>

        <div className="admin-stats-grid">
          {statCards.map((card) => (
            <div key={card.label} className={`admin-stat-card ${card.cls || ""}`}>
              <div className="admin-stat-label">{card.label}</div>
              <div className="admin-stat-value">{card.value}</div>
            </div>
          ))}
        </div>

        <h3>Common Topics</h3>
        <div className="admin-table-wrap">
          {topics.length === 0 ? (
            <p style={{ color: "#7c8b9a", padding: "20px" }}>No topic data yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t) => (
                  <tr key={t.topic}>
                    <td>{t.topic}</td>
                    <td>{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;