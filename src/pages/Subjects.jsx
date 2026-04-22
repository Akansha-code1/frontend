import { useState, useEffect } from "react";
import "./Subjects.css";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");

  const [message, setMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");

  /* ================= GET USER EMAIL ================= */
  const userEmail = localStorage.getItem("userEmail");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem("subjects")) || [];
    setSubjects(savedSubjects);

    if (!userEmail) return;

    fetch("http://localhost:5000/api/tasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch(() => setTasks([]));
  }, [userEmail]);

  /* ================= AI INSIGHTS ================= */
  useEffect(() => {
    if (subjects.length === 0) {
      setAiMessage("📚 Add subjects to organize your study!");
      return;
    }

    const totalTasks = tasks.length;
    const completed = tasks.filter((t) => t.done).length;

    if (totalTasks === 0) {
      setAiMessage("📝 No tasks yet — assign tasks to subjects!");
    } else if (completed === totalTasks) {
      setAiMessage("🏆 All subjects completed — amazing!");
    } else {
      setAiMessage("📊 Track progress per subject to improve!");
    }
  }, [subjects, tasks]);

  /* ================= ADD SUBJECT ================= */
  const addSubject = () => {
    if (!name) return;

    const newSubject = {
      id: Date.now(),
      name,
      color,
    };

    const updated = [...subjects, newSubject];
    setSubjects(updated);
    localStorage.setItem("subjects", JSON.stringify(updated));

    setName("");
    setColor("#6366f1");

    setMessage("Subject added ✅");
    setTimeout(() => setMessage(""), 2000);
  };

  /* ================= DELETE SUBJECT ================= */
  const deleteSubject = (id) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    localStorage.setItem("subjects", JSON.stringify(updated));
  };

  /* ================= CALCULATE PROGRESS ================= */
  const getStats = (subjectName) => {
    const subjectTasks = tasks.filter((t) => t.subject === subjectName);

    const total = subjectTasks.length;
    const done = subjectTasks.filter((t) => t.done).length;

    const percent = total ? Math.round((done / total) * 100) : 0;

    return { total, done, percent };
  };

  /* ================= GLOBAL ANALYTICS ================= */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.done).length;
  const overallProgress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  /* ================= FIND BEST + WEAK SUBJECT ================= */
  let bestSubject = null;
  let weakSubject = null;

  subjects.forEach((s) => {
    const stats = getStats(s.name);

    if (!bestSubject || stats.percent > bestSubject.percent) {
      bestSubject = { name: s.name, percent: stats.percent };
    }

    if (!weakSubject || stats.percent < weakSubject.percent) {
      weakSubject = { name: s.name, percent: stats.percent };
    }
  });

  /* ================= ACHIEVEMENTS ================= */
  const achievements = [];
  if (subjects.length >= 1) achievements.push("📚 First Subject Added");
  if (subjects.length >= 5) achievements.push("🔥 5 Subjects Created");
  if (overallProgress === 100 && totalTasks > 0)
    achievements.push("🏆 All Subjects Completed");

  return (
    <div className="subjects-container">
      <h1>📚 Subjects</h1>
      <p className="subtitle">Organize your academic life</p>

      {/* 🤖 AI MESSAGE */}
      <div className="card">{aiMessage}</div>

      {/* 🏆 ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <div className="card">
          <h3>🏆 Achievements</h3>
          {achievements.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      {/* 📊 OVERALL STATS */}
      <div className="card">
        <p>📊 Total Tasks: {totalTasks}</p>
        <p>✅ Completed: {completedTasks}</p>
        <p>📈 Overall Progress: {overallProgress}%</p>

        {bestSubject && (
          <p>🔥 Best: {bestSubject.name} ({bestSubject.percent}%)</p>
        )}
        {weakSubject && (
          <p>⚠️ Focus: {weakSubject.name} ({weakSubject.percent}%)</p>
        )}
      </div>

      {message && <p className="message">{message}</p>}

      {/* ADD SUBJECT */}
      <div className="add-subject">
        <input
          type="text"
          placeholder="Subject name (e.g. Math)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <button onClick={addSubject}>➕ Add</button>
      </div>

      {/* SUBJECT LIST */}
      <div className="subject-grid">
        {subjects.length === 0 ? (
          <p>No subjects yet</p>
        ) : (
          subjects.map((s) => {
            const stats = getStats(s.name);

            return (
              <div
                key={s.id}
                className="subject-card"
                style={{ borderLeft: `6px solid ${s.color}` }}
              >
                <h3>{s.name}</h3>

                <p>📊 {stats.done} / {stats.total} tasks</p>

                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{
                      width: `${stats.percent}%`,
                      background: s.color,
                    }}
                  ></div>
                </div>

                <p className="percent">{stats.percent}% completed</p>

                <button onClick={() => deleteSubject(s.id)}>❌</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Subjects;