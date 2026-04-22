import React, { useEffect, useState } from "react";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    const email = localStorage.getItem("userEmail") || "No email";
    const role = localStorage.getItem("role") || "student";

    setUser({ name, email, role });
  }, []);

  const initial = user.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="profile-container">

      <div className="profile-card">

        <div className="avatar">{initial}</div>

        <h2 className="name">{user.name}</h2>
        <p className="email">{user.email}</p>

        <span className={`role-badge ${user.role}`}>
          {user.role}
        </span>

        <button
          className="edit-btn"
          onClick={() => (window.location.href = "/settings")}
        >
          Edit Profile
        </button>

      </div>

    </div>
  );
}

export default Profile;