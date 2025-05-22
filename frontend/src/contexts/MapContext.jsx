import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const MapContext = createContext();

export function MapProvider({ children }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutes = useCallback(async (region, city) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/routes', {
        params: { region, city }
      });
      setRoutes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch routes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStops = useCallback(async (routeId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/stops/route/${routeId}`);
      setStops(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stops');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateFare = useCallback(async (fromStopId, toStopId, fareType) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/fares/between', {
        params: { fromStopId, toStopId, fareType }
      });
      return response.data;
    } catch (err) {
      setError('Failed to calculate fare');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    selectedRoute,
    setSelectedRoute,
    selectedStop,
    setSelectedStop,
    routes,
    stops,
    loading,
    error,
    fetchRoutes,
    fetchStops,
    calculateFare
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
} 