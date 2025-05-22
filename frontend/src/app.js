import GTFSHandler from './gtfs.js';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Icon, Stroke, Fill, Circle } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { places } from '@algolia/places';

class CAThography {
    #map;
    #gtfsHandler;
    #currentLocation;
    #routeLayer;
    #stopLayer;
    #locationLayer;
    #pathwayLayer;

    constructor() {
        this.#gtfsHandler = new GTFSHandler();
        this.#initializeMap();
        this.#initializeAlgoliaPlaces();
        this.#setupEventListeners();
    }

    #initializeMap() {
        // Create map layers
        const osmLayer = new TileLayer({
            source: new OSM()
        });

        this.#routeLayer = new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                stroke: new Stroke({
                    color: '#0000FF',
                    width: 3
                })
            })
        });

        this.#stopLayer = new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                image: new Circle({
                    radius: 6,
                    fill: new Fill({
                        color: '#FF0000'
                    })
                })
            })
        });

        this.#locationLayer = new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                image: new Icon({
                    src: 'https://openlayers.org/en/latest/examples/data/icon.png',
                    scale: 0.5
                })
            })
        });

        this.#pathwayLayer = new VectorLayer({
            source: new VectorSource(),
            style: new Style({
                stroke: new Stroke({
                    color: '#666666',
                    width: 2,
                    lineDash: [5, 5]
                })
            })
        });

        // Initialize map
        this.#map = new Map({
            target: 'map',
            layers: [osmLayer, this.#routeLayer, this.#stopLayer, this.#locationLayer, this.#pathwayLayer],
            view: new View({
                center: fromLonLat([120.9842, 14.5995]), // Manila coordinates
                zoom: 12
            })
        });
    }

    #initializeAlgoliaPlaces() {
        const placesAutocomplete = places({
            appId: 'YOUR_ALGOLIA_APP_ID',
            apiKey: 'YOUR_ALGOLIA_API_KEY',
            container: document.querySelector('#destination-input')
        });

        placesAutocomplete.on('change', e => {
            const { latlng } = e.suggestion;
            this.#showDestination(latlng);
        });
    }

    #setupEventListeners() {
        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    this.#currentLocation = [longitude, latitude];
                    this.#showCurrentLocation();
                    this.#findNearbyRoutes();
                },
                error => console.error('Error getting location:', error)
            );
        }

        // Route search
        document.getElementById('search-route').addEventListener('click', () => {
            const destination = document.getElementById('destination-input').value;
            if (destination && this.#currentLocation) {
                this.#findRoute(this.#currentLocation, destination);
            }
        });
    }

    #showCurrentLocation() {
        const feature = new Feature({
            geometry: new Point(fromLonLat(this.#currentLocation))
        });

        this.#locationLayer.getSource().clear();
        this.#locationLayer.getSource().addFeature(feature);
    }

    #showDestination(coordinates) {
        const feature = new Feature({
            geometry: new Point(fromLonLat([coordinates.lng, coordinates.lat]))
        });

        this.#locationLayer.getSource().addFeature(feature);
    }

    async #findNearbyRoutes() {
        const [lon, lat] = this.#currentLocation;
        const routes = this.#gtfsHandler.getRoutesNearLocation(lat, lon);
        
        // Display routes on map
        routes.forEach(route => {
            const shape = this.#gtfsHandler.getShapeForRoute(route.id);
            if (shape) {
                const coordinates = shape.map(point => fromLonLat([point.lon, point.lat]));
                const feature = new Feature({
                    geometry: new LineString(coordinates)
                });
                this.#routeLayer.getSource().addFeature(feature);
            }
        });
    }

    async #findRoute(origin, destination) {
        // Find nearest stops to origin and destination
        const originStop = this.#findNearestStop(origin);
        const destinationStop = this.#findNearestStop(destination);

        if (!originStop || !destinationStop) {
            console.error('Could not find nearest stops');
            return;
        }

        // Get fare information
        const fareInfo = this.#gtfsHandler.getFareInfo(originStop.id, destinationStop.id);
        
        // Get pathway information
        const pathwayInfo = this.#gtfsHandler.getPathwayInfo(originStop.id, destinationStop.id);

        // Display pathway on map
        this.#displayPathway(pathwayInfo);

        // Update route information
        this.#updateRouteInfo(originStop, destinationStop, fareInfo, pathwayInfo);
    }

    #findNearestStop(coordinates) {
        const [lon, lat] = coordinates;
        let nearestStop = null;
        let minDistance = Infinity;

        this.#gtfsHandler.stops.forEach(stop => {
            const distance = this.#gtfsHandler.calculateDistance(lat, lon, stop.lat, stop.lon);
            if (distance < minDistance) {
                minDistance = distance;
                nearestStop = stop;
            }
        });

        return nearestStop;
    }

    #displayPathway(pathways) {
        this.#pathwayLayer.getSource().clear();

        pathways.forEach(pathway => {
            const fromStop = this.#gtfsHandler.stops.get(pathway.fromStopId);
            const toStop = this.#gtfsHandler.stops.get(pathway.toStopId);

            if (fromStop && toStop) {
                const coordinates = [
                    fromLonLat([fromStop.lon, fromStop.lat]),
                    fromLonLat([toStop.lon, toStop.lat])
                ];

                const feature = new Feature({
                    geometry: new LineString(coordinates)
                });

                this.#pathwayLayer.getSource().addFeature(feature);
            }
        });
    }

    #updateRouteInfo(originStop, destinationStop, fareInfo, pathwayInfo) {
        // Update distance
        const distance = this.#gtfsHandler.calculateDistance(
            originStop.lat, originStop.lon,
            destinationStop.lat, destinationStop.lon
        );
        document.getElementById('distance').textContent = `${distance.toFixed(2)} km`;

        // Update estimated time
        const avgSpeed = 30; // km/h
        const time = (distance / avgSpeed) * 60;
        document.getElementById('time').textContent = `${Math.round(time)} minutes`;

        // Update transport options
        const transportList = document.getElementById('transport-list');
        transportList.innerHTML = '';

        // Add fare information
        if (fareInfo) {
            const fareItem = document.createElement('div');
            fareItem.className = 'transport-item';
            fareItem.innerHTML = `
                <span class="transport-icon">💰</span>
                <span>${fareInfo.productName}</span>
                <span>${fareInfo.amount} ${fareInfo.currency}</span>
            `;
            transportList.appendChild(fareItem);
        }

        // Add pathway information
        pathwayInfo.forEach(pathway => {
            const pathwayItem = document.createElement('div');
            pathwayItem.className = 'transport-item';
            const modeDescription = this.#gtfsHandler.pathwaysHandler.getPathwayModeDescription(pathway.mode);
            const accessibilityInfo = this.#gtfsHandler.getAccessibilityInfo(pathway.id);

            let accessibilityIcon = '♿';
            if (accessibilityInfo) {
                if (accessibilityInfo.isElevator) accessibilityIcon = '🛗';
                else if (accessibilityInfo.isEscalator) accessibilityIcon = '🛗';
                else if (accessibilityInfo.isMovingSidewalk) accessibilityIcon = '🚶';
            }

            pathwayItem.innerHTML = `
                <span class="transport-icon">${accessibilityIcon}</span>
                <span>${modeDescription}</span>
                ${accessibilityInfo ? `<span>(${accessibilityInfo.stairCount} stairs)</span>` : ''}
            `;
            transportList.appendChild(pathwayItem);
        });
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    new CAThography();
}); 