import React, { useEffect, useState } from "react";
import "./Settings.css";

function Settings() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "";
    const email = localStorage.getItem("userEmail") || "";
    const role = localStorage.getItem("role") || "student";
    const theme = localStorage.getItem("darkMode") === "true";

    setUser({ name, email, role });
    setDarkMode(theme);
  }, []);

  /* ================= SAVE ================= */
  const handleSave = () => {
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userEmail", user.email);

    alert("Profile updated");
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ================= THEME ================= */
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
    document.body.className = !darkMode ? "dark" : "";
  };

  return (
    <div className="settings-container">

      <div className="settings-card">

        <h2>Settings</h2>

        {/* NAME */}
        <label>Name</label>
        <input
          type="text"
          value={user.name}
          onChange={(e) =>
            setUser({ ...user, name: e.target.value })
          }
        />

        {/* EMAIL */}
        <label>Email</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) =>
            setUser({ ...user, email: e.target.value })
          }
        />

        {/* ROLE (READ ONLY) */}
        <label>Role</label>
        <input type="text" value={user.role} disabled />

        {/* ROLE BASED INFO */}
        {user.role === "student" && (
          <p className="info-text">
            You are logged in as a Student
          </p>
        )}

        {user.role === "teacher" && (
          <p className="info-text">
            You are logged in as a Teacher
          </p>
        )}

        {/* THEME */}
        <div className="toggle">
          <label>Dark Mode</label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleTheme}
          />
        </div>

        {/* ACTIONS */}
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </div>

    </div>
  );
}

export default Settings;