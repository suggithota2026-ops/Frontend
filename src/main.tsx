import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./fonts.css";
import "./index.css";
// Firebase is initialized only when admin code imports it — not on the public site.

createRoot(document.getElementById("root")!).render(<App />);
