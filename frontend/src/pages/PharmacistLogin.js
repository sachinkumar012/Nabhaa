import { useState } from "react";

// eslint-disable-next-line react/prop-types
export default function PharmacistLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple hardcoded auth for demo
    if (username === "pharmacist" && password === "password123") {
      onLogin(true);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Pharmacist Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Login
        </button>
      </form>
    </div>
  );
}