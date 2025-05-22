import { useState } from 'react';
import { useMap } from '../contexts/MapContext';

function FareCalculator() {
  const { calculateFare, selectedRoute, stops } = useMap();
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [fareType, setFareType] = useState('REGULAR');
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    if (!fromStop || !toStop) {
      setError('Please select both origin and destination stops');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await calculateFare(fromStop, toStop, fareType);
      setFare(result);
    } catch (err) {
      setError('Failed to calculate fare');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRoute) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Fare Calculator</h2>
        <div className="text-gray-500">Select a route to calculate fares</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Fare Calculator</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <select
            value={fromStop}
            onChange={(e) => setFromStop(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select origin stop</option>
            {stops.map(stop => (
              <option key={stop.stopId} value={stop.stopId}>
                {stop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <select
            value={toStop}
            onChange={(e) => setToStop(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select destination stop</option>
            {stops.map(stop => (
              <option key={stop.stopId} value={stop.stopId}>
                {stop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fare Type</label>
          <select
            value={fareType}
            onChange={(e) => setFareType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="REGULAR">Regular</option>
            <option value="STUDENT">Student</option>
            <option value="SENIOR">Senior Citizen</option>
            <option value="PWD">PWD</option>
            <option value="CHILD">Child</option>
          </select>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Fare'}
        </button>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {fare && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="text-lg font-semibold text-green-800">
              Fare: ₱{fare.amount.toFixed(2)}
            </div>
            <div className="text-sm text-green-600">
              Payment Method: {fare.paymentMethod}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FareCalculator; 