import { useEffect, useRef, useState } from 'react';
import './TomTomMap.css';

const TomTomMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchMarkersManagerRef = useRef(null);
  const ttServicesRef = useRef(null);
  const ttRef = useRef(null);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const apiKey = "aTibKbz0ENEQkhPzIC23Je4K3AGyVQft";

  useEffect(() => {
    // Load TomTom SDK scripts dynamically
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadTomTomSDK = async () => {
      try {
        // Load CSS files
        const mapCss = document.createElement('link');
        mapCss.rel = 'stylesheet';
        mapCss.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css';
        document.head.appendChild(mapCss);

        const searchBoxCss = document.createElement('link');
        searchBoxCss.rel = 'stylesheet';
        searchBoxCss.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/plugins/SearchBox/3.1.3-public-preview.0/SearchBox.css';
        document.head.appendChild(searchBoxCss);

        // Load JS libraries
        await loadScript('https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js');
        await loadScript('https://api.tomtom.com/maps-sdk-for-web/cdn/plugins/SearchBox/3.1.3-public-preview.0/SearchBox-web.js');
        await loadScript('https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/services/services-web.min.js');

        // Add a small delay to ensure scripts are fully loaded
        setTimeout(() => {
          initializeMap();
        }, 300);
      } catch (error) {
        console.error('Failed to load TomTom SDK:', error);
      }
    };

    loadTomTomSDK();

    // Cleanup on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!window.tt) {
      console.error('TomTom SDK not loaded yet');
      return;
    }

    console.log('Initializing map...', mapRef.current);

    // Save references to tt and ttServices
    ttRef.current = window.tt;
    ttServicesRef.current = window.tt.services;

    // Initialize the map
    const map = window.tt.map({
      key: apiKey,
      container: mapRef.current,
      center: [-79.3832, 43.6532],
      zoom: 6
    });

    // Save the map instance for later use
    mapInstanceRef.current = map;

    // Add map controls
    map.addControl(new window.tt.FullscreenControl());
    map.addControl(new window.tt.NavigationControl());

    // Show traffic flow when map loads
    map.on('load', () => {
      map.showTrafficFlow();
      setMapLoaded(true);
      console.log('Map loaded successfully');
    });

    // Initialize the search box
    if (window.tt.plugins && window.tt.plugins.SearchBox) {
      const searchBox = new window.tt.plugins.SearchBox(window.tt.services, {
        searchOptions: { key: apiKey, language: "en-GB", limit: 5 },
        autocompleteOptions: { key: apiKey, language: "en-GB" }
      });

      // Save search box reference
      searchBoxRef.current = searchBox;

      // Add search box to the DOM
      const searchBoxContainer = document.getElementById("search-container-inner");
      if (searchBoxContainer) {
        searchBoxContainer.appendChild(searchBox.getSearchBoxHTML());
      }

      // Initialize the search markers manager
      const searchMarkersManager = new SearchMarkersManager(map);
      searchMarkersManagerRef.current = searchMarkersManager;

      // Add event listeners for search box
      searchBox.on("tomtom.searchbox.resultsfound", e => {
        searchMarkersManager.draw(e.data.results.fuzzySearch.results);
        fitToViewport(e.data.results.fuzzySearch.results, map);
      });

      searchBox.on("tomtom.searchbox.resultselected", e => {
        searchMarkersManager.draw([e.data.result]);
        fitToViewport(e.data.result, map);
      });

      searchBox.on("tomtom.searchbox.resultfocused", e => {
        searchMarkersManager.draw([e.data.result]);
        fitToViewport(e.data.result, map);
      });

      searchBox.on("tomtom.searchbox.resultscleared", () => searchMarkersManager.clear());
    }

    // Set up traffic toggle event listeners
    const flowToggle = document.getElementById('flow-toggle');
    const incidentsToggle = document.getElementById('incidents-toggle');

    if (flowToggle) {
      flowToggle.addEventListener('change', e => {
        if (e.target.checked) {
          map.showTrafficFlow();
        } else {
          map.hideTrafficFlow();
        }
      });
    }

    if (incidentsToggle) {
      incidentsToggle.addEventListener('change', e => {
        if (e.target.checked) {
          map.showTrafficIncidents();
        } else {
          map.hideTrafficIncidents();
        }
      });
    }
  };

  // Function to fit map viewport to markers
  const fitToViewport = (markerData, map) => {
    if (!markerData || markerData.length === 0 || !window.tt) return;
    const bounds = new window.tt.LngLatBounds();
    (Array.isArray(markerData) ? markerData : [markerData]).forEach(item =>
      bounds.extend([item.position.lng || item.position.lon, item.position.lat])
    );
    map.fitBounds(bounds, { padding: 100, linear: true });
  };

  // Search Markers Manager constructor
  function SearchMarkersManager(map) {
    this.map = map;
    this.markers = {};
  }

  // Draw markers method
  SearchMarkersManager.prototype.draw = function (poiList) {
    this.clear();
    poiList.forEach(poi => {
      const id = poi.id || Math.random().toString(36).substr(2, 9);
      this.markers[id] = new window.tt.Marker()
        .setLngLat([poi.position.lng || poi.position.lon, poi.position.lat])
        .addTo(this.map);
    });
  };

  // Clear markers method
  SearchMarkersManager.prototype.clear = function () {
    Object.values(this.markers).forEach(marker => marker.remove());
    this.markers = {};
  };

  // Geocode a place name to coordinates
  const geocode = async (place) => {
    try {
      const res = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(place)}.json?key=${apiKey}`
      );
      const data = await res.json();
      if (!data.results.length) throw new Error("Place not found: " + place);
      const pos = data.results[0].position;
      return [pos.lat, pos.lon];
    } catch (err) {
      throw new Error(`Geocoding error: ${err.message}`);
    }
  };

  // Handle routing between origin and destination
  const handleRouting = async () => {
    if (!origin || !destination) {
      alert("Please enter both origin and destination.");
      return;
    }

    if (!ttServicesRef.current) {
      alert("Map services are still loading. Please try again in a moment.");
      return;
    }

    try {
      const originCoords = await geocode(origin);
      const destinationCoords = await geocode(destination);

      const routeData = await ttServicesRef.current.calculateRoute({
        key: apiKey,
        locations: `${originCoords[1]},${originCoords[0]}:${destinationCoords[1]},${destinationCoords[0]}`,
        traffic: true
      });

      const route = routeData.routes[0].summary;
      const geojson = routeData.toGeoJson();

      const map = mapInstanceRef.current;

      if (map.getLayer("route")) map.removeLayer("route");
      if (map.getSource("route")) map.removeSource("route");

      map.addLayer({
        id: "route",
        type: "line",
        source: { type: "geojson", data: geojson },
        paint: { "line-color": "#007AFF", "line-width": 5 }
      });

      // Update route info state
      setRouteInfo({
        origin,
        destination,
        distance: (route.lengthInMeters / 1000).toFixed(1),
        duration: Math.round(route.travelTimeInSeconds / 60)
      });

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>

      <div className="sidebar">
        <div id="search-container-inner"></div>

        <label htmlFor="origin">Origin:</label>
        <input
          type="text"
          id="origin"
          placeholder="e.g. Toronto"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />

        <label htmlFor="destination">Destination:</label>
        <input
          type="text"
          id="destination"
          placeholder="e.g. Ottawa"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <button onClick={handleRouting} disabled={!mapLoaded}>Get Route</button>

        <div className="toggle-label">
          <label htmlFor="flow-toggle">Traffic Flow</label>
          <label className="switch">
            <input id="flow-toggle" type="checkbox" defaultChecked />
            <span className="toggle round"></span>
          </label>
        </div>

        <div className="toggle-label">
          <label htmlFor="incidents-toggle">Traffic Incidents</label>
          <label className="switch">
            <input id="incidents-toggle" type="checkbox" />
            <span className="toggle round"></span>
          </label>
        </div>

        {routeInfo && (
          <div id="info">
            <strong>From:</strong> {routeInfo.origin}<br />
            <strong>To:</strong> {routeInfo.destination}<br />
            <strong>Distance:</strong> {routeInfo.distance} km<br />
            <strong>Estimated Time:</strong> {routeInfo.duration} minutes
          </div>
        )}
      </div>
    </div>
  );
};

export default TomTomMap;
