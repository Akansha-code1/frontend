import React, { useState } from "react";
import "./Auth.css";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.toLowerCase(),
          password,
          role,
          branch,
          year,
          semester,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup success ✅");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">

      {/* LEFT SIDE */}
      <motion.div
        className="auth-left"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <img src="/login-illustration.png.svg" alt="signup" />
        <h1>Join UniTrack 🚀</h1>
        <p>Start your productivity journey today</p>
      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        className="auth-right"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="auth-card">
          <h2>Create Account ✨</h2>

          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full Name"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* ROLE */}
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student 🎓</option>
              <option value="teacher">Teacher 👨‍🏫</option>
            </select>

            {/* STUDENT EXTRA */}
            {role === "student" && (
              <div className="extra-fields">
                <select value={branch} onChange={(e) => setBranch(e.target.value)} required>
                  <option value="">Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="ME">ME</option>
                  <option value="EE">EE</option>
                  <option value="CE">CE</option>
                </select>

                <select value={year} onChange={(e) => setYear(e.target.value)} required>
                  <option value="">Year</option>
                  <option value="1">1st</option>
                  <option value="2">2nd</option>
                  <option value="3">3rd</option>
                </select>

                <select value={semester} onChange={(e) => setSemester(e.target.value)} required>
                  <option value="">Semester</option>
                  <option value="1">Sem 1</option>
                  <option value="2">Sem 2</option>
                  <option value="3">Sem 3</option>
                  <option value="4">Sem 4</option>
                  <option value="5">Sem 5</option>
                  <option value="6">Sem 6</option>
                </select>
              </div>
            )}

            <button type="submit">Sign Up</button>
          </form>

          <button className="google-btn">
            Continue with Google
          </button>

          <p>
            Already have account? <Link to="/login">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;