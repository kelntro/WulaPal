import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import { UserProvider } from "./context/UserContext.jsx";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
