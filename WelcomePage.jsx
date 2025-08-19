import React from "react";

export default function WelcomePage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to padhAI</h1>
      <p style={styles.subtitle}>Break language barriers, learn smarter.</p>
      <div style={styles.buttonContainer}>
        <button style={styles.loginButton}>Log In</button>
        <button style={styles.signupButton}>Sign Up</button>
      </div>
    </div>
  );
}

const styles = {
    container: {
    fontFamily: "'Poppins', sans-serif",
    textAlign: "center",
    minHeight: "100vh",
    width: "100vw",             
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #2A335C, #1f2649)",
    },
      
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#FFFFFF",
    letterSpacing: "1px",
  },
  subtitle: {
    color: "#CCCCCC",
    marginBottom: "2.5rem",
    fontSize: "1.1rem",
  },
  buttonContainer: {
    display: "flex",
    gap: "1rem",
  },
  loginButton: {
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    backgroundColor: "#FF8E32",
    color: "#fff",
    transition: "all 0.3s ease",
  },
  signupButton: {
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "2px solid #FF8E32",
    borderRadius: "30px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#FF8E32",
    transition: "all 0.3s ease",
  },
};

// Add hover effects using CSS in App.css:
/*
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
*/
