import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
});

export const createShortUrl = (originalUrl) =>
    API.post("/api/urls", { originalUrl });

export const getAllUrls = () =>
    API.get("/api/urls");

export const deleteUrl = (id) =>
    API.delete(`/api/urls/${id}`);
