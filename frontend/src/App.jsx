import { useEffect, useState } from "react";
import {
    createShortUrl,
    getAllUrls,
    deleteUrl,
} from "./api/urlApi";

export default function App() {
    const [url, setUrl] = useState("");
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUrls = async () => {
        const res = await getAllUrls();
        setUrls(res.data);
    };

    useEffect(() => {
        fetchUrls();
    }, []);

    const handleShorten = async () => {
        if (!url.trim()) return;
        setLoading(true);
        await createShortUrl(url);
        setUrl("");
        await fetchUrls();
        setLoading(false);
    };

    const handleDelete = async (id) => {
        await deleteUrl(id);
        fetchUrls();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <h1 className="text-3xl font-bold text-center mb-6">
                    URL Shortener
                </h1>

                {/* Input Card */}
                <div className="bg-white p-6 rounded-xl shadow mb-6">
                    <input
                        className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Paste a long URL here..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    <button
                        onClick={handleShorten}
                        disabled={loading}
                        className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition"
                    >
                        {loading ? "Shortening..." : "Shorten URL"}
                    </button>
                </div>

                {/* URL List */}
                <div className="bg-white rounded-xl shadow">
                    {urls.length === 0 ? (
                        <p className="p-6 text-center text-gray-500">
                            No shortened URLs yet
                        </p>
                    ) : (
                        urls.map((u) => (
                            <div
                                key={u.uuid}
                                className="flex justify-between items-center p-4 border-b last:border-b-0"
                            >
                                <div className="overflow-hidden">
                                    <p className="text-sm text-gray-600 truncate max-w-[220px]">
                                        {u.originalUrl}
                                    </p>
                                    <a
                                        href={`http://localhost:8080/${u.shortUrl}`}
                                        target="_blank"
                                        className="text-blue-600 font-medium"
                                    >
                                        {u.shortUrl}
                                    </a>
                                </div>

                                <button
                                    onClick={() => handleDelete(u.uuid)}
                                    className="text-red-500 hover:text-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
