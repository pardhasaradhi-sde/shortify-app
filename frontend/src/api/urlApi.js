import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

export const createShortUrl = (originalUrl) =>
    API.post("/api/urls", { originalUrl });

export const getAllUrls = () =>
    API.get("/api/urls");

export const deleteUrl = (id) =>
    API.delete(`/api/urls/${id}`);
