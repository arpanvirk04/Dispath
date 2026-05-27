import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Clock,
  Truck,
  Users,
  Navigation,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Zap,
  X
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons with stop numbers
const createCustomIcon = (color, stopNumber) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${stopNumber}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom truck/car icon for vehicle marker using Lucide Truck SVG
const createVehicleIcon = () => new L.DivIcon({
  className: 'custom-vehicle-marker',
  html: `<div style="background: #fff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.18); border: 2px solid #3b82f6; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#2563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
      <rect x='2' y='7' width='15' height='10' rx='2'/>
      <path d='M17 17V7'/>
      <path d='M17 12h3l2 3v2a2 2 0 0 1-2 2h-1'/>
      <circle cx='5.5' cy='17.5' r='1.5'/>
      <circle cx='18.5' cy='17.5' r='1.5'/>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Sample active routes with realistic Toronto coordinates
const activeRoutes = [
  {
    id: 'route-1',
    name: 'Downtown Express',
    driver: 'John Smith',
    vehicle: 'Truck-001',
    status: 'in-progress',
    progress: 65,
    estimatedTime: '45 min',
    totalDistance: '28.5 km',
    customers: [
      {
        id: 'c1',
        name: 'Sarah Johnson',
        address: '100 Queen St W, Toronto',
        phone: '+1 416-555-0101',
        email: 'sarah.j@email.com',
        coordinates: [43.6508, -79.3832],
        status: 'completed',
        deliveryTime: '9:30 AM'
      },
      {
        id: 'c2',
        name: 'Mike Chen',
        address: '200 King St W, Toronto',
        phone: '+1 416-555-0102',
        email: 'mike.c@email.com',
        coordinates: [43.6481, -79.3889],
        status: 'completed',
        deliveryTime: '10:15 AM'
      },
      {
        id: 'c3',
        name: 'Emily Davis',
        address: '300 Bay St, Toronto',
        phone: '+1 416-555-0103',
        email: 'emily.d@email.com',
        coordinates: [43.6515, -79.3805],
        status: 'in-progress',
        deliveryTime: '11:00 AM'
      },
      {
        id: 'c4',
        name: 'Robert Wilson',
        address: '400 Adelaide St W, Toronto',
        phone: '+1 416-555-0104',
        email: 'robert.w@email.com',
        coordinates: [43.6465, -79.3950],
        status: 'pending',
        deliveryTime: '11:45 AM'
      },
      {
        id: 'c5',
        name: 'Jessica Martinez',
        address: '500 Richmond St W, Toronto',
        phone: '+1 416-555-0105',
        email: 'jessica.m@email.com',
        coordinates: [43.6478, -79.4020],
        status: 'pending',
        deliveryTime: '12:30 PM'
      },
      {
        id: 'c6',
        name: 'David Thompson',
        address: '600 Front St W, Toronto',
        phone: '+1 416-555-0106',
        email: 'david.t@email.com',
        coordinates: [43.6425, -79.3995],
        status: 'pending',
        deliveryTime: '1:15 PM'
      },
      {
        id: 'c7',
        name: 'Lisa Park',
        address: '700 Wellington St W, Toronto',
        phone: '+1 416-555-0107',
        email: 'lisa.p@email.com',
        coordinates: [43.6440, -79.4100],
        status: 'pending',
        deliveryTime: '2:00 PM'
      },
      {
        id: 'c8',
        name: 'Mark Rodriguez',
        address: '800 Bathurst St, Toronto',
        phone: '+1 416-555-0108',
        email: 'mark.r@email.com',
        coordinates: [43.6555, -79.4137],
        status: 'pending',
        deliveryTime: '2:45 PM'
      }
    ],
    routePath: [
      [43.6532, -79.3832], // Start - Humber College area
      [43.6508, -79.3832], // Customer 1
      [43.6481, -79.3889], // Customer 2
      [43.6515, -79.3805], // Customer 3
      [43.6465, -79.3950], // Customer 4
      [43.6478, -79.4020], // Customer 5
      [43.6425, -79.3995], // Customer 6
      [43.6440, -79.4100], // Customer 7
      [43.6555, -79.4137], // Customer 8
      [43.6532, -79.3832]  // Return to base
    ]
  },
  {
    id: 'route-2',
    name: 'Midtown Circuit',
    driver: 'Lisa Anderson',
    vehicle: 'Van-002',
    status: 'active',
    progress: 30,
    estimatedTime: '85 min',
    totalDistance: '42.8 km',
    customers: [
      {
        id: 'c9',
        name: 'David Wilson',
        address: '500 Bloor St E, Toronto',
        phone: '+1 416-555-0201',
        email: 'david.w@email.com',
        coordinates: [43.6708, -79.3648],
        status: 'completed',
        deliveryTime: '2:00 PM'
      },
      {
        id: 'c10',
        name: 'Jennifer Liu',
        address: '600 Yonge St, Toronto',
        phone: '+1 416-555-0202',
        email: 'jennifer.l@email.com',
        coordinates: [43.6632, -79.3832],
        status: 'in-progress',
        deliveryTime: '2:45 PM'
      },
      {
        id: 'c11',
        name: 'Robert Kim',
        address: '700 Spadina Ave, Toronto',
        phone: '+1 416-555-0203',
        email: 'robert.k@email.com',
        coordinates: [43.6566, -79.4003],
        status: 'pending',
        deliveryTime: '3:30 PM'
      },
      {
        id: 'c12',
        name: 'Angela Foster',
        address: '800 St. Clair Ave W, Toronto',
        phone: '+1 416-555-0204',
        email: 'angela.f@email.com',
        coordinates: [43.6778, -79.4103],
        status: 'pending',
        deliveryTime: '4:15 PM'
      },
      {
        id: 'c13',
        name: 'Michael Chang',
        address: '900 Eglinton Ave W, Toronto',
        phone: '+1 416-555-0205',
        email: 'michael.c@email.com',
        coordinates: [43.7001, -79.4163],
        status: 'pending',
        deliveryTime: '5:00 PM'
      },
      {
        id: 'c14',
        name: 'Rachel Green',
        address: '1000 Avenue Rd, Toronto',
        phone: '+1 416-555-0206',
        email: 'rachel.g@email.com',
        coordinates: [43.6889, -79.3956],
        status: 'pending',
        deliveryTime: '5:45 PM'
      },
      {
        id: 'c15',
        name: 'Steven Wright',
        address: '1100 Mount Pleasant Rd, Toronto',
        phone: '+1 416-555-0207',
        email: 'steven.w@email.com',
        coordinates: [43.6945, -79.3889],
        status: 'pending',
        deliveryTime: '6:30 PM'
      },
      {
        id: 'c16',
        name: 'Michelle Torres',
        address: '1200 Bayview Ave, Toronto',
        phone: '+1 416-555-0208',
        email: 'michelle.t@email.com',
        coordinates: [43.6823, -79.3745],
        status: 'pending',
        deliveryTime: '7:15 PM'
      }
    ],
    routePath: [
      [43.6532, -79.3832],
      [43.6708, -79.3648],
      [43.6632, -79.3832],
      [43.6566, -79.4003],
      [43.6778, -79.4103],
      [43.7001, -79.4163],
      [43.6889, -79.3956],
      [43.6945, -79.3889],
      [43.6823, -79.3745],
      [43.6532, -79.3832]
    ]
  },
  {
    id: 'route-3',
    name: 'North York Express',
    driver: 'Carlos Rodriguez',
    vehicle: 'Truck-003',
    status: 'active',
    progress: 85,
    estimatedTime: '25 min',
    totalDistance: '58.7 km',
    customers: [
      {
        id: 'c17',
        name: 'Amanda Foster',
        address: '800 Sheppard Ave E, Toronto',
        phone: '+1 416-555-0301',
        email: 'amanda.f@email.com',
        coordinates: [43.7615, -79.3496],
        status: 'completed',
        deliveryTime: '11:00 AM'
      },
      {
        id: 'c18',
        name: 'Thomas Brown',
        address: '900 Finch Ave W, Toronto',
        phone: '+1 416-555-0302',
        email: 'thomas.b@email.com',
        coordinates: [43.7731, -79.4512],
        status: 'completed',
        deliveryTime: '11:45 AM'
      },
      {
        id: 'c19',
        name: 'Maria Gonzalez',
        address: '1000 Don Mills Rd, Toronto',
        phone: '+1 416-555-0303',
        email: 'maria.g@email.com',
        coordinates: [43.7280, -79.3389],
        status: 'completed',
        deliveryTime: '12:30 PM'
      },
      {
        id: 'c20',
        name: 'James Murphy',
        address: '1100 Lawrence Ave E, Toronto',
        phone: '+1 416-555-0304',
        email: 'james.m@email.com',
        coordinates: [43.7284, -79.3645],
        status: 'completed',
        deliveryTime: '1:15 PM'
      },
      {
        id: 'c21',
        name: 'Sophie Chen',
        address: '1200 York Mills Rd, Toronto',
        phone: '+1 416-555-0305',
        email: 'sophie.c@email.com',
        coordinates: [43.7456, -79.3889],
        status: 'completed',
        deliveryTime: '2:00 PM'
      },
      {
        id: 'c22',
        name: 'Daniel Lee',
        address: '1300 Steeles Ave E, Toronto',
        phone: '+1 416-555-0306',
        email: 'daniel.l@email.com',
        coordinates: [43.7889, -79.3445],
        status: 'completed',
        deliveryTime: '2:45 PM'
      },
      {
        id: 'c23',
        name: 'Natalie Adams',
        address: '1400 Jane St, Toronto',
        phone: '+1 416-555-0307',
        email: 'natalie.a@email.com',
        coordinates: [43.7623, -79.5178],
        status: 'in-progress',
        deliveryTime: '3:30 PM'
      },
      {
        id: 'c24',
        name: 'Kevin Walsh',
        address: '1500 Keele St, Toronto',
        phone: '+1 416-555-0308',
        email: 'kevin.w@email.com',
        coordinates: [43.7445, -79.4712],
        status: 'pending',
        deliveryTime: '4:15 PM'
      }
    ],
    routePath: [
      [43.6532, -79.3832],
      [43.7615, -79.3496],
      [43.7731, -79.4512],
      [43.7280, -79.3389],
      [43.7284, -79.3645],
      [43.7456, -79.3889],
      [43.7889, -79.3445],
      [43.7623, -79.5178],
      [43.7445, -79.4712],
      [43.6532, -79.3832]
    ]
  }
];

// Route optimization simulation function
const simulateRouteOptimization = (customers) => {
  // Simple algorithm: Sort by distance from start point (43.6532, -79.3832)
  const startPoint = [43.6532, -79.3832];
  
  const calculateDistance = (point1, point2) => {
    const [lat1, lng1] = point1;
    const [lat2, lng2] = point2;
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
  };

  // Create optimized order (simple nearest neighbor algorithm)
  const optimized = [...customers];
  const result = [];
  let currentPoint = startPoint;
  
  while (optimized.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(currentPoint, optimized[0].coordinates);
    
    for (let i = 1; i < optimized.length; i++) {
      const distance = calculateDistance(currentPoint, optimized[i].coordinates);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    const nearest = optimized.splice(nearestIndex, 1)[0];
    result.push(nearest);
    currentPoint = nearest.coordinates;
  }
  
  // Calculate savings (mock data)
  const originalDistance = customers.length * 5.2; // Mock original distance
  const optimizedDistance = originalDistance * 0.75; // 25% savings
  const timeSaved = Math.round((originalDistance - optimizedDistance) * 2); // minutes
  
  return {
    optimizedCustomers: result,
    distanceSaved: (originalDistance - optimizedDistance).toFixed(1),
    timeSaved: timeSaved,
    fuelSaved: ((originalDistance - optimizedDistance) * 0.1).toFixed(1)
  };
};

const ActiveRoutesView = ({ onBack }) => {
  const [selectedRoute, setSelectedRoute] = useState(activeRoutes[0]);
  const [mapCenter, setMapCenter] = useState([43.6532, -79.3832]);
  const [mapZoom, setMapZoom] = useState(11);

  // Route optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);

  // Vehicle animation state
  const [vehiclePosition, setVehiclePosition] = useState(selectedRoute.routePath[0]);
  const [routeProgress, setRouteProgress] = useState(0);
  const animationRef = useRef(null);

  // Animate vehicle along the routePath
  useEffect(() => {
    setVehiclePosition(selectedRoute.routePath[0]);
    setRouteProgress(0);
    if (animationRef.current) clearTimeout(animationRef.current);
    let currentSegment = 0;
    let stepWithinSegment = 0;
    const stepsPerSegment = 80;
    const animate = () => {
      if (currentSegment >= selectedRoute.routePath.length - 1) {
        setVehiclePosition(selectedRoute.routePath[selectedRoute.routePath.length - 1]);
        setRouteProgress(100);
        return;
      }
      const [startLat, startLng] = selectedRoute.routePath[currentSegment];
      const [endLat, endLng] = selectedRoute.routePath[currentSegment + 1];
      const fraction = stepWithinSegment / stepsPerSegment;
      const lat = startLat + (endLat - startLat) * fraction;
      const lng = startLng + (endLng - startLng) * fraction;
      setVehiclePosition([lat, lng]);
      setRouteProgress(Math.round(((currentSegment + fraction) / (selectedRoute.routePath.length - 1)) * 100));
      stepWithinSegment++;
      if (stepWithinSegment > stepsPerSegment) {
        currentSegment++;
        stepWithinSegment = 0;
      }
      animationRef.current = setTimeout(animate, 180);
    };
    animate();
    return () => { if (animationRef.current) clearTimeout(animationRef.current); };
  }, [selectedRoute]);

  // Status colors and icons
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    // Center map on route's first customer or middle of route
    if (route.customers.length > 0) {
      const firstCustomer = route.customers[0];
      setMapCenter(firstCustomer.coordinates);
      setMapZoom(12);
    }
  };

  const handleCustomerClick = (customer) => {
    setMapCenter(customer.coordinates);
    setMapZoom(15);
  };

  // Route optimization handlers
  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = simulateRouteOptimization(selectedRoute.customers);
      setOptimizationResult(result);
      setShowOptimizationModal(true);
      setIsOptimizing(false);
    }, 2000); // 2 second delay to simulate processing
  };

  const applyOptimization = () => {
    if (optimizationResult) {
      // Update the selected route with optimized customer order
      const optimizedRoute = {
        ...selectedRoute,
        customers: optimizationResult.optimizedCustomers.map((customer, index) => ({
          ...customer,
          deliveryTime: `${9 + Math.floor(index * 0.75)}:${(index * 45) % 60 < 10 ? '0' : ''}${(index * 45) % 60} AM`
        })),
        routePath: [
          [43.6532, -79.3832], // Start point
          ...optimizationResult.optimizedCustomers.map(c => c.coordinates),
          [43.6532, -79.3832]  // Return to base
        ],
        totalDistance: `${(parseFloat(selectedRoute.totalDistance) - parseFloat(optimizationResult.distanceSaved)).toFixed(1)} km`,
        estimatedTime: `${Math.max(20, parseInt(selectedRoute.estimatedTime) - optimizationResult.timeSaved)} min`
      };
      
      setSelectedRoute(optimizedRoute);
      setShowOptimizationModal(false);
      setOptimizationResult(null);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Routes</h1>
              <p className="text-gray-600">Real-time delivery tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Route List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Routes ({activeRoutes.length})</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => handleRouteSelect(route)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedRoute.id === route.id 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{route.name}</h3>
                      <p className="text-sm text-gray-600">Driver: {route.driver}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {route.status === 'in-progress' ? (
                        <Pause className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Play className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{route.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${route.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{route.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      <span>{route.totalDistance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{route.customers.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Route Header */}
          <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedRoute.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>{selectedRoute.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedRoute.driver}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>ETA: {selectedRoute.estimatedTime}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{selectedRoute.progress}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <button
                  onClick={handleOptimizeRoute}
                  disabled={isOptimizing}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isOptimizing ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Optimize Route
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Map */}
            <div className="flex-1 relative">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Route Path */}
                <Polyline
                  positions={selectedRoute.routePath}
                  color="#3b82f6"
                  weight={4}
                  opacity={0.7}
                />

                {/* Customer Markers */}
                {selectedRoute.customers.map((customer, index) => (
                  <Marker
                    key={customer.id}
                    position={customer.coordinates}
                    icon={createCustomIcon(getMarkerColor(customer.status), index + 1)}
                  >
                    <Popup>
                      <div className="p-2 min-w-64">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                               style={{backgroundColor: getMarkerColor(customer.status)}}>
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{customer.address}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Delivery: {customer.deliveryTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                        <div className={`mt-2 px-2 py-1 rounded text-xs border ${getStatusColor(customer.status)}`}>
                          Stop #{index + 1} - {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Vehicle Marker (truck/car) */}
                <Marker
                  position={vehiclePosition}
                  icon={createVehicleIcon()}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">{selectedRoute.vehicle}</h3>
                      <p className="text-sm text-gray-600">Driver: {selectedRoute.driver}</p>
                      <div className="mt-2 px-2 py-1 rounded text-xs bg-blue-50 text-blue-800 border border-blue-200">
                        {routeProgress}% complete
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Base Marker */}
                <Marker position={[43.6532, -79.3832]} icon={createCustomIcon('#6366f1', 'H')}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">DisPath Hub</h3>
                      <p className="text-sm text-gray-600">205 Humber College Blvd</p>
                      <div className="mt-2 px-2 py-1 rounded text-xs bg-indigo-50 text-indigo-800 border border-indigo-200">
                        Home Base
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Bottom Panel - Customer List */}
            <div className="h-64 bg-white border-t border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Customers ({selectedRoute.customers.length})
                </h3>
                <div className="text-sm text-gray-600">
                  Click on a row to center map
                </div>
              </div>
              
              {/* Simplified table container */}
              <div className="flex-1 overflow-y-auto">
                <div className="w-full">
                  <table className="w-full text-sm text-left text-gray-700">
                      <thead className="bg-gray-50 border-b sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap">#</th>
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Address</th>
                          <th className="px-4 py-3 font-semibold whitespace-nowrap">Delivery Time</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRoute.customers.map((customer, index) => (
                          <tr
                            key={customer.id}
                            onClick={() => handleCustomerClick(customer)}
                            className="hover:bg-blue-50 cursor-pointer border-b"
                          >
                            <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">{index + 1}</td>
                            <td className="px-4 py-3">{customer.name}</td>
                            <td className="px-4 py-3">{customer.address}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{customer.deliveryTime}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(customer.status)}`}>
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Optimization Modal */}
      {showOptimizationModal && optimizationResult && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl relative z-[10000]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Route Optimization Results</h3>
              <button
                onClick={() => setShowOptimizationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Optimization Benefits</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Distance Saved:</span>
                    <span className="font-semibold text-green-700">{optimizationResult.distanceSaved} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Saved:</span>
                    <span className="font-semibold text-green-700">{optimizationResult.timeSaved} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Saved:</span>
                    <span className="font-semibold text-green-700">{optimizationResult.fuelSaved} liters</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Optimized Stop Order</h4>
                <div className="space-y-1 text-sm">
                  {optimizationResult.optimizedCustomers.slice(0, 4).map((customer, index) => (
                    <div key={customer.id} className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span className="truncate">{customer.name}</span>
                    </div>
                  ))}
                  {optimizationResult.optimizedCustomers.length > 4 && (
                    <div className="text-gray-500 text-xs">
                      +{optimizationResult.optimizedCustomers.length - 4} more stops
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOptimizationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={applyOptimization}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Apply Optimization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveRoutesView;
