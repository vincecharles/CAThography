import { useState, useEffect } from 'react';
import axios from 'axios';

function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/routes`);
        setRoutes(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load routes');
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Loading routes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">{error}</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Transit Routes</h2>
      <div className="space-y-4">
        {routes.map((route) => (
          <div
            key={route._id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium">{route.name}</h3>
            <p className="text-sm text-gray-600">{route.description}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {route.type}
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {route.fare} PHP
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RouteList; 