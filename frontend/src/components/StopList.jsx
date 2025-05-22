import { useEffect } from 'react';
import { useMap } from '../contexts/MapContext';

function StopList() {
  const { stops, loading, error, fetchStops, selectedRoute, selectedStop, setSelectedStop } = useMap();

  useEffect(() => {
    if (selectedRoute) {
      fetchStops(selectedRoute.routeId);
    }
  }, [selectedRoute, fetchStops]);

  if (!selectedRoute) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Stops</h2>
        <div className="text-gray-500">Select a route to view stops</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Stops</h2>
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
        <h2 className="text-xl font-semibold mb-4">Stops</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Stops</h2>
      <div className="space-y-2">
        {stops.map(stop => (
          <button
            key={stop.stopId}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedStop?.stopId === stop.stopId
                ? 'bg-blue-100 border-blue-500'
                : 'hover:bg-gray-100 border-transparent'
            } border-2`}
            onClick={() => setSelectedStop(stop)}
          >
            <div className="font-medium">{stop.name}</div>
            <div className="text-sm text-gray-600">{stop.code}</div>
            {stop.wheelchairBoarding === '1' && (
              <div className="text-xs text-green-600 mt-1">Wheelchair Accessible</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default StopList; 