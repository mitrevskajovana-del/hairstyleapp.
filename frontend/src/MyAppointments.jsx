import { useEffect, useState } from "react";
import API from "./api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/appointments/my")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.log(err));
  }, []);

  const startEdit = (appointment) => {
    setEditingId(appointment._id);
    setNewName(appointment.name);
    setNewDate(appointment.date);
  };

  const saveEdit = async (id, hairstyleId) => {
    try {
      const res = await API.put(`/appointments/${id}`, {
        name: newName,
        date: newDate,
        hairstyle: hairstyleId,
      });

      setAppointments(
        appointments.map((a) =>
          a._id === id ? res.data.appointment : a
        )
      );

      setEditingId(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="content">
      <h2
        onClick={() => navigate("/")}
        style={{
          cursor: "pointer",
          color: "#d4a373",
          marginBottom: "20px",
        }}
      >
        HAIR LUX
      </h2>

      <h1 style={{ color: "#d4a373" }}>📅 My Appointments</h1>

      {appointments.length === 0 ? (
        <p>No appointments yet</p>
      ) : (
        appointments.map((a) => (
          <motion.div
            key={a._id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {editingId === a._id ? (
              <>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />

                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />

                <button
                  onClick={() =>
                    saveEdit(a._id, a.hairstyle?._id)
                  }
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h3>{a.name}</h3>

                <p>📆 {a.date}</p>

                <p>🕐 {a.time}</p>

                <p>
                  💇 {a.hairstyle?.name || "N/A"}
                </p>

                <button onClick={() => startEdit(a)}>
                  Edit
                </button>

                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    await API.delete(`/appointments/${a._id}`);

                    setAppointments(
                      appointments.filter(
                        (x) => x._id !== a._id
                      )
                    );
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}

export default MyAppointments;