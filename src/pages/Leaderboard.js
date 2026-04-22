import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        console.log("Error fetching leaderboard");
        setLoading(false);
      });
  }, []);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="leaderboard-container">
        <h2>Loading Leaderboard...</h2>
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (data.length === 0) {
    return (
      <div className="leaderboard-container">
        <h2>No leaderboard data available</h2>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2 className="title">
        {role === "teacher"
          ? "📊 Class Performance"
          : "🏆 Leaderboard"}
      </h2>

      {/* 🥇 TOP 3 */}
      <div className="top3">
        {top3.map((user, index) => (
          <div className={`podium rank-${index + 1}`} key={index}>
            <h3>#{index + 1}</h3>
            <p className="name">{user.name}</p>
            <span className="badge">{user.badge}</span>
            <p className="xp">⚡ {user.xp} XP</p>
          </div>
        ))}
      </div>

      {/* 📋 REST LIST */}
      <div className="leaderboard-list">
        {rest.length === 0 ? (
          <p className="empty-text">No more students</p>
        ) : (
          rest.map((user, index) => (
            <div className="leaderboard-card" key={index}>
              <div className="card-header">
                <h3>
                  #{index + 4} {user.name}
                </h3>
                <span className="badge">{user.badge}</span>
              </div>

              <div className="stats-row">
                <span>🎯 {user.grade || "N/A"}</span>
                <span>📊 {user.completion || 0}%</span>
                <span>⚡ {user.xp}</span>
              </div>

              <div className="progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${user.completion || 0}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}