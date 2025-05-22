import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Select, Input, Button, List, Tag, Space, Typography } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const InformalRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    region: 'all',
    city: 'all',
    barangay: 'all'
  });
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchRoutes();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/informal');
      setRoutes(response.data);
      setFilteredRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyRoutes = async () => {
    if (!userLocation) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/informal/nearby', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 1000
        }
      });
      setFilteredRoutes(response.data);
    } catch (error) {
      console.error('Error fetching nearby routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    let filtered = routes;
    if (newFilters.type !== 'all') {
      filtered = filtered.filter(route => route.type === newFilters.type);
    }
    if (newFilters.region !== 'all') {
      filtered = filtered.filter(route => route.region === newFilters.region);
    }
    if (newFilters.city !== 'all') {
      filtered = filtered.filter(route => route.city === newFilters.city);
    }
    if (newFilters.barangay !== 'all') {
      filtered = filtered.filter(route => route.barangay === newFilters.barangay);
    }
    
    setFilteredRoutes(filtered);
  };

  const calculateFare = (route, distance) => {
    const { base, perKm, minimum } = route.fare;
    const fare = base + (distance * perKm);
    return Math.max(fare, minimum);
  };

  return (
    <div className="informal-routes">
      <Card className="filters-card">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Title level={4}>Informal Transit Routes</Title>
          
          <Space wrap>
            <Select
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
              style={{ width: 120 }}
            >
              <Option value="all">All Types</Option>
              <Option value="JEEPNEY">Jeepney</Option>
              <Option value="TRICYCLE">Tricycle</Option>
              <Option value="UV_EXPRESS">UV Express</Option>
            </Select>

            <Select
              value={filters.region}
              onChange={(value) => handleFilterChange('region', value)}
              style={{ width: 120 }}
            >
              <Option value="all">All Regions</Option>
              {/* Add regions dynamically */}
            </Select>

            <Select
              value={filters.city}
              onChange={(value) => handleFilterChange('city', value)}
              style={{ width: 120 }}
            >
              <Option value="all">All Cities</Option>
              {/* Add cities dynamically */}
            </Select>

            <Button 
              type="primary" 
              onClick={fetchNearbyRoutes}
              icon={<EnvironmentOutlined />}
            >
              Find Nearby Routes
            </Button>
          </Space>
        </Space>
      </Card>

      <div className="routes-container">
        <div className="routes-list">
          <List
            loading={loading}
            dataSource={filteredRoutes}
            renderItem={route => (
              <List.Item>
                <Card className="route-card">
                  <Space direction="vertical">
                    <Title level={5}>
                      {route.routeNumber} - {route.name}
                      <Tag color={route.type === 'JEEPNEY' ? 'blue' : 'green'}>
                        {route.type}
                      </Tag>
                    </Title>
                    
                    <Text>
                      <EnvironmentOutlined /> {route.barangay}, {route.city}
                    </Text>
                    
                    <Text>
                      <ClockCircleOutlined /> {route.schedule.startTime} - {route.schedule.endTime}
                    </Text>
                    
                    <Text>
                      <DollarOutlined /> Base Fare: ₱{route.fare.base}
                    </Text>
                    
                    <Text type="secondary">
                      Operator: {route.operator}
                    </Text>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </div>

        <div className="routes-map">
          {userLocation && (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {filteredRoutes.map(route => (
                route.stops.map(stop => (
                  <Marker
                    key={stop.stopId}
                    position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
                  >
                    <Popup>
                      <div>
                        <h4>{stop.name}</h4>
                        <p>{stop.landmark}</p>
                        <p>Route: {route.routeNumber}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      <style jsx>{`
        .informal-routes {
          padding: 20px;
        }
        
        .filters-card {
          margin-bottom: 20px;
        }
        
        .routes-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          height: calc(100vh - 200px);
        }
        
        .routes-list {
          overflow-y: auto;
        }
        
        .route-card {
          margin-bottom: 10px;
        }
        
        .routes-map {
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default InformalRoutes; 