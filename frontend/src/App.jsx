import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapProvider } from './contexts/MapContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import Navbar from './components/Navbar';
import Map from './components/Map';
import RouteList from './components/RouteList';
import StopList from './components/StopList';
import FareCalculator from './components/FareCalculator';
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/routes`)
      const data = await response.json()
      setRoutes(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch routes')
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <Router>
      <MapProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Map />
                  </div>
                  <div className="space-y-8">
                    <RouteList />
                    <StopList />
                    <FareCalculator />
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
        <SpeedInsights />
      </MapProvider>
    </Router>
  );
}

export default App; 