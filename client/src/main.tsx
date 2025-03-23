import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import "./index.css";

// Define the base path properly for production deployments
const basePath = '/';

createRoot(document.getElementById("root")!).render(
  <Router base={basePath}>
    <App />
  </Router>
);
