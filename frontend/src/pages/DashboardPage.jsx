import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { urlApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    try {
      setLoading(true);
      const data = await urlApi.getAll();
      console.log('URLs loaded:', data); // Debug log
      setUrls(data);
    } catch (err) {
      setError('Failed to load URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const result = await urlApi.create(originalUrl);
      console.log('URL created:', result); // Debug log
      setOriginalUrl('');
      await loadUrls();
    } catch (err) {
      setError(err.message || 'Failed to create URL');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    try {
      await urlApi.delete(id);
      await loadUrls();
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  const handleCopy = (shortUrl) => {
    const url = `http://localhost:8080/${shortUrl}`;
    navigator.clipboard.writeText(url);
    alert('Copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">URL Shortener</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create URL Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Short URL</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Enter your long URL here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Shorten'}
            </button>
          </form>
        </div>

        {/* URLs List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your URLs</h2>
            <span className="text-gray-600">{urls.length} total</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600">Loading your URLs...</div>
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No URLs yet</div>
              <p className="text-gray-500">Create your first short URL above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <div
                  key={url.uuid}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Short URL */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">Short URL:</span>
                        <a
                          href={`http://localhost:8080/${url.shortUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          localhost:8080/{url.shortUrl}
                        </a>
                      </div>

                      {/* Original URL */}
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-500 mt-0.5">Original:</span>
                        <p className="text-gray-700 break-all">{url.originalUrl}</p>
                      </div>

                      {/* Metadata */}
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                        <span>Clicks: {url.clickCount || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(url.shortUrl)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-medium"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(url.uuid)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
