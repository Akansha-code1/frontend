import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";

// ✅ FORMAT DATE
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-CA");

// 🎨 SUBJECT COLORS
const subjectColors = {
  Math: "#6366f1",
  Physics: "#ec4899",
  CS: "#10b981",
  General: "#6b7280",
};

function CalendarView({ userEmail }) {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  const [aiMessage, setAiMessage] = useState("");
  const [productivity, setProductivity] = useState(0);

  // LOAD TASKS
  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://localhost:5000/api/tasks/${userEmail}`)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, [userEmail]);

  const selectedDate = formatDate(date);
  const today = formatDate(new Date());

  // FILTER TASKS
  const tasksForDay = tasks.filter(
    (t) => t.deadline && formatDate(t.deadline) === selectedDate
  );

  /* ================= ANALYTICS ================= */
  useEffect(() => {
    const total = tasksForDay.length;
    const done = tasksForDay.filter((t) => t.done).length;

    const percent = total ? Math.round((done / total) * 100) : 0;
    setProductivity(percent);

    /* 🤖 AI SUGGESTION */
    if (total === 0) {
      setAiMessage("📭 No tasks today — plan something!");
    } else if (percent === 100) {
      setAiMessage("🔥 Perfect day! All tasks completed.");
    } else if (percent >= 50) {
      setAiMessage("💪 Good progress — keep pushing!");
    } else {
      setAiMessage("⚠️ Low productivity — focus more.");
    }
  }, [tasksForDay]);

  /* ================= OVERDUE ================= */
  const overdueTasks = tasks.filter(
    (t) =>
      !t.done &&
      t.deadline &&
      formatDate(t.deadline) < today
  );

  /* ================= ACHIEVEMENTS ================= */
  const achievements = [];
  if (productivity === 100 && tasksForDay.length > 0)
    achievements.push("🏆 Perfect Day");
  if (tasksForDay.length >= 5)
    achievements.push("📅 Busy Day");
  if (productivity >= 50)
    achievements.push("⚡ Productive");

  return (
    <div className="calendar-container">
      <h1>📅 Calendar</h1>

      {/* 🤖 AI */}
      <div className="card">{aiMessage}</div>

      {/* 📊 PRODUCTIVITY */}
      <div className="card">
        <p>📊 Productivity: {productivity}%</p>
      </div>

      {/* ⚠️ OVERDUE */}
      {overdueTasks.length > 0 && (
        <div className="card warning">
          <h3>⚠️ Overdue Tasks</h3>
          {overdueTasks.slice(0, 3).map((t) => (
            <p key={t._id}>{t.text}</p>
          ))}
        </div>
      )}

      {/* 🏆 ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <div className="card">
          <h3>🏆 Achievements</h3>
          {achievements.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      <Calendar
        onChange={setDate}
        value={date}

        tileClassName={({ date: d }) => {
          const dStr = formatDate(d);

          if (dStr === selectedDate) return "selected-day";
          if (dStr === today) return "today";
          return "";
        }}

        tileContent={({ date: d }) => {
          const dayTasks = tasks.filter(
            (t) =>
              t.deadline &&
              formatDate(t.deadline) === formatDate(d)
          );

          if (!dayTasks.length) return null;

          return (
            <div className="dot-container">
              {dayTasks.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="dot"
                  style={{
                    background:
                      subjectColors[t.subject] ||
                      subjectColors["General"],
                  }}
                />
              ))}
              {dayTasks.length > 3 && (
                <span className="more">+</span>
              )}
            </div>
          );
        }}
      />

      {/* TASK LIST */}
      <div className="day-tasks">
        <h3>
          Tasks on {selectedDate}
          {selectedDate === today && " (Today)"}
        </h3>

        {tasksForDay.length === 0 ? (
          <p>No tasks</p>
        ) : (
          tasksForDay.map((t) => (
            <div key={t._id} className="calendar-task">
              <span className={t.done ? "done" : ""}>
                {t.text}
              </span>

              <div className="meta">
                <small>⚡ {t.priority}</small>
                <small>📚 {t.subject}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CalendarView;