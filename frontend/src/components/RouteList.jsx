import { useEffect } from 'react';
import { useMap } from '../contexts/MapContext';

function RouteList() {
  const { routes, loading, error, fetchRoutes, selectedRoute, setSelectedRoute } = useMap();

  useEffect(() => {
    fetchRoutes('NCR', 'Manila');
  }, [fetchRoutes]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Routes</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Routes</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Routes</h2>
      <div className="space-y-2">
        {routes.map(route => (
          <button
            key={route.routeId}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedRoute?.routeId === route.routeId
                ? 'bg-blue-100 border-blue-500'
                : 'hover:bg-gray-100 border-transparent'
            } border-2`}
            onClick={() => setSelectedRoute(route)}
          >
            <div className="font-medium">{route.shortName}</div>
            <div className="text-sm text-gray-600">{route.longName}</div>
            <div className="text-xs text-gray-500 mt-1">
              {route.type === '1' ? 'Light Rail' : 'Bus'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default RouteList; 