import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      alert("Name, email and password are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.log(err);
      alert("Network error");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo" onClick={() => navigate("/")}>
          HAIR LUX
        </h1>

        <h2>Create Account</h2>
        <p>Register to book your luxury hairstyle</p>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleRegister}>Register</button>

        <p style={{ marginTop: "20px" }}>
          Already have an account?{" "}
          <span
            className="auth-link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}