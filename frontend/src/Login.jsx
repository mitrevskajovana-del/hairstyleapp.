import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

export default function Login({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;

      // JWT token
      localStorage.setItem("token", data.token);

      // User information
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update App state
      setLoggedIn(true);

      // Go to dashboard
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      alert(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1
          className="auth-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          HAIR LUX
        </h1>

        <h2>Welcome Back</h2>

        <p>
          Login to manage your appointments
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "20px" }}>
          Don&apos;t have an account?{" "}

          <span
            className="auth-link"
            onClick={() =>
              navigate("/register")
            }
            style={{ cursor: "pointer" }}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}