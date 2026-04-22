import React, { useState, useEffect } from "react";
import "./FocusMode.css";

function FocusMode() {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus"); // focus / break
  const [sessions, setSessions] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");

  // Load tasks
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      fetch(`http://localhost:5000/api/tasks/${email}`)
        .then((res) => res.json())
        .then((data) => setTasks(data));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let timer;

    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => {
          if (prev === 0) {
            if (mode === "focus") {
              setMode("break");
              setTime(5 * 60);
              setSessions((s) => s + 1);
            } else {
              setMode("focus");
              setTime(25 * 60);
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, mode]);

  const formatTime = () => {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode("focus");
    setTime(25 * 60);
  };

  return (
    <div className="focus-container">
      <h1>Focus Mode 🎯</h1>

      {/* TASK SELECT */}
     

      {/* TIMER */}
      <div className="timer-card">
        <h2>{mode === "focus" ? "Focus Time" : "Break Time"}</h2>
        <div className="time">{formatTime()}</div>

        <div className="controls">
          <button onClick={() => setIsRunning(true)}>Start</button>
          <button onClick={() => setIsRunning(false)}>Pause</button>
          <button onClick={resetTimer}>Reset</button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat">
          <h3>{sessions}</h3>
          <p>Sessions</p>
        </div>
      </div>
    </div>
  );
}

export default FocusMode;