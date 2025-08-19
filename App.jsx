
// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./WelcomePage.jsx";
import Login from "./Login.jsx";
import SignUp from "./SignUp.jsx";     
import Dashboard from "./Dashboard.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />  
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
