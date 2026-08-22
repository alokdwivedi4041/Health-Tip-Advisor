import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

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

  if (loading) return <p style={{ margin: "50px" }}>Loading admin data...</p>;

  if (error) {
    return (
      <div>
        <Navbar onNewChat={() => {}} />
        <p style={{ margin: "50px", color: "red" }}>{error}</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.total_users },
    { label: "Total Sessions", value: stats.total_sessions },
    { label: "Total Messages", value: stats.total_messages },
    { label: "👍 Positive Feedback", value: stats.positive_feedback },
    { label: "👎 Negative Feedback", value: stats.negative_feedback },
    { label: "Average Rating", value: stats.average_rating ?? "N/A" },
  ];

  return (
    <div>
      <Navbar onNewChat={() => {}} />

      <div style={{ padding: "20px" }}>
        <h2>Admin Analytics</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "30px" }}>
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                minWidth: "150px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#666" }}>{card.label}</div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>{card.value}</div>
            </div>
          ))}
        </div>

        <h3>Common Topics</h3>

        {topics.length === 0 ? (
          <p>No topic data yet.</p>
        ) : (
          <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "500px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px" }}>
                  Topic
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "8px" }}>
                  Count
                </th>
              </tr>
            </thead>

            <tbody>
              {topics.map((t) => (
                <tr key={t.topic}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                    {t.topic}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                    {t.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;