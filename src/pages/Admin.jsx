import { useEffect, useState } from "react";

export default function Admin() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) { console.log(err); }
  };

  const toggleRole = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Panel 👑</h2>
      {users.map((user) => (
        <div key={user._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button onClick={() => toggleRole(user._id)}>
            {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
          </button>
          <button onClick={() => deleteUser(user._id)} style={{ marginLeft: "10px", color: "red" }}>
            Delete User
          </button>
        </div>
      ))}
    </div>
  );
}