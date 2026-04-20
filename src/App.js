import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Subjects from "./pages/Subjects";
import Timetable from "./pages/Timetable";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import CalendarView from "./components/CalendarView";
import FocusMode from "./pages/FocusMode";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import TeacherTasks from "./components/TeacherTasks";
import TeacherDashboard from "./pages/TeacherDashboard";
import Leaderboard from "./pages/Leaderboard";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({ email: "", role: "" });

  const token = localStorage.getItem("token");

  /* ================= DARK MODE ================= */
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    if (token) {
      const role = (localStorage.getItem("role") || "").toLowerCase(); // ✅ fix
      const email = localStorage.getItem("userEmail");
      setUser({ email, role });
    }
  }, [token]);

  /* ================= NOTIFICATIONS (FIXED PROPERLY) ================= */
  useEffect(() => {
    if (!token || !user.email || !user.role) return; // ✅ prevent early run

    fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((tasks) => {
        const today = new Date().toISOString().split("T")[0];
        let notes = [];

        /* ================= STUDENT ================= */
        if (user.role === "student") {
          const overdue = tasks.filter((t) => {
            const sub = t.studentSubmissions?.find(
              (s) => s.studentEmail === user.email
            );

            return (
              t.deadline &&
              (!sub || !sub.submitted) &&
              new Date(t.deadline) < new Date()
            );
          });

          const todayTasks = tasks.filter(
            (t) => t.deadline === today
          );

          if (overdue.length > 0)
            notes.push(`⚠️ ${overdue.length} overdue tasks`);

          if (todayTasks.length > 0)
            notes.push(`📅 ${todayTasks.length} tasks today`);
        }

        /* ================= TEACHER ================= */
        else if (user.role === "teacher") {
          const pendingReviews = tasks.reduce(
            (acc, t) => acc + (t.studentSubmissions?.length || 0),
            0
          );

          if (pendingReviews > 0)
            notes.push(`📝 ${pendingReviews} submissions to review`);
        }

        setNotifications(notes);
      })
      .catch(() => {});
  }, [token, user]); // ✅ FIXED DEPENDENCY

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.clear();
    setUser({ email: "", role: "" });
    window.location.href = "/login";
  };

  /* ================= PROTECTED ================= */
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  /* ================= ROLE REDIRECT ================= */
  const HomeRedirect = () => {
    if (user.role === "teacher") return <Navigate to="/teacher" />;
    if (user.role === "admin") return <Navigate to="/admin" />;
    return <Dashboard />;
  };

  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PROTECTED WRAPPER */}
        <Route
          path="/*"
          element={
            token ? (
              <div className="app-layout">

                <Sidebar
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  notifications={notifications}
                  logout={logout}
                  userRole={user.role}
                />

                <div className="main-content">

                  {/* ALERTS */}
                  {notifications.length > 0 && (
                    <div className="global-alert">
                      {notifications.map((n, i) => (
                        <p key={i}>{n}</p>
                      ))}
                    </div>
                  )}

                  <Routes>

                    {/* HOME */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <HomeRedirect />
                        </ProtectedRoute>
                      }
                    />

                    {/* STUDENT TASKS */}
                    <Route
                      path="/tasks"
                      element={
                        <ProtectedRoute>
                          <Tasks userEmail={user.email} />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
                    <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
                    <Route path="/focus" element={<FocusMode />} />

                    {/* TEACHER */}
                    <Route
                      path="/teacher"
                      element={
                        <ProtectedRoute>
                          <TeacherDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/teacher-tasks"
                      element={
                        <ProtectedRoute>
                          <TeacherTasks />
                        </ProtectedRoute>
                      }
                    />

                    {/* LEADERBOARD */}
                    <Route
                      path="/leaderboard"
                      element={
                        <ProtectedRoute>
                          <Leaderboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* ADMIN */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />

                    {/* FALLBACK */}
                    <Route path="*" element={<Navigate to="/" />} />

                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;