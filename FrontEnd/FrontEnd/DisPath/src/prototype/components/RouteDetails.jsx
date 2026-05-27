import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Route as RouteIcon, ChevronLeft, Calendar, Clock, MapPin, Package, UserCheck } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverMarkerIcon = L.divIcon({
  className: 'driver-marker-icon',
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #0f172a;
      border: 3px solid #f97316;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">
      🚚
    </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 32],
  popupAnchor: [0, -28]
});

const DEPOT_COORDINATES = {
  lat: 43.73024,
  lng: -79.605492
};

const DEPOT_POINT = [DEPOT_COORDINATES.lat, DEPOT_COORDINATES.lng];
const DEFAULT_CENTER = DEPOT_POINT;

const RouteDetails = ({ route, orders, customers, drivers = [], onBack, onAssignDriver, onOptimizeRoute }) => {
  const [selectedDriver, setSelectedDriver] = useState(route?.driverId || '');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeError, setOptimizeError] = useState('');
  const [activeStopId, setActiveStopId] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverLocationMessage, setDriverLocationMessage] = useState('');
  const [refreshingDriverLocation, setRefreshingDriverLocation] = useState(false);
  const orderMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(orders) ? orders : []).forEach(o => {
      if (o && o.id) map.set(o.id, o);
    });
    return map;
  }, [orders]);

  const orderedOrders = useMemo(() => {
    const ids = Array.isArray(route?.orderIds) ? route.orderIds : [];
    const fromIds = ids.map(id => orderMap.get(id)).filter(Boolean);
    // include any orders on this route not listed in orderIds as a fallback
    const extras = (Array.isArray(orders) ? orders : []).filter(o => String(o.routeId) === String(route?.id) && !ids.includes(o.id));
    return [...fromIds, ...extras];
  }, [route?.orderIds, route?.id, orderMap, orders]);

  const travelLegMinutes = useMemo(() => (
    Array.isArray(route?.legDurationsMinutes) ? route.legDurationsMinutes : []
  ), [route?.legDurationsMinutes]);

  useEffect(() => {
    setSelectedDriver(route?.driverId || '');
  }, [route?.driverId, route?.id]);

  const totalDrivers = drivers ? drivers.length : 0;
  const serviceMinutes = orderedOrders.reduce((total, order) => total + (order?.serviceTime || 0), 0);
  const travelMinutes = typeof route?.estimatedDurationMinutes === 'number'
    ? route.estimatedDurationMinutes
    : 0;
  const completionTime = serviceMinutes + travelMinutes;

  const geometryPoints = Array.isArray(route?.geometry)
    ? route.geometry
        .filter(point => Array.isArray(point) && point.length === 2 && point.every(coord => typeof coord === 'number'))
        .map(([lng, lat]) => [lat, lng])
    : [];

  const customerLookup = useMemo(() => {
    const map = new Map();
    (customers || []).forEach((customer) => {
      const id = customer.id || customer._id || String(customer.id);
      if (id) map.set(String(id), customer);
    });
    return map;
  }, [customers]);

  const orderCoordinates = orderedOrders
    .map((order) => {
      const lat = typeof order?.dropoffLat === 'number' ? order.dropoffLat : order?.pickupLat;
      const lng = typeof order?.dropoffLng === 'number' ? order.dropoffLng : order?.pickupLng;
      if (typeof lat === 'number' && typeof lng === 'number') {
        return {
          id: order?.id,
          label: order?.service || order?.customerName || 'Order',
          lat,
          lng,
          serviceTime: order?.serviceTime
        };
      }
      return null;
    })
    .filter(Boolean);

  const coordinateLookup = useMemo(() => {
    const map = new Map();
    orderCoordinates.forEach(coord => map.set(coord.id, coord));
    return map;
  }, [orderCoordinates]);

  const fallbackPolyline = React.useMemo(() => {
    if (orderCoordinates.length === 0) return [];
    const chain = [DEPOT_POINT];
    orderCoordinates.forEach(coord => chain.push([coord.lat, coord.lng]));
    chain.push(DEPOT_POINT);
    return chain;
  }, [orderCoordinates]);

  const polylinePoints = geometryPoints.length > 0
    ? geometryPoints
    : fallbackPolyline;
  const mapCenter = geometryPoints[0]
    || (orderCoordinates[0] ? [orderCoordinates[0].lat, orderCoordinates[0].lng] : DEFAULT_CENTER);

  const fetchDriverLocation = useCallback(async (options = {}) => {
    const { isCancelled } = options;
    const isAborted = () => (typeof isCancelled === 'function' ? isCancelled() : false);

    if (!route?.driverId || !route?.id) {
      setDriverLocation(null);
      setDriverLocationMessage('');
      return false;
    }

    if (isAborted()) return false;

    try {
      const response = await fetch(`/api/drivers/${route.driverId}/location?routeId=${route.id}`);
      if (isAborted()) return false;
      if (!response.ok) {
        let message = 'Unable to load driver location';
        try {
          const data = await response.json();
          if (typeof data?.message === 'string') {
            message = data.message;
          }
        } catch {
          // ignore parse errors
        }
        if (!isAborted()) {
          setDriverLocation(null);
          setDriverLocationMessage(message);
        }
        return false;
      }
      const data = await response.json();
      if (isAborted()) return false;
      if (typeof data.lat === 'number' && typeof data.lng === 'number') {
        setDriverLocation({
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp
        });
        setDriverLocationMessage('');
        return true;
      }
      setDriverLocation(null);
      setDriverLocationMessage('Driver location not available');
      return false;
    } catch (err) {
      console.warn('Failed to load driver location', err);
      if (!isAborted()) {
        setDriverLocationMessage('Unable to load driver location');
      }
      return false;
    }
  }, [route?.driverId, route?.id]);

  useEffect(() => {
    if (!route?.driverId) {
      setDriverLocation(null);
      setDriverLocationMessage('');
      return;
    }
    let cancelled = false;
    const cancelFn = () => cancelled;

    const fetchLocation = () => fetchDriverLocation({ isCancelled: cancelFn });

    fetchLocation();
    const interval = setInterval(fetchLocation, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [route?.driverId, route?.id, fetchDriverLocation]);
  const hasMapData = polylinePoints.length > 0 || orderCoordinates.length > 0;
  const depotStart = geometryPoints.length > 0 ? geometryPoints[0] : DEPOT_POINT;
  const depotEnd = geometryPoints.length > 0 ? geometryPoints[geometryPoints.length - 1] : DEPOT_POINT;
  const showDepotEnd = depotEnd && (depotEnd[0] !== depotStart[0] || depotEnd[1] !== depotStart[1]);

  const arrivalInfo = useMemo(() => {
    const map = new Map();
    let cumulative = 0;
    orderedOrders.forEach((order, idx) => {
      const legMinutes = typeof travelLegMinutes[idx] === 'number' ? travelLegMinutes[idx] : 0;
      cumulative += legMinutes;
      if (order && order.id) map.set(order.id, cumulative);
      const serviceTime = typeof order?.serviceTime === 'number'
        ? order.serviceTime
        : parseFloat(order?.serviceTime);
      if (!Number.isNaN(serviceTime)) {
        cumulative += serviceTime;
      }
    });
    const finalLegIndex = orderedOrders.length;
    if (typeof travelLegMinutes[finalLegIndex] === 'number') {
      cumulative += travelLegMinutes[finalLegIndex];
    }
    return { arrivalMap: map, totalMinutes: cumulative };
  }, [orderedOrders, travelLegMinutes]);

  const arrivalMinutesByOrderId = arrivalInfo.arrivalMap;

  const formatClockTime = (minutesFromNow) => {
    if (typeof minutesFromNow !== 'number' || Number.isNaN(minutesFromNow)) return null;
    const now = new Date();
    const arrival = new Date(now.getTime() + minutesFromNow * 60000);
    return arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatEta = (order) => {
    const computedArrival = arrivalMinutesByOrderId.get(order.id);
    if (typeof computedArrival === 'number' && computedArrival >= 0) {
      const clock = formatClockTime(computedArrival);
      if (clock) return clock;
    }
    if (typeof order.etaMinutes === 'number') {
      const clock = formatClockTime(order.etaMinutes);
      if (clock) return clock;
    }
    if (typeof order.estimatedArrivalMinutes === 'number') {
      const clock = formatClockTime(order.estimatedArrivalMinutes);
      if (clock) return clock;
    }
    if (order.estimatedArrival || order.arrivalTime) {
      const value = order.estimatedArrival || order.arrivalTime;
      try {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch {
        return value;
      }
      return value;
    }
    return '—';
  };

  const getCustomerName = useCallback((order) => {
    if (order.customerName) return order.customerName;
    if (order.customer && order.customer.name) return order.customer.name;
    if (order.customerId && customerLookup.has(String(order.customerId))) {
      return customerLookup.get(String(order.customerId)).name;
    }
    return 'Customer';
  }, [customerLookup]);

  const getOrderAddress = useCallback((order) => {
    if (!order) return '—';
    const addressFields = [
      order.dropoffAddress,
      order.pickupAddress,
      order.address,
      order.customerAddress
    ];
    for (const value of addressFields) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    if (order.customerId && customerLookup.has(String(order.customerId))) {
      const customer = customerLookup.get(String(order.customerId));
      if (customer?.address) {
        return customer.address;
      }
    }
    const lat = typeof order?.dropoffLat === 'number' ? order.dropoffLat : order?.pickupLat;
    const lng = typeof order?.dropoffLng === 'number' ? order.dropoffLng : order?.pickupLng;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    return 'Address pending';
  }, [customerLookup]);

  const routeStops = useMemo(() => {
    const stops = [];
    stops.push({
      id: 'depot-start',
      label: 'Depot (Start)',
      type: 'depot-start',
      lat: DEPOT_COORDINATES.lat,
      lng: DEPOT_COORDINATES.lng
    });
    orderedOrders.forEach((order) => {
      const coords = coordinateLookup.get(order.id);
      stops.push({
        id: order.id,
        type: 'order',
        label: getCustomerName(order),
        order,
        lat: coords?.lat,
        lng: coords?.lng
      });
    });
    stops.push({
      id: 'depot-end',
      label: 'Depot (End)',
      type: 'depot-end',
      lat: DEPOT_COORDINATES.lat,
      lng: DEPOT_COORDINATES.lng
    });
    return stops;
  }, [orderedOrders, coordinateLookup, getCustomerName]);

  useEffect(() => {
    if (routeStops.length === 0) {
      setActiveStopId(null);
      return;
    }
    const stillValid = routeStops.some(stop => stop.id === activeStopId);
    if (!stillValid) {
      setActiveStopId(routeStops[0].id);
    }
  }, [routeStops, activeStopId]);

  const handleSelectStop = (stopId) => {
    setActiveStopId(stopId);
  };

  const formatMinutes = (value) => {
    if (!value || Number.isNaN(value)) return '0';
    return (Math.round(value * 10) / 10).toString();
  };

  const formatDurationLabel = (value) => {
    if (!value || Number.isNaN(value)) return '0 min';
    const totalMinutes = Math.round(value);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours <= 0) {
      return `${minutes} min`;
    }
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatKilometers = (value) => {
    if (!value || Number.isNaN(value)) return '0';
    return (Math.round(value * 100) / 100).toString();
  };

  const assignedDriverName = route?.driverName ||
    (route?.driverId ? (drivers.find(d => d.id === route.driverId)?.name || '') : '');
  const canAssign = !!selectedDriver;

  const handleOptimize = async () => {
    if (!onOptimizeRoute || !route?.id) return;
    try {
      setOptimizing(true);
      setOptimizeError('');
      await onOptimizeRoute(route.id);
    } catch (err) {
      console.error('Failed to optimize route', err);
      setOptimizeError('Failed to optimize route. Try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      setAssignError('Select a driver to assign');
      return;
    }
    if (!onAssignDriver) return;
    try {
      setAssigning(true);
      setAssignError('');
      await onAssignDriver(route.id, selectedDriver);
    } catch (err) {
      console.error('Failed to assign driver', err);
      setAssignError('Failed to assign driver. Try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleManualDriverRefresh = async () => {
    if (!route?.driverId || refreshingDriverLocation) return;
    try {
      setRefreshingDriverLocation(true);
      await fetchDriverLocation();
    } finally {
      setRefreshingDriverLocation(false);
    }
  };

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 mb-4"
      >
        <ChevronLeft size={18} /> Back to Routes
      </button>
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RouteIcon className="text-blue-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">{route.name}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            route.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {route.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={18} />
            <span>Date: {route.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={18} />
            <span>
              Completion Time: {formatDurationLabel(completionTime)}
              <span className="text-xs text-gray-500 ml-1">
                (Service {formatMinutes(serviceMinutes)} + Travel {formatMinutes(travelMinutes)})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={18} />
            <span>Distance: {formatKilometers(route.kilometers)} km</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Package size={18} />
            <span>Assigned Orders: {orderedOrders.length}</span>
          </div>
        </div>

        {/* Actions Section */}
        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Driver</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Driver <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a driver...</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} {driver.status ? `(${driver.status})` : ''}
                  </option>
                ))}
              </select>
              {drivers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No drivers available. Create drivers first.</p>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <UserCheck size={16} className="text-blue-600" />
                {assignedDriverName ? `Currently assigned: ${assignedDriverName}` : 'No driver assigned'}
              </p>
              <p className="text-xs text-gray-500 mt-1">{totalDrivers} drivers available</p>
            </div>
          </div>
          {assignError && <p className="text-sm text-red-500 mb-3">{assignError}</p>}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <button
              onClick={handleAssignDriver}
              disabled={!canAssign || assigning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                canAssign && !assigning
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {assigning ? 'Assigning...' : 'Assign Driver'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Orders on this Route</h2>
          {orderedOrders.length === 0 ? (
            <p className="text-gray-500">No orders assigned to this route.</p>
          ) : (
            <ul className="space-y-2">
              {orderedOrders.map((order, index) => (
                <li key={order.id} className="bg-gray-50 rounded px-3 py-2 text-sm flex items-center gap-3">
                  <span className="text-xs font-semibold text-blue-600">{index + 1}.</span>
                  <div>
                    <span className="font-medium text-gray-900">{order.service || 'Order'}</span>
                    {order.serviceTime ? ` (${order.serviceTime} min)` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Route Map</h2>
              <p className="text-sm text-gray-500">Visualize depot, stops and route geometry</p>
              {driverLocationMessage && (
                <p className="text-sm text-amber-600">{driverLocationMessage}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {route?.driverId && (
              <button
                onClick={handleManualDriverRefresh}
                disabled={refreshingDriverLocation}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  refreshingDriverLocation
                    ? 'border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed'
                    : 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {refreshingDriverLocation ? 'Refreshing...' : 'Refresh Driver Location'}
              </button>
            )}
            <button
              onClick={handleOptimize}
              disabled={optimizing || orderedOrders.length === 0}
              className={`px-6 py-3 rounded-lg text-sm font-medium ${
                optimizing || orderedOrders.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {optimizing ? 'Optimizing...' : 'Optimize Route'}
            </button>
          </div>
        </div>
        {optimizeError && (
          <p className="text-sm text-red-500 mb-3">{optimizeError}</p>
        )}
        {hasMapData ? (
          <MapContainer
            center={mapCenter}
            zoom={11}
            style={{ height: '420px', width: '100%' }}
            scrollWheelZoom={false}
            className="rounded-lg overflow-hidden"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {polylinePoints.length > 1 && (
              <Polyline positions={polylinePoints} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }} />
            )}
            {depotStart && (
              <CircleMarker
                center={depotStart}
                radius={8}
                pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.8 }}
                eventHandlers={{ click: () => handleSelectStop('depot-start') }}
              >
                <Popup>Depot (Start)</Popup>
              </CircleMarker>
            )}
            {depotStart && activeStopId === 'depot-start' && (
              <CircleMarker
                center={depotStart}
                radius={14}
                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2 }}
              />
            )}
            {showDepotEnd && (
              <CircleMarker
                center={depotEnd}
                radius={8}
                pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.8 }}
                eventHandlers={{ click: () => handleSelectStop('depot-end') }}
              >
                <Popup>Depot (End)</Popup>
              </CircleMarker>
            )}
            {showDepotEnd && activeStopId === 'depot-end' && (
              <CircleMarker
                center={depotEnd}
                radius={14}
                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2 }}
              />
            )}
            {orderCoordinates.map((order) => (
              <React.Fragment key={order.id}>
                <Marker
                  position={[order.lat, order.lng]}
                  icon={defaultMarkerIcon}
                  eventHandlers={{ click: () => handleSelectStop(order.id) }}
                >
                  <Popup>
                    <p className="font-semibold">{order.label}</p>
                    {order.serviceTime ? <p className="text-xs">Service time: {order.serviceTime} min</p> : null}
                  </Popup>
                </Marker>
                {activeStopId === order.id && (
                  <CircleMarker
                    center={[order.lat, order.lng]}
                    radius={14}
                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2 }}
                  />
                )}
              </React.Fragment>
            ))}
            {driverLocation && (
              <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverMarkerIcon}>
                <Popup>
                  <p className="font-semibold">Driver</p>
                  {driverLocation.timestamp ? (
                    <p className="text-xs">
                      Updated: {new Date(driverLocation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  ) : null}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <p className="text-gray-500">No coordinates available yet. Assign orders with valid addresses to view the map.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <RouteIcon className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Stop Details</h2>
        </div>
        {routeStops.length === 0 ? (
          <p className="text-gray-500">Assign orders to see stop level details.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Service</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">Service Time</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Arrival</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {routeStops.map((stop, index) => {
                  const isDepot = stop.type === 'depot-start' || stop.type === 'depot-end';
                  const order = stop.order;
                  const isActive = activeStopId === stop.id;
                  const priority = order?.priority || 'Medium';
                  const arrivalDisplay = isDepot
                    ? (stop.type === 'depot-start'
                      ? formatClockTime(0) || 'Now'
                      : arrivalInfo.totalMinutes > 0
                        ? formatClockTime(arrivalInfo.totalMinutes)
                          : formatClockTime(route?.estimatedDurationMinutes) || formatMinutes(route?.estimatedDurationMinutes))
                    : formatEta(order || {});
                  const addressDisplay = isDepot
                    ? `Company Depot (${DEPOT_COORDINATES.lat.toFixed(4)}, ${DEPOT_COORDINATES.lng.toFixed(4)})`
                    : getOrderAddress(order);
                  return (
                    <tr
                      key={stop.id}
                      className={`border-b last:border-0 cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSelectStop(stop.id)}
                    >
                      <td className="py-3 pr-4 font-semibold text-gray-700">{index + 1}</td>
                      <td className="py-3 pr-4 text-gray-900">{stop.label}</td>
                      <td className="py-3 pr-4 text-gray-700">{order?.service || (isDepot ? 'Depot' : '—')}</td>
                      <td className="py-3 pr-4 text-gray-700 max-w-xs">
                        <span className="block break-words">{addressDisplay}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{order?.serviceTime ? `${order.serviceTime} min` : '—'}</td>
                      <td className="py-3 pr-4">
                        {isDepot ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Depot</span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            priority?.toLowerCase() === 'high'
                              ? 'bg-red-100 text-red-700'
                              : priority?.toLowerCase() === 'low'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}>
                            {priority}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{arrivalDisplay}</td>
                      <td className="py-3 pr-4">
                        {isDepot ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {stop.type === 'depot-start' ? 'Origin' : 'Return'}
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order?.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : order?.status === 'assigned'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}>
                            {(order?.status || 'pending').toString().replace(/_/g, ' ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteDetails;
