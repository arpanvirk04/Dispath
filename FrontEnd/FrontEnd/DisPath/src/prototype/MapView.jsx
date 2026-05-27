import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import './MapView.css';

// MapView component that uses Google Maps API to display addresses
const MapView = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [googleSDK, setGoogleSDK] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const [calculatedDuration, setCalculatedDuration] = useState(null);

  // Simulated driver location (hardcoded)
  const driverLocation = { latitude: 43.725, longitude: -79.452 };

  // Create a fetchRoutes function that can be called both on initial load and refresh
  const fetchRoutes = useCallback(async (isInitialLoad = false) => {
    try {
      // Only show loading state on initial load, not during refresh
      if (isInitialLoad) {
        setLoading(true);
      }

      const response = await fetch('http://localhost:8084/api/prototype/routes');
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Routes fetched successfully:', data);

      // Process routes to include starting point as first stop
      const processedRoutes = data.map(route => {
        // Create a deep copy of the route
        const routeCopy = JSON.parse(JSON.stringify(route));

        if (routeCopy.startingPoint) {
          // Create a starting point stop
          const startingStop = {
            id: `start-${routeCopy.id}`,
            address: routeCopy.startingPoint,
            customerName: null,
            customerEmail: null,
            customerPhone: null,
            latitude: 0.0,
            longitude: 0.0,
            sequenceNumber: 1,
            status: "STARTING_POINT",
            estimatedArrivalTime: null,
            actualArrivalTime: null
          };

          // Adjust sequence numbers of existing stops
          if (routeCopy.stops && routeCopy.stops.length > 0) {
            routeCopy.stops = routeCopy.stops.map(stop => ({
              ...stop,
              sequenceNumber: stop.sequenceNumber + 1
            }));
          } else {
            routeCopy.stops = [];
          }

          // Add starting point as the first stop
          routeCopy.stops.unshift(startingStop);

          // Add return stop at the end
          const returnStop = {
            id: `return-to-${routeCopy.id}`,
            address: routeCopy.startingPoint,
            customerName: null,
            customerEmail: null,
            customerPhone: null,
            latitude: 0.0,
            longitude: 0.0,
            sequenceNumber: routeCopy.stops.length + 1,
            status: "RETURN_POINT",
            estimatedArrivalTime: null,
            actualArrivalTime: null
          };

          routeCopy.stops.push(returnStop);
        }

        return routeCopy;
      });

      setRoutes(processedRoutes);

      // Select the first route by default if none is selected, or keep current selection
      if (processedRoutes.length > 0) {
        if (!selectedRoute) {
          setSelectedRoute(processedRoutes[0]);
        } else {
          const updatedSelectedRoute = processedRoutes.find(r => r.id === selectedRoute.id);
          if (updatedSelectedRoute) {
            setSelectedRoute(updatedSelectedRoute);
          } else {
            setSelectedRoute(processedRoutes[0]);
          }
        }
      }

      if (isInitialLoad) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError(`Failed to fetch routes: ${error.message}`);
      setLoading(false);
    }
  }, []);

  // Fetch routes on component mount
  useEffect(() => {
    fetchRoutes(true); // Pass true to indicate this is the initial load
  }, [fetchRoutes]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      setLoading(true);
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        console.log('Google Maps API loaded successfully');

        window.google = google;
        setGoogleSDK(google);
        setLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setError(`Failed to load Google Maps API: ${error.message}`);
        setLoading(false);
      }
    };

    if (!googleSDK) {
      loadGoogleMapsAPI();
    }
  }, [googleSDK]);

  // Initialize the map when both the DOM element and Google SDK are ready
  useEffect(() => {
    if (!googleSDK || !mapRef.current || map || !selectedRoute) {
      return; // Skip if not ready
    }

    console.log('Initializing map with element:', mapRef.current);

    try {
      // Create the map instance
      const mapInstance = new googleSDK.maps.Map(mapRef.current, {
        center: { lat: 43.7615, lng: -79.4111 }, // Default center at North York
        zoom: 12,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true
      });

      console.log('Map instance created successfully');

      setMap(mapInstance);

      // Display the stops on the map
      if (selectedRoute && selectedRoute.stops.length > 0) {
        const addresses = selectedRoute.stops.map(stop => stop.address);
        geocodeAddresses(addresses, googleSDK, mapInstance);
      }
    } catch (error) {
      console.error('Error creating map instance:', error);
      setError(`Failed to create map: ${error.message}`);
    }
  }, [googleSDK, mapRef.current, selectedRoute]);

  // Update markers when the selected route changes
  useEffect(() => {
    if (map && googleSDK && selectedRoute && selectedRoute.stops.length > 0) {
      const addresses = selectedRoute.stops.map(stop => stop.address);
      geocodeAddresses(addresses, googleSDK, map);
    }
  }, [selectedRoute, map, googleSDK]);

  // Calculate total estimated duration using Google Maps DirectionsService
  useEffect(() => {
    const calculateRouteDuration = async () => {
      if (!googleSDK || !selectedRoute || !selectedRoute.stops || selectedRoute.stops.length < 2) {
        setCalculatedDuration(null);
        return;
      }
      const stops = selectedRoute.stops;
      // Get all positions (lat/lng or geocode if needed)
      const positions = await Promise.all(stops.map(async (stop) => {
        if (stop.latitude && stop.longitude && stop.latitude !== 0.0 && stop.longitude !== 0.0) {
          return { lat: stop.latitude, lng: stop.longitude };
        } else {
          // Geocode address
          return new Promise((resolve) => {
            const geocoder = new googleSDK.maps.Geocoder();
            geocoder.geocode({ address: stop.address }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const loc = results[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
              } else {
                resolve(null);
              }
            });
          });
        }
      }));
      // Filter out any failed geocodes
      const validPositions = positions.filter(Boolean);
      if (validPositions.length < 2) {
        setCalculatedDuration(null);
        return;
      }
      // Prepare DirectionsService request
      const origin = validPositions[0];
      const destination = validPositions[validPositions.length - 1];
      const waypoints = validPositions.slice(1, -1).map(pos => ({ location: pos, stopover: true }));
      const directionsService = new googleSDK.maps.DirectionsService();
      directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: 'DRIVING',
        optimizeWaypoints: false
      }, (result, status) => {
        if (status === 'OK' && result.routes && result.routes[0]) {
          // Sum all legs durations
          const totalSeconds = result.routes[0].legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0);
          const totalMinutes = Math.round(totalSeconds / 60);
          setCalculatedDuration(totalMinutes);
        } else {
          setCalculatedDuration(null);
        }
      });
    };
    calculateRouteDuration();
  }, [googleSDK, selectedRoute]);

  // Geocode addresses and place markers
  const geocodeAddresses = (addressList, google, mapInstance) => {
    if (!selectedRoute || !selectedRoute.stops) return;
    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();
    const newMarkers = [];
    const path = [];

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    // Clear existing polyline
    if (polyline) {
      polyline.setMap(null);
    }

    let processedCount = 0;
    const totalStops = selectedRoute.stops.length;

    // Helper to update stop coordinates and trigger UI updates
    const updateStopLatLng = (index, lat, lng) => {
      setRoutes(prevRoutes => prevRoutes.map(route => {
        if (route.id !== selectedRoute.id) return route;
        const updatedStops = route.stops.map((stop, i) =>
          i === index ? { ...stop, latitude: lat, longitude: lng } : stop
        );
        return { ...route, stops: updatedStops };
      }));
      setSelectedRoute(prev => {
        if (!prev) return prev;
        if (prev.id !== selectedRoute.id) return prev;
        const updatedStops = prev.stops.map((stop, i) =>
          i === index ? { ...stop, latitude: lat, longitude: lng } : stop
        );
        return { ...prev, stops: updatedStops };
      });
    };

    selectedRoute.stops.forEach((stop, index) => {
      const addMarkerAndPath = (position) => {
        const marker = new google.maps.Marker({
          map: mapInstance,
          position,
          title: stop.address,
          label: (index + 1).toString(),
          draggable: true
        });
        marker.addListener('click', () => {
          setSelectedStop(selectedRoute.stops[index]);
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div>
                <h3>Stop ${index + 1}</h3>
                <p>${stop.address}</p>
              </div>
            `
          });
          infoWindow.open(mapInstance, marker);
        });
        // Drag event: update stop coordinates and refresh polyline/duration
        marker.addListener('dragend', (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          updateStopLatLng(index, lat, lng);
        });
        newMarkers.push(marker);
        bounds.extend(position);
        path[index] = position;
        processedCount++;
        if (processedCount === totalStops) {
          mapInstance.fitBounds(bounds);
          // Draw polyline
          const routePolyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#4285F4",
            strokeOpacity: 0.8,
            strokeWeight: 4,
          });
          routePolyline.setMap(mapInstance);
          setPolyline(routePolyline);
          setMarkers(newMarkers);
        }
      };

      if (stop.latitude && stop.longitude && stop.latitude !== 0.0 && stop.longitude !== 0.0) {
        addMarkerAndPath({ lat: stop.latitude, lng: stop.longitude });
      } else {
        geocoder.geocode({ address: stop.address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            addMarkerAndPath(results[0].geometry.location);
          } else {
            console.error('Geocode failed:', status, stop.address);
            processedCount++;
            if (processedCount === totalStops) {
              mapInstance.fitBounds(bounds);
              const routePolyline = new google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: "#4285F4",
                strokeOpacity: 0.8,
                strokeWeight: 4,
              });
              routePolyline.setMap(mapInstance);
              setPolyline(routePolyline);
              setMarkers(newMarkers);
            }
          }
        });
      }
    });
  };

  // Format date string to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle drag and drop for stop reordering
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('stopIndex', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('stopIndex'), 10);
    if (dragIndex === dropIndex) return;
    // Reorder stops
    setRoutes(prevRoutes => prevRoutes.map(route => {
      if (route.id !== selectedRoute.id) return route;
      const stops = [...route.stops];
      const [moved] = stops.splice(dragIndex, 1);
      stops.splice(dropIndex, 0, moved);
      // Reassign sequence numbers
      const updatedStops = stops.map((stop, i) => ({ ...stop, sequenceNumber: i + 1 }));
      return { ...route, stops: updatedStops };
    }));
    setSelectedRoute(prev => {
      if (!prev) return prev;
      if (prev.id !== selectedRoute.id) return prev;
      const stops = [...prev.stops];
      const [moved] = stops.splice(dragIndex, 1);
      stops.splice(dropIndex, 0, moved);
      const updatedStops = stops.map((stop, i) => ({ ...stop, sequenceNumber: i + 1 }));
      return { ...prev, stops: updatedStops };
    });
  };

  // Add driver marker to the map
  useEffect(() => {
    if (map && googleSDK) {
      // Car icon URL (Google Maps car icon)
      const carIcon = {
        url: 'https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png',
        scaledSize: new googleSDK.maps.Size(40, 40)
      };
      const driverMarker = new googleSDK.maps.Marker({
        map,
        position: { lat: driverLocation.latitude, lng: driverLocation.longitude },
        icon: carIcon,
        title: 'Driver Location'
      });
      return () => driverMarker.setMap(null); // Cleanup on unmount/update
    }
  }, [map, googleSDK]);

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="map-error">
        <h3>Error Loading Map</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="add-address-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="map-container">
      {/* Sidebar with route selection and details */}
      <div className="map-sidebar">
        <div className="sidebar-header">
          <h2>Routes</h2>
          <button
            className="refresh-button"
            onClick={fetchRoutes}
            title="Refresh route data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Route selection */}
        <div className="route-selection">
          <select
            onChange={(e) => {
              const route = routes.find(r => r.id === e.target.value);
              setSelectedRoute(route);
              setSelectedStop(null);
            }}
            value={selectedRoute?.id || ''}
            className="route-select"
          >
            <option value="" disabled>Select a route</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        {/* Route details */}
        {selectedRoute && (
          <div className="route-details">
            <h3>{selectedRoute.name}</h3>
            <p className="route-description">{selectedRoute.description}</p>

            <div className="route-info">
              <div className="info-item">
                <span className="info-label">Est. Duration:</span>
                <span className="info-value">{calculatedDuration !== null ? `${calculatedDuration} min` : 'N/A'}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Starting Point:</span>
                <span className="info-value">{selectedRoute.startingPoint}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value status">{selectedRoute.status}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Diver Name:</span>
                <span className="info-value status">{selectedRoute.driverName}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">{formatDate(selectedRoute.createdAt)}</span>
              </div>

              {selectedRoute.estimatedDistance > 0 && (
                <div className="info-item">
                  <span className="info-label">Est. Distance:</span>
                  <span className="info-value">{selectedRoute.estimatedDistance} km</span>
                </div>
              )}

              {selectedRoute.estimatedDuration > 0 && (
                <div className="info-item">
                  <span className="info-label">Est. Duration:</span>
                  <span className="info-value">{selectedRoute.estimatedDuration} min</span>
                </div>
              )}
            </div>

            <h4>Stops</h4>
            <ul className="stop-list">
              {selectedRoute.stops.map((stop, idx) => (
                <li
                  key={stop.id}
                  className={`stop-item ${selectedStop?.id === stop.id ? 'selected' : ''}`}
                  onClick={() => setSelectedStop(stop)}
                  draggable
                  onDragStart={e => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, idx)}
                  style={{ cursor: 'grab' }}
                >
                  <div className="stop-number">Stop {stop.sequenceNumber}</div>
                  <div className="stop-address">{stop.address}</div>
                  <div className="stop-status">{stop.status}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="map-content">
        <div
          id="google-map"
          ref={mapRef}
          className="google-map"
        />

        {/* Stop details in lower left */}
        {selectedStop && (
          <div className="stop-details">
            <h3>Stop Details</h3>
            <div className="stop-details-content">
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{selectedStop.address}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Sequence:</span>
                <span className="info-value">{selectedStop.sequenceNumber}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value">{selectedStop.status}</span>
              </div>

              {selectedStop.customerName && (
                <div className="info-item">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{selectedStop.customerName}</span>
                </div>
              )}

              {selectedStop.customerPhone && (
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{selectedStop.customerPhone}</span>
                </div>
              )}

              {selectedStop.estimatedArrivalTime && (
                <div className="info-item">
                  <span className="info-label">Est. Arrival:</span>
                  <span className="info-value">{formatDate(selectedStop.estimatedArrivalTime)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
