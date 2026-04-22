import { useState, useEffect } from "react";
import "./Tasks.css";
import { motion } from "framer-motion";

function Tasks({ userEmail }) {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  /* ================= FETCH ================= */
  const fetchTasks = () => {
    fetch(`http://localhost:5000/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]));
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  /* ================= STUDENT SUBMIT ================= */
  const submitTask = async (taskId) => {
    const formData = new FormData();
    formData.append("file", file);

    await fetch(`http://localhost:5000/api/tasks/${taskId}/submit`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setFile(null);
    fetchTasks();
  };

  /* ================= TEACHER GRADE (FIXED) ================= */
  const gradeTask = async (taskId, studentEmail, grade, feedback) => {
    await fetch(`http://localhost:5000/api/tasks/${taskId}/grade`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        studentEmail,
        grade,
        feedback,
      }),
    });

    alert("Graded ✅");
    fetchTasks();
  };

  /* ================= DELETE ================= */
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  /* ================= FILTER ================= */
  const filteredTasks = tasks.filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="title">
        {role === "teacher" ? "👨‍🏫 Teacher Panel" : "📝 My Tasks"}
      </h1>

      <input
        placeholder="Search tasks..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredTasks.map((t) => {
        const submissions = t.studentSubmissions || [];

        const mySubmission = submissions.find(
          (s) =>
            s.studentEmail?.toLowerCase().trim() ===
            userEmail?.toLowerCase().trim()
        );

        return (
          <motion.div
            className="task-card"
            key={t._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3>{t.text}</h3>
            <p>📅 {t.deadline || "No deadline"}</p>

            {/* ================= TEACHER VIEW ================= */}
            {role === "teacher" && (
              <>
                <p>📊 Submissions: {submissions.length}</p>

                {submissions.map((s, i) => (
                  <div key={i} className="submission-box">
                    <p>👤 {s.studentEmail}</p>
                    <p>Status: {s.submitted ? "✅ Submitted" : "❌ Pending"}</p>

                    <input
                      placeholder="Grade"
                      value={s.grade || ""}
                      onChange={(e) => (s.grade = e.target.value)}
                    />

                    <input
                      placeholder="Feedback"
                      value={s.feedback || ""}
                      onChange={(e) => (s.feedback = e.target.value)}
                    />

                    <button
                      onClick={() =>
                        gradeTask(
                          t._id,
                          s.studentEmail,
                          s.grade,
                          s.feedback
                        )
                      }
                    >
                      Submit Grade
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* ================= STUDENT VIEW ================= */}
            {role !== "teacher" && (
              <>
                {mySubmission && (
                  <div className="submission-box">
                    <p>
                      Status:{" "}
                      {mySubmission.submitted ? "✅ Submitted" : "❌ Pending"}
                    </p>
                    <p>Grade: {mySubmission.grade || "Not graded"}</p>
                    <p>Feedback: {mySubmission.feedback || "-"}</p>
                  </div>
                )}

                {!mySubmission?.submitted && (
                  <>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                    />

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => submitTask(t._id)}
                    >
                      📤 Submit
                    </motion.button>
                  </>
                )}
              </>
            )}

            {/* DELETE (TEACHER ONLY) */}
            {role === "teacher" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteTask(t._id)}
              >
                🗑 Delete
              </motion.button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default Tasks;