import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">CAThography</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/routes" className="text-gray-700 hover:text-blue-600">Routes</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 