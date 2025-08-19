import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const brand = { navy: "#2A335C", orange: "#FF8E32" };

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    nativeLanguage: "",
    grade: "",
    age: "",
    username: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");

    // simple validation
    if (!form.name || !form.username || !form.password) {
      setErr("Please fill name, username, and password.");
      return;
    }
    if (form.age && isNaN(Number(form.age))) {
      setErr("Age must be a number.");
      return;
    }

    // save to localStorage (replace with API later)
    localStorage.setItem("padhai_user", JSON.stringify({
      username: form.username,
      password: form.password,
      profile: {
        name: form.name,
        nativeLanguage: form.nativeLanguage,
        grade: form.grade,
        age: form.age
      }
    }));

    nav("/dashboard");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Sign Up</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input style={styles.input} placeholder="Name" value={form.name} onChange={update("name")} />
        <input style={styles.input} placeholder="Native Language" value={form.nativeLanguage} onChange={update("nativeLanguage")} />
        <input style={styles.input} placeholder="Grade (US Standard)" value={form.grade} onChange={update("grade")} />
        <input style={styles.input} placeholder="Age" value={form.age} onChange={update("age")} />
        <input style={styles.input} placeholder="Username" value={form.username} onChange={update("username")} autoComplete="username" />
        <input style={styles.input} placeholder="Password" type="password" value={form.password} onChange={update("password")} autoComplete="new-password" />
        {err && <div style={styles.error}>{err}</div>}
        <button style={styles.primaryBtn} type="submit">Take Placement Test</button>
      </form>
      <div style={styles.smallText}>
        Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
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
  form: { width: 340, display: "flex", flexDirection: "column", gap: 14 },
  input: {
    padding: "14px 16px", borderRadius: 12, border: `2px solid ${brand.navy}`,
    background: brand.navy, color: "#fff", outline: "none"
  },
  primaryBtn: {
    marginTop: 8, padding: "16px 18px", borderRadius: 28, border: "none",
    background: brand.navy, color: "#fff", fontWeight: 700, cursor: "pointer"
  },
  error: { color: "#b00020", fontSize: 14, marginTop: 4 },
  smallText: { marginTop: 16, color: brand.navy },
  link: { color: brand.navy, fontWeight: 700, textDecoration: "underline" },
};
