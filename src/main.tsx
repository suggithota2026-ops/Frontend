import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Firebase is initialized only when admin code imports it — not on the public site.

const loadFonts = () => import("./fonts.css");

// Load fonts after first paint so they don't compete with the LCP hero image
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => {
    void loadFonts();
  });
} else {
  setTimeout(() => {
    void loadFonts();
  }, 200);
}

createRoot(document.getElementById("root")!).render(<App />);
