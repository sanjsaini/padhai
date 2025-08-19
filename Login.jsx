import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const brand = { navy: "#2A335C", orange: "#FF8E32" };

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword]   = useState("");
  const [err, setErr]             = useState("");
  const nav = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");

    const raw = localStorage.getItem("padhai_user");
    const user = raw ? JSON.parse(raw) : null;

    if (!user || user.username !== username || user.password !== password) {
      setErr("Invalid username or password.");
      return;
    }
    nav("/dashboard");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {err && <div style={styles.error}>{err}</div>}
        <button style={styles.primaryBtn} type="submit">Continue</button>
      </form>
      <div style={styles.smallText}>
        New here? <Link to="/signup" style={styles.link}>Create an account</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #fff, #FF8E32, #fff)",
    fontFamily: "'Poppins', sans-serif",
    padding: 24,
  },
  title: { color: brand.navy, fontSize: "2.5rem", marginBottom: 20, fontWeight: 700 },
  form: { width: 320, display: "flex", flexDirection: "column", gap: 14 },
  input: {
    padding: "14px 16px", borderRadius: 12, border: `2px solid ${brand.navy}`,
    background: brand.navy, color: "#fff", outline: "none"
  },
  primaryBtn: {
    marginTop: 8, padding: "14px 16px", borderRadius: 24, border: "none",
    background: brand.navy, color: "#fff", fontWeight: 700, cursor: "pointer"
  },
  error: { color: "#b00020", fontSize: 14, marginTop: 4 },
  smallText: { marginTop: 16, color: brand.navy },
  link: { color: brand.navy, fontWeight: 700, textDecoration: "underline" },
};
