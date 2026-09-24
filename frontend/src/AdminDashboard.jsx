import { useEffect, useState } from "react";
import API, { uploadHairstyleImage } from "./api";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [hairstyles, setHairstyles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingForId, setUploadingForId] = useState(null);

  const [newHairstyle, setNewHairstyle] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    image: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
    loadHairstyles();
  }, []);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const loadAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.log("Appointments error:", err);
    }
  };

  const loadHairstyles = async () => {
    try {
      const res = await API.get("/hairstyles");
      setHairstyles(res.data);
    } catch (err) {
      console.log("Hairstyles error:", err);
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await API.delete(`/appointments/${id}`);

      setAppointments((current) =>
        current.filter(
          (appointment) => appointment._id !== id
        )
      );
    } catch (err) {
      console.log("Delete appointment error:", err);
      alert("Appointment could not be deleted.");
    }
  };

  const handleHairstyleChange = (id, field, value) => {
    setHairstyles((current) =>
      current.map((hairstyle) =>
        hairstyle._id === id
          ? {
              ...hairstyle,
              [field]:
                field === "price" || field === "duration"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : hairstyle
      )
    );
  };

  const handleNewHairstyleChange = (field, value) => {
    setNewHairstyle((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const uploadImageForNewHairstyle = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);

      const result = await uploadHairstyleImage(file);

      const imageUrl = `http://localhost:5000${result.image}`;

      setNewHairstyle((current) => ({
        ...current,
        image: imageUrl,
      }));

      showMessage("Image uploaded successfully.");
    } catch (err) {
      console.log("Image upload error:", err);

      alert(
        err.response?.data?.message ||
          "Image could not be uploaded."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadImageForExistingHairstyle = async (
    id,
    file
  ) => {
    if (!file) return;

    try {
      setUploadingForId(id);

      const result = await uploadHairstyleImage(file);

      const imageUrl = `http://localhost:5000${result.image}`;

      handleHairstyleChange(
        id,
        "image",
        imageUrl
      );

      showMessage("Image uploaded successfully.");
    } catch (err) {
      console.log("Image upload error:", err);

      alert(
        err.response?.data?.message ||
          "Image could not be uploaded."
      );
    } finally {
      setUploadingForId(null);
    }
  };

  const saveHairstyle = async (hairstyle) => {
    try {
      const res = await API.put(
        `/hairstyles/${hairstyle._id}`,
        {
          name: hairstyle.name,
          description: hairstyle.description,
          price: hairstyle.price,
          duration: hairstyle.duration,
          image: hairstyle.image,
        }
      );

      const updatedHairstyle = res.data.hairstyle;

      setHairstyles((current) =>
        current.map((item) =>
          item._id === hairstyle._id
            ? updatedHairstyle
            : item
        )
      );

      setEditingId(null);

      showMessage(
        `"${updatedHairstyle.name}" was updated successfully.`
      );
    } catch (err) {
      console.log("Update hairstyle error:", err);

      alert(
        err.response?.data?.message ||
          "Hairstyle could not be updated."
      );
    }
  };

  const deleteHairstyle = async (id) => {
    const hairstyle = hairstyles.find(
      (item) => item._id === id
    );

    if (!hairstyle) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${hairstyle.name}"?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/hairstyles/${id}`);

      setHairstyles((current) =>
        current.filter((item) => item._id !== id)
      );

      showMessage(
        `"${hairstyle.name}" was deleted.`
      );
    } catch (err) {
      console.log("Delete hairstyle error:", err);

      alert(
        err.response?.data?.message ||
          "Hairstyle could not be deleted."
      );
    }
  };

  const addHairstyle = async (e) => {
    e.preventDefault();

    if (
      !newHairstyle.name.trim() ||
      !newHairstyle.description.trim() ||
      newHairstyle.price === "" ||
      newHairstyle.duration === "" ||
      !newHairstyle.image.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await API.post("/hairstyles", {
        name: newHairstyle.name.trim(),
        description: newHairstyle.description.trim(),
        price: Number(newHairstyle.price),
        duration: Number(newHairstyle.duration),
        image: newHairstyle.image.trim(),
      });

      const createdHairstyle = res.data.hairstyle;

      setHairstyles((current) => [
        ...current,
        createdHairstyle,
      ]);

      setNewHairstyle({
        name: "",
        description: "",
        price: "",
        duration: "",
        image: "",
      });

      setShowAddForm(false);

      showMessage(
        `"${createdHairstyle.name}" was added successfully.`
      );
    } catch (err) {
      console.log("Add hairstyle error:", err);

      alert(
        err.response?.data?.message ||
          "Hairstyle could not be added."
      );
    }
  };

  const chartData = [];

  appointments.forEach((appointment) => {
    const hairstyle =
      appointment.hairstyle?.name || "Unknown";

    const existing = chartData.find(
      (item) => item.name === hairstyle
    );

    if (existing) {
      existing.count += 1;
    } else {
      chartData.push({
        name: hairstyle,
        count: 1,
      });
    }
  });

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

      <h1 style={{ color: "#d4a373" }}>
        👑 Admin Dashboard
      </h1>

      <p className="subtext">
        Overview of all salon appointments and hairstyles
      </p>

      {message && (
        <div
          style={{
            background: "#183c25",
            color: "#8ff0a4",
            border: "1px solid #2f8f46",
            padding: "14px 18px",
            borderRadius: "10px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          ✅ {message}
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h3>Total Appointments</h3>
          <span className="price">
            {appointments.length}
          </span>
        </div>

        <div className="card">
          <h3>Total Hairstyles</h3>
          <span className="price">
            {hairstyles.length}
          </span>
        </div>

        <div className="card">
          <h3>Salon Status</h3>
          <span className="price">Open</span>
        </div>
      </div>

      {/* APPOINTMENTS CHART */}

      <div
        style={{
          width: "100%",
          height: 380,
          background: "#111",
          padding: 25,
          borderRadius: 18,
          marginTop: 35,
          marginBottom: 30,
          border: "1px solid #333",
          boxSizing: "border-box",
        }}
      >
        <h3
          style={{
            color: "#d4a373",
            marginBottom: "20px",
          }}
        >
          Appointments by Hairstyle 📊
        </h3>

        {chartData.length === 0 ? (
          <p>No data for chart yet</p>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="85%"
          >
            <BarChart
              data={chartData}
              barSize={55}
            >
              <CartesianGrid
                stroke="#333"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#ffffff"
                tick={{
                  fill: "#ffffff",
                  fontSize: 12,
                }}
              />

              <YAxis
                allowDecimals={false}
                stroke="#ffffff"
                tick={{
                  fill: "#ffffff",
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #d4a373",
                  borderRadius: "10px",
                  color: "#fff",
                }}
                labelStyle={{
                  color: "#d4a373",
                }}
              />

              <Bar
                dataKey="count"
                radius={[14, 14, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index % 2 === 0
                        ? "#d4a373"
                        : "#c08457"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* MANAGE HAIRSTYLES */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginTop: "40px",
        }}
      >
        <div>
          <h2
            style={{
              color: "#d4a373",
              marginBottom: "5px",
            }}
          >
            💇 Manage Hairstyles
          </h2>

          <p className="subtext">
            Add, edit or delete salon hairstyles.
          </p>
        </div>

        <button
          onClick={() =>
            setShowAddForm(!showAddForm)
          }
          style={{
            background: "#d4a373",
            color: "#111",
            border: "none",
            padding: "12px 20px",
            borderRadius: "9px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          {showAddForm
            ? "✕ Close Form"
            : "➕ Add New Hairstyle"}
        </button>
      </div>

      {/* ADD NEW HAIRSTYLE FORM */}

      {showAddForm && (
        <form
          onSubmit={addHairstyle}
          style={{
            background: "#111",
            border: "1px solid #d4a373",
            borderRadius: "18px",
            padding: "25px",
            marginTop: "25px",
            marginBottom: "30px",
          }}
        >
          <h3
            style={{
              color: "#d4a373",
              marginBottom: "20px",
            }}
          >
            ➕ Add New Hairstyle
          </h3>

          <label
            style={{
              display: "block",
              color: "#d4a373",
              marginBottom: "6px",
            }}
          >
            Hairstyle Name
          </label>

          <input
            type="text"
            placeholder="Example: Elegant Bob"
            value={newHairstyle.name}
            onChange={(e) =>
              handleNewHairstyleChange(
                "name",
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "11px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              color: "#d4a373",
              marginBottom: "6px",
            }}
          >
            Price (den)
          </label>

          <input
            type="number"
            min="0"
            placeholder="Example: 2500"
            value={newHairstyle.price}
            onChange={(e) =>
              handleNewHairstyleChange(
                "price",
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "11px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              color: "#d4a373",
              marginBottom: "6px",
            }}
          >
            Duration (minutes)
          </label>

          <input
            type="number"
            min="1"
            placeholder="Example: 90"
            value={newHairstyle.duration}
            onChange={(e) =>
              handleNewHairstyleChange(
                "duration",
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "11px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              color: "#d4a373",
              marginBottom: "6px",
            }}
          >
            Description
          </label>

          <textarea
            placeholder="Describe the hairstyle..."
            rows="4"
            value={newHairstyle.description}
            onChange={(e) =>
              handleNewHairstyleChange(
                "description",
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "11px",
              marginBottom: "15px",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />

          <label
            style={{
              display: "block",
              color: "#d4a373",
              marginBottom: "6px",
            }}
          >
            Image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            disabled={uploadingImage}
            onChange={(e) => {
              uploadImageForNewHairstyle(
                e.target.files[0]
              );

              e.target.value = "";
            }}
            style={{
              width: "100%",
              marginBottom: "10px",
            }}
          />

          {uploadingImage && (
            <p style={{ color: "#d4a373" }}>
              Uploading image...
            </p>
          )}

          <p
            style={{
              color: "#aaa",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Or use an image URL:
          </p>

          <input
            type="text"
            placeholder="https://..."
            value={newHairstyle.image}
            onChange={(e) =>
              handleNewHairstyleChange(
                "image",
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "11px",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />

          {newHairstyle.image && (
            <div style={{ marginBottom: "20px" }}>
              <p
                style={{
                  color: "#aaa",
                  marginBottom: "8px",
                }}
              >
                Image Preview:
              </p>

              <img
                src={newHairstyle.image}
                alt="Preview"
                style={{
                  width: "220px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={uploadingImage}
            style={{
              background: "#d4a373",
              color: "#111",
              border: "none",
              padding: "12px 22px",
              borderRadius: "9px",
              cursor: uploadingImage
                ? "not-allowed"
                : "pointer",
              fontWeight: "bold",
              opacity: uploadingImage ? 0.6 : 1,
            }}
          >
            💾 Add Hairstyle
          </button>
        </form>
      )}

      {/* HAIRSTYLE CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "25px",
          marginTop: "25px",
        }}
      >
        {hairstyles.map((hairstyle) => {
          const isEditing =
            editingId === hairstyle._id;

          return (
            <div
              className="card"
              key={hairstyle._id}
              style={{
                padding: "20px",
                border: isEditing
                  ? "1px solid #d4a373"
                  : "1px solid #333",
              }}
            >
              {hairstyle.image && (
                <img
                  src={hairstyle.image}
                  alt={hairstyle.name}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "15px",
                  }}
                />
              )}

              {isEditing ? (
                <>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#d4a373",
                    }}
                  >
                    Hairstyle Name
                  </label>

                  <input
                    type="text"
                    value={hairstyle.name || ""}
                    onChange={(e) =>
                      handleHairstyleChange(
                        hairstyle._id,
                        "name",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "12px",
                      boxSizing: "border-box",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#d4a373",
                    }}
                  >
                    Price (den)
                  </label>

                  <input
                    type="number"
                    value={hairstyle.price ?? ""}
                    onChange={(e) =>
                      handleHairstyleChange(
                        hairstyle._id,
                        "price",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "12px",
                      boxSizing: "border-box",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#d4a373",
                    }}
                  >
                    Duration (minutes)
                  </label>

                  <input
                    type="number"
                    value={hairstyle.duration ?? ""}
                    onChange={(e) =>
                      handleHairstyleChange(
                        hairstyle._id,
                        "duration",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "12px",
                      boxSizing: "border-box",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#d4a373",
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    value={hairstyle.description || ""}
                    onChange={(e) =>
                      handleHairstyleChange(
                        hairstyle._id,
                        "description",
                        e.target.value
                      )
                    }
                    rows="4"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "12px",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      color: "#d4a373",
                    }}
                  >
                    Change Image
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    disabled={
                      uploadingForId ===
                      hairstyle._id
                    }
                    onChange={(e) => {
                      uploadImageForExistingHairstyle(
                        hairstyle._id,
                        e.target.files[0]
                      );

                      e.target.value = "";
                    }}
                    style={{
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  />

                  {uploadingForId ===
                    hairstyle._id && (
                    <p
                      style={{
                        color: "#d4a373",
                      }}
                    >
                      Uploading image...
                    </p>
                  )}

                  <p
                    style={{
                      color: "#aaa",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    Or edit the image URL:
                  </p>

                  <input
                    type="text"
                    value={hairstyle.image || ""}
                    onChange={(e) =>
                      handleHairstyleChange(
                        hairstyle._id,
                        "image",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "15px",
                      boxSizing: "border-box",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        saveHairstyle(hairstyle)
                      }
                      style={{
                        background: "#d4a373",
                        color: "#111",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      💾 Save
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingId(null)
                      }
                      style={{
                        background: "#555",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3
                    style={{
                      color: "#d4a373",
                      marginBottom: "10px",
                    }}
                  >
                    {hairstyle.name}
                  </h3>

                  <p>{hairstyle.description}</p>

                  <p>
                    💰 Price:{" "}
                    <strong>
                      {hairstyle.price} den
                    </strong>
                  </p>

                  <p>
                    ⏱ Duration:{" "}
                    <strong>
                      {hairstyle.duration} min
                    </strong>
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setEditingId(hairstyle._id)
                      }
                      style={{
                        background: "#d4a373",
                        color: "#111",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteHairstyle(
                          hairstyle._id
                        )
                      }
                      style={{
                        background: "#ff3b3b",
                        color: "white",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ALL APPOINTMENTS */}

      <h2 style={{ marginTop: "45px" }}>
        All Appointments
      </h2>

      {appointments.length === 0 ? (
        <div className="card">
          <p>No appointments yet</p>
        </div>
      ) : (
        appointments.map((appointment) => (
          <div
            className="card"
            key={appointment._id}
          >
            <h3>{appointment.name}</h3>

            <p>
              📅 Date: {appointment.date}
            </p>

            <p>
              🕐 Time:{" "}
              {appointment.time || "N/A"}
            </p>

            <p>
              💇 Hairstyle:{" "}
              {appointment.hairstyle?.name ||
                "N/A"}
            </p>

            <button
              type="button"
              onClick={() =>
                deleteAppointment(
                  appointment._id
                )
              }
              style={{
                background: "#ff3b3b",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Delete Appointment
            </button>
          </div>
        ))
      )}
    </div>
  );
}