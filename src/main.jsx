import React from "react";
import { createRoot } from "react-dom/client";
import OPCRITApp from "./opcrit_plus.jsx";
import "./index.css";

window.storage = {
  async get(key) {
    const value = window.localStorage.getItem(key);
    return value === null ? null : { value };
  },
  async set(key, value) {
    window.localStorage.setItem(key, value);
  }
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <OPCRITApp />
  </React.StrictMode>
);
