import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import { AuthProvider } from "./context/AuthContext.jsx"; // ✅ Add this line

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ Wrap everything with AuthProvider */}
        <App />
    </AuthProvider>
  </React.StrictMode>
);
