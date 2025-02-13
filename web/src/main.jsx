import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; // ✅ Import App.js
import "./styles/global.css";
console.log("🔍 Checking if global.css is loaded");

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <StrictMode>
    <App /> {/* ✅ Use App.js for routing */}
  </StrictMode>
);
