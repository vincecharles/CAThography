import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapProvider } from './contexts/MapContext';
import Navbar from './components/Navbar';
import Map from './components/Map';
import RouteList from './components/RouteList';
import StopList from './components/StopList';
import FareCalculator from './components/FareCalculator';

function App() {
  return (
    <Router>
      <MapProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
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
          </main>
        </div>
      </MapProvider>
    </Router>
  );
}

export default App; 