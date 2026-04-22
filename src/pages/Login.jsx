import React, { useState, useEffect } from "react";
import "./Auth.css";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* AUTO LOGIN */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      if (role === "teacher") navigate("/teacher");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    }
  }, [navigate]);

  /* LOGIN */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("role", data.user.role);

        if (data.user.role === "teacher") navigate("/teacher");
        else if (data.user.role === "admin") navigate("/admin");
        else navigate("/");

        window.location.reload();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="bg-glow" />

      <div className="auth-container">
        {/* LEFT SIDE */}
        <motion.div
          className="auth-left"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/login-illustration.png.svg" alt="illustration" />

          <h1>Welcome to UniTrack</h1>
          <p>Track tasks. Boost productivity. Win your day 🚀</p>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          className="auth-right"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-card">
            <h2>Welcome Back 👋</h2>

            {error && <p className="form-error">{error}</p>}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className="auth-btn primary"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <button className="auth-btn google" disabled={loading}>
              Continue with Google
            </button>

            <p className="auth-text">
              Don’t have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
