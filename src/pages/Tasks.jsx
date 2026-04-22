import { useState, useEffect, useRef } from "react";
import "./Tasks.css";
import { motion } from "framer-motion";

function Tasks({ userEmail }) {
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [subject, setSubject] = useState("General");
  const [assignedTo, setAssignedTo] = useState("");

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [aiMessage, setAiMessage] = useState("");
  const [reminders, setReminders] = useState([]);

  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});

  const token = localStorage.getItem("token");

  const safeEmail = userEmail?.toLowerCase().trim();
  const userRole = localStorage.getItem("role");

  /* ================= LOAD TASKS ================= */
  const fetchTasks = () => {
    fetch(`http://localhost:5000/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch(() => console.log("Failed to load tasks"));
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  /* ================= SUBMIT ================= */
  const submitTask = async (taskId) => {
    try {
      const formData = new FormData();

      formData.append("answer", answers[taskId] || "");

      if (files[taskId]) {
        formData.append("file", files[taskId]);
      }

      await fetch(`http://localhost:5000/api/tasks/${taskId}/submit`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      alert("Submitted ✅");
      fetchTasks();
    } catch {
      alert("Submission failed");
    }
  };

  /* ================= ADD TASK ================= */
  const addTask = async () => {
    if (userRole === "student") {
      alert("Students cannot create tasks ❌");
      return;
    }

    if (!task) return;

    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: task,
          deadline,
          priority,
          subject,
          assignedTo,
        }),
      });

      const newTask = await res.json();
      setTasks([newTask, ...tasks]);

      setTask("");
      setDeadline("");
      setPriority("Medium");
      setSubject("General");
      setAssignedTo("");
    } catch {
      alert("Failed to add task");
    }
  };

  /* ================= VOICE ================= */
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return alert("Voice not supported");

    const recognition = new SpeechRecognition();
    recognition.start();

    recognition.onresult = (e) => {
      setTask(e.results[0][0].transcript);
    };
  };

  /* ================= TOGGLE ================= */
  const toggleDone = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTasks(); // 🔥 FIXED (always refresh)
    } catch {
      alert("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTasks(); // 🔥 FIXED
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= SAFE FILE CHECK ================= */
  const isImage = (url) =>
    typeof url === "string" && /\.(jpg|jpeg|png|gif)$/i.test(url);

  /* ================= SAFE DATE CHECK ================= */
  const isOverdue = (d) => {
    if (!d) return false;
    return new Date(d).getTime() < new Date().setHours(0, 0, 0, 0);
  };

  /* ================= FILTER ================= */
  const filteredTasks = tasks.filter((t) => {
    if (!t) return false;

    if (search && !t.text?.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (safeEmail) {
      return t.assignedTo?.some(
        (e) => e?.toLowerCase().trim() === safeEmail
      );
    }

    return true;
  });

  return (
    <div>
      <h1 className="title">📝 Tasks</h1>

      {/* INPUT */}
      {userRole !== "student" && (
        <div className="task-input">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add task..."
          />

          <button onClick={startVoice}>🎤</button>

          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <button onClick={addTask}>➕</button>
        </div>
      )}

      {/* TASK LIST */}
      {filteredTasks.map((t) => {
        const submission = t.studentSubmissions?.find(
          (s) =>
            s?.studentEmail?.toLowerCase().trim() === safeEmail
        );

        return (
          <motion.div
            className="task-card"
            key={t._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggleDone(t._id)}
            />

            <span className={t.done ? "done" : ""}>{t.text}</span>

            {/* TEACHER FILE */}
            {t.fileUrl && (
              <div>
                <a href={t.fileUrl} target="_blank" rel="noreferrer">
                  📎 View Task File
                </a>

                {isImage(t.fileUrl) && (
                  <img src={t.fileUrl} width="120" />
                )}
              </div>
            )}

            {/* SUBMISSION */}
            {submission && (
              <div className="submission-box">
                <p>Status: {submission.submitted ? "✅" : "❌"}</p>
                <p>Grade: {submission.grade ?? "Not graded"}</p>
                <p>Feedback: {submission.feedback || "-"}</p>

                {submission.fileUrl && (
                  <div>
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📄 View Submission
                    </a>

                    {isImage(submission.fileUrl) && (
                      <img src={submission.fileUrl} width="120" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SUBMIT */}
            {userRole === "student" && !submission?.submitted && (
              <div className="submit-box">
                <textarea
                  placeholder="Write your answer..."
                  value={answers[t._id] || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [t._id]: e.target.value,
                    })
                  }
                />

                <input
                  type="file"
                  onChange={(e) =>
                    setFiles({
                      ...files,
                      [t._id]: e.target.files[0],
                    })
                  }
                />

                <motion.button onClick={() => submitTask(t._id)}>
                  📤 Submit Task
                </motion.button>
              </div>
            )}

            {isOverdue(t.deadline) && !t.done && (
              <small className="overdue">⚠️</small>
            )}

            <motion.button onClick={() => deleteTask(t._id)}>
              🗑
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Tasks;