import axios from "axios";

/** Public-only client: never attaches admin auth tokens. */
const BACKEND_URL =
  (import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "https://backend-ho7i.onrender.com") + "/api";
const isDev = import.meta.env.DEV;

const publicApi = axios.create({
  baseURL: isDev ? "/api" : BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApi;
