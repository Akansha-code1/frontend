import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./TeacherTasks.css";

export default function TeacherTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    text: "",
    deadline: "",
    subject: "",
    assignedTo: "",
    branch: "",
    year: "",
    semester: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [expandedTask, setExpandedTask] = useState(null);

  // ✅ grading UI state (USED NOW)
  const [grading, setGrading] = useState({
    taskId: null,
    email: "",
    grade: "",
    feedback: "",
  });

  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ================= FILE ================= */
  const handleFile = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected && selected.type.startsWith("image")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview("");
    }
  };

  /* ================= CREATE ================= */
  const createTask = async () => {
    if (!form.text) return alert("Task title required");

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === "assignedTo") {
          formData.append(
            "assignedTo",
            JSON.stringify(
              form.assignedTo
                ? form.assignedTo.split(",").map((e) => e.trim())
                : []
            )
          );
        } else {
          formData.append(key, form[key]);
        }
      });

      if (file) formData.append("file", file);

      await axios.post(
        "http://localhost:5000/api/tasks",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Task Created ✅");
      setForm({
        text: "",
        deadline: "",
        subject: "",
        assignedTo: "",
        branch: "",
        year: "",
        semester: "",
      });
      setFile(null);
      setPreview("");

      fetchTasks();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Error creating task ❌");
    }
  };

  /* ================= DELETE ================= */
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.log(err);
      alert("Delete failed ❌");
    }
  };

  /* ================= SAVE GRADE ================= */
  const submitGrade = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${grading.taskId}/grade`,
        {
          studentEmail: grading.email,
          grade: grading.grade,
          feedback: grading.feedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGrading({
        taskId: null,
        email: "",
        grade: "",
        feedback: "",
      });

      fetchTasks();
    } catch (err) {
      console.log(err);
      alert("Grading failed ❌");
    }
  };

  return (
    <div className="teacher-container">
      <h2 className="teacher-title">👨‍🏫 Manage Tasks</h2>

      {/* CREATE */}
      <motion.div className="teacher-input">
        <h3>✨ Create New Task</h3>

        <input
          placeholder="Task title"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />

        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
        />

        <input
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />

        <input type="file" onChange={handleFile} />

        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: "120px", borderRadius: "10px" }}
          />
        )}

        <select
          value={form.branch}
          onChange={(e) => setForm({ ...form, branch: e.target.value })}
        >
          <option value="">Branch</option>
          <option value="CSE">CSE</option>
          <option value="ME">ME</option>
        </select>

        <select
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        >
          <option value="">Year</option>
          <option value="1">1st</option>
          <option value="2">2nd</option>
        </select>

        <select
          value={form.semester}
          onChange={(e) => setForm({ ...form, semester: e.target.value })}
        >
          <option value="">Semester</option>
          <option value="1">Sem 1</option>
          <option value="2">Sem 2</option>
        </select>

        <motion.button onClick={createTask}>
          🚀 Create Task
        </motion.button>
      </motion.div>

      {/* TASK LIST */}
      <div className="tasks-list">

        {loading && <p>Loading tasks...</p>}

        {tasks.map((task) => (
          <div key={task._id} className="task-card">
            <h3>{task.text}</h3>
            <p>{task.subject}</p>

            {task.fileUrl && (
              <a href={task.fileUrl} target="_blank" rel="noreferrer">
                📎 View Attachment
              </a>
            )}

            <button onClick={() => deleteTask(task._id)}>
              🗑 Delete Task
            </button>

            <button onClick={() =>
              setExpandedTask(expandedTask === task._id ? null : task._id)
            }>
              View Submissions
            </button>

            <AnimatePresence>
              {expandedTask === task._id &&
                task.studentSubmissions?.map((s, i) => (
                  <motion.div key={i} className="submission-card">
                    <p><b>{s.studentEmail}</b></p>

                    <p>Status: {s.submitted ? "✅" : "❌"}</p>

                    {s.answer && <p>{s.answer}</p>}

                    {/* ✅ FILE FIX (always visible properly) */}
                    {s.fileUrl && (
                      <a href={s.fileUrl} target="_blank" rel="noreferrer">
                        📄 View Uploaded File
                      </a>
                    )}

                    <p>Grade: {s.grade || "Not graded"}</p>
                    <p>Feedback: {s.feedback || "-"}</p>

                    {/* ✅ OPEN GRADING UI */}
                    <button onClick={() =>
                      setGrading({
                        taskId: task._id,
                        email: s.studentEmail,
                        grade: s.grade || "",
                        feedback: s.feedback || "",
                      })
                    }>
                      ✏️ Grade
                    </button>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ✅ GRADING PANEL */}
      {grading.taskId && (
        <div className="grading-panel">
          <h3>Grade Student</h3>

          <input
            placeholder="Grade"
            value={grading.grade}
            onChange={(e) =>
              setGrading({ ...grading, grade: e.target.value })
            }
          />

          <textarea
            placeholder="Feedback"
            value={grading.feedback}
            onChange={(e) =>
              setGrading({ ...grading, feedback: e.target.value })
            }
          />

          <button onClick={submitGrade}>Save</button>

          <button onClick={() =>
            setGrading({
              taskId: null,
              email: "",
              grade: "",
              feedback: "",
            })
          }>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}