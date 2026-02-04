import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import "./index.css"; // only if you actually have Tailwind/CSS set up

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
