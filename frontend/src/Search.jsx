import { useEffect, useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

function Search() {
  const [search, setSearch] = useState("");
  const [hairstyles, setHairstyles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/hairstyles")
      .then((res) => setHairstyles(res.data))
      .catch((err) => console.log(err));
  }, []);

  const filteredHairstyles = hairstyles.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBook = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      navigate("/?booking=true");
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

      <h1 style={{ color: "#d4a373" }}>Search Hairstyles 💇‍♀️</h1>

      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search hairstyle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px",
            width: "300px",
            borderRadius: "10px",
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "white",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredHairstyles.map((h) => (
          <div
            key={h._id}
            style={{
              background: "#151515",
              padding: "20px",
              borderRadius: "15px",
              border: "1px solid #252525",
              textAlign: "center",
            }}
          >
            <img
        src={`/images/hair${hairstyles.findIndex((style) => style._id === h._id) + 1}.jpg`}
        alt={h.name}
              style={{
                width: "100%",
                height: "350px",
                objectFit: "contain",
                backgroundColor: "#000",
                objectPosition: "center top",
                borderRadius: "12px",
              }}
            />

            <h3 style={{ marginTop: "15px" }}>{h.name}</h3>

            <p>{h.description}</p>

            <p
              style={{
                color: "#d4a373",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Price: {h.price} den.
            </p>

            <button
              onClick={handleBook}
              style={{
                background: "#d4a373",
                border: "none",
                color: "black",
                padding: "12px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;