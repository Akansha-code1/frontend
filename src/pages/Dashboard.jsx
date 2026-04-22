import React, { useEffect, useState } from "react";
import "./Dashboard.css";

import { Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail");
  const role = localStorage.getItem("role");

  const isStudent = role === "student";

  /* ================= FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getSubmission = (task) =>
    (task.studentSubmissions || []).find(
      (s) =>
        s.studentEmail?.toLowerCase().trim() ===
        userEmail?.toLowerCase().trim()
    );

  /* ================= STATS ================= */
  const total = tasks.length;

  const completed = isStudent
    ? tasks.filter((t) => getSubmission(t)?.submitted).length
    : 0;

  const pending = isStudent ? total - completed : 0;

  const overdue = isStudent
    ? tasks.filter((t) => {
        const sub = getSubmission(t);
        return t.deadline && !sub?.submitted && new Date(t.deadline) < new Date();
      }).length
    : 0;

  const completionRate =
    isStudent && total > 0 ? Math.round((completed / total) * 100) : 0;

  /* ================= SUBJECT ================= */
  const subjectCount = {};
  tasks.forEach((t) => {
    const sub = t.subject || "General";
    subjectCount[sub] = (subjectCount[sub] || 0) + 1;
  });

  const subjectData = {
    labels: Object.keys(subjectCount),
    datasets: [
      {
        data: Object.values(subjectCount),
        backgroundColor: ["#6366f1", "#ec4899", "#10b981", "#f59e0b"],
      },
    ],
  };

  /* ================= WEEKLY (FIXED SMALL BAR) ================= */
  const weekCounts = [0, 0, 0, 0, 0, 0, 0];

  tasks.forEach((t) => {
    if (t.deadline) {
      const day = new Date(t.deadline).getDay();
      weekCounts[day]++;
    }
  });

  const weeklyData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Tasks",
        data: weekCounts,
        backgroundColor: "#6366f1",
        borderRadius: 6,
      },
    ],
  };

  /* ================= PIE ================= */
  const pieData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="title">
        {isStudent ? "Student Dashboard 👋" : "Teacher Dashboard 👨‍🏫"}
      </h1>

      <p className="subtitle">Your productivity insights</p>

      {/* STATS */}
      {isStudent && (
        <div className="stats">
          <div className="stat-card">
            <h3>{total}</h3>
            <p>Total Tasks</p>
          </div>

          <div className="stat-card success">
            <h3>{completed}</h3>
            <p>Completed</p>
          </div>

          <div className="stat-card warning">
            <h3>{pending}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-card danger">
            <h3>{overdue}</h3>
            <p>Overdue</p>
          </div>
        </div>
      )}

      {/* AI BOX */}
      <div className="alert-box">
        <h3>
          {overdue > 0
            ? `⚠️ ${overdue} overdue tasks`
            : completionRate > 80
            ? "🎉 Great progress!"
            : "📊 Keep going!"}
        </h3>
      </div>

      {/* CHARTS */}
      <div className="dashboard-grid">

        <div className="card fixed-card">
          <h3>📊 Overview</h3>
          <Pie data={pieData} />
        </div>

        <div className="card fixed-card">
          <h3>📚 Subjects</h3>
          <Doughnut data={subjectData} />
        </div>

        {/* SIMPLE PROGRESS (NO CIRCLE) */}
       {isStudent && (
  <div className="card progress-card">
    <h3>📈 Progress</h3>

    <p>{completionRate}% completed</p>

    <div className="progress-bar-line">
      <div
        className="progress-line-fill"
        style={{ width: `${completionRate}%` }}
      />
    </div>
  </div>
)}
      </div>

      {/* WEEKLY (SMALL FIXED CHART) */}
      <div className="card small-card">
        <h3>📅 Weekly Activity</h3>
        
        <div className="card small-card weekly-card">
  

  <div className="weekly-wrapper">
    <Bar
      data={weeklyData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      }}
    />
  </div>
</div>
      </div>
    </div>
  );
}

export default Dashboard;