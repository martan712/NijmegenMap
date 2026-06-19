import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./styles/theme.css";
import "./styles/global.css";
import App from "./App";

// Note: no <StrictMode> — its dev double-mount re-initialises the imperative
// Leaflet map ("Map container is already initialized").
createRoot(document.getElementById("root")!).render(<App />);
