import { useState, useEffect } from "react";
import "./Timetable.css";

function Timetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const slots = ["9–10", "10–11", "11–12"];

  const [table, setTable] = useState({});
  const [message, setMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [insight, setInsight] = useState("");

  const userEmail = localStorage.getItem("userEmail");

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://localhost:5000/api/timetable/${userEmail}`)
      .then((res) => res.json())
      .then((data) => {
        // 🔴 FIXED HERE
        if (data && data.table) {
          setTable(data.table);
        } else {
          setTable({});
        }
      })
      .catch(() => console.log("No timetable found"));
  }, [userEmail]);

  /* ================= ANALYTICS + AI ================= */
  useEffect(() => {
    let busiestDay = "";
    let max = 0;
    let emptyDays = 0;

    days.forEach((day) => {
      const count = Object.values(table[day] || {}).filter(Boolean).length;

      if (count > max) {
        max = count;
        busiestDay = day;
      }

      if (count === 0) emptyDays++;
    });

    if (max >= 3) {
      setAiMessage(`🔥 ${busiestDay} is overloaded — consider balancing.`);
    } else if (emptyDays === days.length) {
      setAiMessage("📅 Start building your weekly schedule");
    } else {
      setAiMessage("✅ Your schedule looks balanced!");
    }

    /* SMART INSIGHT */
    if (emptyDays >= 2) {
      setInsight("⚠️ You have too many free days — consistency needed.");
    } else if (max >= 3) {
      setInsight("⚡ Try spreading subjects across the week.");
    } else {
      setInsight("🎯 Good distribution of workload.");
    }
  }, [table]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (day, slot, value) => {
    setTable({
      ...table,
      [day]: {
        ...table[day],
        [slot]: value,
      },
    });
  };

  /* ================= SAVE ================= */
  const saveTimetable = async () => {
    setMessage("Saving... ⏳");

    await fetch("http://localhost:5000/api/timetable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail, table }),
    });

    setMessage("Saved successfully ✅");
    setTimeout(() => setMessage(""), 2000);
  };

  /* ================= CLEAR ================= */
  const clearTable = () => {
    setTable({});
    setMessage("Cleared ❌");
    setTimeout(() => setMessage(""), 2000);
  };

  /* ================= COLOR ================= */
  const getColor = (subject) => {
    if (!subject) return "";

    const map = {
      Math: "#6366f1",
      Physics: "#22c55e",
      CS: "#0ea5e9",
      English: "#f59e0b",
    };

    return map[subject] || "#ef4444";
  };

  /* ================= STATS ================= */
  const filledSlots = Object.values(table).reduce(
    (acc, day) =>
      acc + Object.values(day || {}).filter(Boolean).length,
    0
  );

  const totalSlots = days.length * slots.length;
  const usagePercent = Math.round((filledSlots / totalSlots) * 100);

  /* ================= ACHIEVEMENTS ================= */
  const achievements = [];
  if (filledSlots >= 5) achievements.push("📅 Planner Started");
  if (filledSlots >= 10) achievements.push("🔥 Well Scheduled");
  if (filledSlots === totalSlots)
    achievements.push("🏆 Perfect Timetable");

  return (
    <div>
      <h1 className="title">📅 Timetable</h1>
      <p className="subtitle">Manage your weekly schedule</p>

      <div className="card">{aiMessage}</div>
      <div className="card">{insight}</div>

      <div className="card">
        <p>📊 Filled Slots: {filledSlots}</p>
        <p>📈 Usage: {usagePercent}%</p>
      </div>

      {achievements.length > 0 && (
        <div className="card">
          <h3>🏆 Achievements</h3>
          {achievements.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      )}

      {message && <p className="message">{message}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              {slots.map((slot) => (
                <th key={slot}>{slot}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="day">{day}</td>

                {slots.map((slot) => {
                  const value = table[day]?.[slot] || "";

                  return (
                    <td key={slot}>
                      <input
                        type="text"
                        placeholder="Subject"
                        value={value}
                        style={{
                          backgroundColor: getColor(value),
                          color: value ? "white" : "black",
                        }}
                        onChange={(e) =>
                          handleChange(day, slot, e.target.value)
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button className="save-btn" onClick={saveTimetable}>
          💾 Save
        </button>
        <button className="clear-btn" onClick={clearTable}>
          🧹 Clear
        </button>
      </div>
    </div>
  );
}

export default Timetable;