import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({
  darkMode,
  setDarkMode,
  notifications = [],
  userRole = "student",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  /* 🔥 DYNAMIC DASHBOARD ROUTE */
  const getDashboardPath = () => {
    if (userRole === "teacher") return "/teacher";
    if (userRole === "admin") return "/admin";
    return "/";
  };

  /* 🔥 ROLE BASED MENU */
  /* 🔥 ROLE BASED MENU */
let finalMenu = [];

if (userRole === "teacher") {
  finalMenu = [
    { path: getDashboardPath(), label: "Dashboard", icon: "📊" },
    { path: "/teacher-tasks", label: "Manage Tasks", icon: "🧑‍🏫" },
    { path: "/leaderboard", label: "Leaderboard", icon: "📊" }, // ✅ ADD
    { path: "/calendar", label: "Calendar", icon: "🗓" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];
} else if (userRole === "admin") {
  finalMenu = [
    { path: getDashboardPath(), label: "Admin Panel", icon: "👑" },
    { path: "/leaderboard", label: "Leaderboard", icon: "📊" }, // ✅ ADD
    { path: "/profile", label: "Profile", icon: "👤" },
  ];
} else {
  // 🎓 STUDENT
  finalMenu = [
    { path: getDashboardPath(), label: "Dashboard", icon: "🏠" },
    { path: "/tasks", label: "My Tasks", icon: "📝" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" }, // ✅ ADD
    { path: "/subjects", label: "Subjects", icon: "📚" },
    { path: "/timetable", label: "Timetable", icon: "📅" },
    { path: "/calendar", label: "Calendar", icon: "🗓" },
    { path: "/focus", label: "Focus Mode", icon: "🎯" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];
}

  return (
    <>
      {/* 📱 MOBILE TOGGLE */}
      <button className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </button>

      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* LOGO */}
        <div className="top">
          <h2 className="logo">🎓 UniTrack</h2>
        </div>

        {/* 🔔 NOTIFICATIONS */}
        {notifications.length > 0 && (
          <div className="notification-box">
            <span>🔔</span>
            <span>{notifications.length} Alerts</span>
          </div>
        )}

        {/* MENU */}
        <div className="menu">
          {finalMenu.map((item) => (
            <Link
              to={item.path}
              key={item.path}
              onClick={() => setOpen(false)}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>

              {/* 🔴 ACTIVE DOT */}
              {location.pathname === item.path && (
                <span className="active-dot"></span>
              )}
            </Link>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="bottom">
          {/* 🌙 DARK MODE */}
          <button
            className="toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {/* 👤 PROFILE */}
          <button
            className="profile-btn"
            onClick={() => navigate("/profile")}
          >
            👤 My Profile
          </button>

          {/* 🚪 LOGOUT */}
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}