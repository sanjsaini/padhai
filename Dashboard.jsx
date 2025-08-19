import React from "react";
import { useNavigate } from "react-router-dom";

const brand = { navy: "#2A335C" };

export default function Dashboard() {
  const nav = useNavigate();
  const raw = localStorage.getItem("padhai_user");
  const user = raw ? JSON.parse(raw) : null;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: "'Poppins', sans-serif"
    }}>
      <h2 style={{ color: brand.navy }}>
        {user?.profile?.name ? `Hi, ${user.profile.name}!` : "Welcome back!"}
      </h2>
      <p style={{ opacity: 0.75, marginBottom: 20 }}>
        This is your dashboard. Next: placement test or course picker.
      </p>
      <button
        onClick={() => { localStorage.removeItem("padhai_user"); nav("/"); }}
        style={{
          padding: "10px 16px", borderRadius: 12, border: "none",
          background: brand.navy, color: "#fff", fontWeight: 700, cursor: "pointer"
        }}
      >
        Log out
      </button>
    </div>
  );
}
