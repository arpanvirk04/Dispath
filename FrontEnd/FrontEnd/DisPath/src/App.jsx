import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, NavLink, useParams } from 'react-router-dom';
import CustomerPrototypeService from './prototype/services/customerPrototypeService';
import OrderPrototypeService from './prototype/services/orderPrototypeService';
import RoutePrototypeService from './prototype/services/routePrototypeService';
import LoginForm from './screens/auth/LoginForm.jsx';
import Register from './screens/auth/Register.jsx';
import TomTomMap from "./components/TomTomMap.jsx";
import MapView from "./prototype/MapView.jsx";
import Dashboard from "./prototype/components/Dashboard.jsx";
import Maps from "./prototype/components/Maps.jsx";
import AssetManagement from "./prototype/components/Asset Management.jsx";
import 'leaflet/dist/leaflet.css';

import { LayoutDashboard, Users, Route as RouteIcon, Menu, X, MapPin, Truck, FolderKanban, UserCheck, Package } from 'lucide-react';
// Fixed imports - using the correct components from your prototype folder
import Customer from './prototype/components/Customer.jsx';
import CustomerProfile from './prototype/components/CustomerProfile.jsx';
import RouteInfo from "./prototype/components/RoutesNew.jsx";
import CustomerPortal from "./prototype/components/CustomerPortal.jsx";
import OrderManagement from "./prototype/components/OrderManagement.jsx";
import DriverManagement from "./prototype/components/DriverManagement.jsx";
import ActiveRoutesView from "./prototype/components/ActiveRoutesView.jsx";
import LandingPage from "./prototype/components/LandingPage.jsx";
import DriverOnboarding from "./screens/driver/DriverOnboarding.jsx";


const COMPANY_DEPOT = {
    address: '205 Humber College Blvd., Toronto, ON, M9W 5L7',
    latitude: 43.7283,
    longitude: -79.6067,
};

// Initial mock data
const initialCustomers = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '416-555-1234',
        address: '123 Main St, Toronto, ON',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M1M 1M1',
        country: 'Canada',
        createdAt: new Date('2025-08-10'),
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '416-555-5678',
        address: '456 King St, Toronto, ON',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M2M 2M2',
        country: 'Canada',
        createdAt: new Date('2025-08-09'),
    }
];

// Orders are loaded from the backend API

const initialRoutes = [];

const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Management', icon: Package },
    { id: 'customers', label: 'Customer Management', icon: Users },
    { id: 'routes', label: 'Routes', icon: RouteIcon },
    { id: 'drivers', label: 'Driver Management', icon: UserCheck },
    { id: 'case', label: 'Case Management', icon: FolderKanban },
    { id: 'assets', label: 'Asset Management', icon: Truck },
];

const NotificationToast = ({ notification, onClose }) => {
    if (!notification?.isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`px-4 py-3 rounded-lg shadow-lg text-white ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
                <div className="flex items-center justify-between">
                    <span>{notification.message}</span>
                    <button
                        onClick={onClose}
                        className="ml-4 text-white hover:text-gray-200"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const location = useLocation();

    // Move state declarations early so hooks that reference them don't run before initialization
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customers, setCustomers] = useState(initialCustomers);
    const [orders, setOrders] = useState([]);
    const [routes, setRoutes] = useState(initialRoutes);
    const [drivers, setDrivers] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notification, setNotification] = useState({
        type: 'success',
        message: '',
        isVisible: false,
    });

    const mapOrdersWithRoutes = React.useCallback((orderList) => {
        const routeLookup = new Map();
        (routes || []).forEach(route => {
            (route.orderIds || []).forEach(orderId => {
                routeLookup.set(String(orderId), route);
            });
        });
        return (orderList || []).map(order => {
            const owningRoute = routeLookup.get(String(order.id));
            if (!owningRoute) {
                const normalizedStatus = order.status ? order.status.toString().toLowerCase() : 'pending';
                return { ...order, routeId: null, status: normalizedStatus };
            }
            const existingStatus = order.status ? order.status.toString().toLowerCase() : 'pending';
            const nextStatus = ['completed', 'cancelled'].includes(existingStatus) ? existingStatus : 'assigned';
            return { ...order, routeId: owningRoute.id, status: nextStatus };
        });
    }, [routes]);

    // keep activeTab in sync with the URL so refresh preserves view
    useEffect(() => {
        const path = location.pathname.replace(/^\//, '');
        if (!path || path === '') setActiveTab('dashboard');
        else if (path === 'map' || path === 'mapview') setActiveTab('dashboard');
        else setActiveTab(path);
    }, [location.pathname]);

    const [customersLoading, setCustomersLoading] = useState(false);

    // Fetch customers from backend when the customers tab is active
    useEffect(() => {
        let mounted = true;
        if (activeTab === 'customers') {
            setCustomersLoading(true);
            CustomerPrototypeService.getAllCustomers()
                .then(data => {
                    if (!mounted) return;
                    // Normalize _id -> id
                    const normalized = (data || []).map(c => ({
                        id: c.id || c._id || String(c.id),
                        name: c.name,
                        email: c.email,
                        phone: c.phone,
                        address: c.address,
                        city: c.city || '',
                        state: c.state || '',
                        postalCode: c.postalCode || '',
                        country: c.country || '',
                        latitude: c.latitude,
                        longitude: c.longitude,
                        openingHours: c.openingHours || null,
                        createdAt: c.createdAt || new Date().toISOString()
                    }));
                    setCustomers(normalized);
                })
                .catch(err => {
                    console.warn('Failed to load customers in App', err);
                })
                .finally(() => { if (mounted) setCustomersLoading(false); });
        }
        return () => { mounted = false };
    }, [activeTab]);

    // Fetch orders from backend when orders or dashboard view is active
    useEffect(() => {
        let mounted = true;
        const shouldLoadOrders = activeTab === 'orders' || activeTab === 'dashboard' || activeTab === 'routes';
        if (shouldLoadOrders) {
            OrderPrototypeService.getOrders()
                .then(data => {
                    if (!mounted) return;
                    const normalized = (data || []).map(o => ({
                        id: o.id || o._id || String(o.id),
                        customerId: o.customerId,
                        service: o.service || '',
                        serviceTime: o.serviceTime || 0,
                        priority: o.priority || 'Medium',
                        notes: o.notes || '',
                        status: (o.status || 'pending').toString().toLowerCase(),
                        createdDate: o.createdAt ? (new Date(o.createdAt)).toISOString().split('T')[0] : (o.createdDate || new Date().toISOString().split('T')[0]),
                        routeId: o.routeId || null,
                        cases: Array.isArray(o.cases) ? o.cases : [],
                        pickupAddress: o.pickupAddress || '',
                        dropoffAddress: o.dropoffAddress || '',
                        pickupLat: typeof o.pickupLat === 'number' ? o.pickupLat : null,
                        pickupLng: typeof o.pickupLng === 'number' ? o.pickupLng : null,
                        dropoffLat: typeof o.dropoffLat === 'number' ? o.dropoffLat : null,
                        dropoffLng: typeof o.dropoffLng === 'number' ? o.dropoffLng : null
                    }));
                    setOrders(mapOrdersWithRoutes(normalized));

                    // Ensure customer names are available for any orders whose customer is not in state
                    (async () => {
                        try {
                            const missingIds = Array.from(new Set(normalized.map(o => o.customerId).filter(Boolean)))
                                .filter(id => !customers.some(c => String(c.id) === String(id)));
                            if (missingIds.length === 0) return;

                            const fetches = missingIds.map(id => CustomerPrototypeService.getCustomerById(id).catch(() => null));
                            const results = await Promise.all(fetches);
                            const newCustomers = (results || [])
                                .filter(Boolean)
                                .map(c => ({
                                    id: c.id || c._id || String(c.id),
                                    name: c.name,
                                    email: c.email,
                                    phone: c.phone,
                                    address: c.address,
                                    createdAt: c.createdAt || new Date().toISOString()
                                }));
                            if (newCustomers.length > 0 && mounted) {
                                // Merge, avoiding duplicates
                                setCustomers(prev => {
                                    const existingIds = new Set(prev.map(x => String(x.id)));
                                    const toAdd = newCustomers.filter(nc => !existingIds.has(String(nc.id)));
                                    return toAdd.length ? [...prev, ...toAdd] : prev;
                                });
                            }
                        } catch (err) {
                            console.warn('Failed to fetch missing customers for orders', err);
                        }
                    })();
                })
                .catch(err => console.warn('Failed to load orders in App', err));
        }
        return () => { mounted = false };
    }, [activeTab, customers, mapOrdersWithRoutes]);
    // const [showActiveRoutes, setShowActiveRoutes] = useState(false);

    const showNotification = (type, message) => {
        setNotification({ type, message, isVisible: true });
        setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
    };

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };

    // Customer operations
    const handleAddCustomer = (customerData) => {
        const newCustomer = {
            ...customerData,
            id: customerData.id || Date.now().toString(),
            createdAt: customerData.createdAt || new Date(),
        };
        setCustomers(prev => [...prev, newCustomer]);
        showNotification('success', `Customer "${customerData.name}" added successfully`);
    };

    const handleEditCustomer = (id, customerData) => {
        setCustomers(prev => prev.map(customer =>
            customer.id === id
                ? { ...customer, ...customerData }
                : customer
        ));
        showNotification('success', `Customer "${customerData.name}" updated successfully`);
    };

    const handleDeleteCustomer = (id) => {
        const customer = customers.find(c => c.id === id);
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        // Remove customer's orders when deleting customer
        setOrders(prev => prev.filter(order => order.customerId !== id));
        // Reset selected customer if it's being deleted
        if (selectedCustomerId === id) {
            setSelectedCustomerId(null);
        }
        showNotification('success', `Customer "${customer?.name}" deleted successfully`);
    };

    // Order operations
    const handleAddOrder = async (customerId, orderData) => {
        // Map frontend order form to backend OrderDTO shape.
        // Backend expects pickup/dropoff addresses and lat/lng. We'll use the customer's address as pickup.
        const customer = customers.find(c => String(c.id) === String(customerId));
        const orderDto = {
            customerId: customerId,
            pickupAddress: COMPANY_DEPOT.address,
            dropoffAddress: orderData.dropoffAddress || customer?.address || '',
            pickupLat: COMPANY_DEPOT.latitude,
            pickupLng: COMPANY_DEPOT.longitude,
            dropoffLat: orderData.dropoffLat ?? null,
            dropoffLng: orderData.dropoffLng ?? null,
            service: orderData.service || '',
            serviceTime: orderData.serviceTime ? parseInt(orderData.serviceTime, 10) : 0,
            priority: orderData.priority || 'Medium',
            notes: orderData.notes || '',
            status: 'CREATED'
        };

        try {
            const created = await OrderPrototypeService.createOrder(orderDto);
            // Normalize created order and append to local state
            const newOrder = {
                id: created.id || created._id || `ORD${Date.now()}`,
                customerId: created.customerId || customerId,
                service: orderData.service || '',
                serviceTime: orderData.serviceTime || 0,
                priority: orderData.priority || 'Medium',
                notes: orderData.notes || '',
                status: created.status || 'pending',
                createdDate: created.createdAt ? (new Date(created.createdAt)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                routeId: created.routeId || null,
                cases: Array.isArray(created.cases) ? created.cases : [],
                pickupAddress: created.pickupAddress || orderData.pickupAddress || '',
                dropoffAddress: created.dropoffAddress || orderData.dropoffAddress || '',
                pickupLat: typeof created.pickupLat === 'number' ? created.pickupLat : null,
                pickupLng: typeof created.pickupLng === 'number' ? created.pickupLng : null,
                dropoffLat: typeof created.dropoffLat === 'number' ? created.dropoffLat : null,
                dropoffLng: typeof created.dropoffLng === 'number' ? created.dropoffLng : null
            };
            setOrders(prev => [...prev, newOrder]);
            showNotification('success', 'Order created successfully');
            return newOrder;
        } catch (err) {
            console.error('Failed to create order via API', err);
            showNotification('error', 'Failed to create order');
            throw err;
        }
    };

    const handleAssignDriverToRoute = async (routeId, driverId) => {
        if (!driverId) return;
        try {
            const updated = await RoutePrototypeService.assignDriverToRoute(routeId, driverId);
            const normalized = {
                id: updated.id || updated._id || routeId,
                name: updated.name,
                date: updated.date,
                kilometers: updated.kilometers || 0,
                estimatedDurationMinutes: updated.estimatedDurationMinutes || 0,
                orderIds: updated.orderIds || [],
                driverId: updated.driverId || null,
                driverName: updated.driverName || null,
                geometry: Array.isArray(updated.geometry) ? updated.geometry : [],
                legDurationsMinutes: Array.isArray(updated.legDurationsMinutes) ? updated.legDurationsMinutes : [],
                createdAt: updated.createdAt || new Date().toISOString()
            };
            setRoutes(prev => prev.map(route => route.id === normalized.id ? normalized : route));
            showNotification('success', 'Driver assigned to route');
            return normalized;
        } catch (err) {
            console.error('Failed to assign driver', err);
            showNotification('error', 'Failed to assign driver');
            throw err;
        }
    };

    const handleOptimizeRoute = async (routeId) => {
        try {
            const summary = await RoutePrototypeService.optimizeRoute(routeId);
            if (!summary || !summary.routeId) return;

            // Refresh all routes to ensure we have updated ordering and metrics
            const data = await RoutePrototypeService.getAllRoutes();
            const normalized = (data || []).map(r => ({
                id: r.id || r._id || String(r.id),
                name: r.name,
                date: r.date,
                kilometers: r.kilometers || 0,
                estimatedDurationMinutes: r.estimatedDurationMinutes || 0,
                orderIds: r.orderIds || r.customerIds || [],
                driverId: r.driverId || null,
                driverName: r.driverName || null,
                geometry: Array.isArray(r.geometry) ? r.geometry : [],
                legDurationsMinutes: Array.isArray(r.legDurationsMinutes) ? r.legDurationsMinutes : [],
                createdAt: r.createdAt || new Date().toISOString()
            }));
            setRoutes(normalized);
            showNotification('success', 'Route optimized successfully');
        } catch (err) {
            console.error('Failed to optimize route', err);
            showNotification('error', 'Failed to optimize route');
        }
    };

    const applyRouteSummary = (route, summary) => {
        if (!summary || !route || route.id !== summary.routeId) return route;
        return {
            ...route,
            name: summary.name || route.name,
            date: summary.date || route.date,
            driverId: summary.driverId || null,
            driverName: summary.driverName || null,
            orderIds: summary.orderIds || [],
            kilometers: typeof summary.totalDistanceKm === 'number' ? summary.totalDistanceKm : route.kilometers || 0,
            estimatedDurationMinutes: typeof summary.totalDurationMinutes === 'number'
                ? summary.totalDurationMinutes
                : route.estimatedDurationMinutes || 0,
            geometry: Array.isArray(summary.geometry) ? summary.geometry : (route.geometry || []),
            legDurationsMinutes: Array.isArray(summary.legDurationsMinutes)
                ? summary.legDurationsMinutes
                : (route.legDurationsMinutes || [])
        };
    };

    const handleAssignOrderToRoute = async (orderId, nextRouteId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            console.warn('Order not found for assignment', orderId);
            return;
        }
        const previousRouteId = order.routeId || null;

        if (previousRouteId === nextRouteId) return;

        try {
            let removalSummary = null;
            if (previousRouteId) {
                removalSummary = await RoutePrototypeService.removeOrderFromRoute(previousRouteId, orderId);
            }
            let additionSummary = null;
            if (nextRouteId) {
                additionSummary = await RoutePrototypeService.addOrderToRoute(nextRouteId, orderId);
            }

            setOrders(prev => prev.map(o =>
                o.id === orderId
                    ? { ...o, routeId: nextRouteId || null, status: nextRouteId ? 'assigned' : 'pending' }
                    : o
            ));

            setRoutes(prev => prev.map(route => {
                if (removalSummary && route.id === removalSummary.routeId) {
                    return applyRouteSummary(route, removalSummary);
                }
                if (additionSummary && route.id === additionSummary.routeId) {
                    return applyRouteSummary(route, additionSummary);
                }
                return route;
            }));

            showNotification('success', nextRouteId ? 'Order assigned to route' : 'Order removed from route');
        } catch (err) {
            console.error('Failed to update route assignment', err);
            showNotification('error', 'Failed to update route assignment');
        }
    };

    // Route operations: load routes also when on Orders tab so dropdowns have data after refresh
    useEffect(() => {
        let mounted = true;
        if (activeTab === 'routes' || activeTab === 'dashboard' || activeTab === 'orders') {
            RoutePrototypeService.getAllRoutes()
                .then(data => {
                    if (!mounted) return;
                    const normalized = (data || []).map(r => ({
                        id: r.id || r._id || String(r.id),
                        name: r.name,
                        date: r.date,
                        kilometers: r.kilometers || 0,
                        estimatedDurationMinutes: r.estimatedDurationMinutes || 0,
                        orderIds: r.orderIds || r.customerIds || [],
                        driverId: r.driverId || null,
                        driverName: r.driverName || null,
                        geometry: Array.isArray(r.geometry) ? r.geometry : [],
                        legDurationsMinutes: Array.isArray(r.legDurationsMinutes) ? r.legDurationsMinutes : [],
                        createdAt: r.createdAt || new Date().toISOString()
                    }));
                    setRoutes(normalized);
                })
                .catch(err => console.warn('Failed to load routes in App', err));
        }
        return () => { mounted = false };
    }, [activeTab]);

    useEffect(() => {
        let mounted = true;
        if (activeTab === 'routes' || activeTab === 'dashboard') {
            RoutePrototypeService.getDrivers()
                .then(data => {
                    if (!mounted) return;
                    setDrivers(data || []);
                })
                .catch(err => console.warn('Failed to load drivers', err));
        }
        return () => { mounted = false };
    }, [activeTab]);

    const handleAddRoute = async (routeData) => {
        try {
            const created = await RoutePrototypeService.createRoute(routeData);
            const newRoute = {
                id: created.id || created._id || `R${Date.now()}`,
                name: created.name,
                date: created.date,
                kilometers: created.kilometers || 0,
                estimatedDurationMinutes: created.estimatedDurationMinutes || 0,
                orderIds: created.orderIds || created.customerIds || [],
                driverId: created.driverId || null,
                driverName: created.driverName || null,
                geometry: Array.isArray(created.geometry) ? created.geometry : [],
                legDurationsMinutes: Array.isArray(created.legDurationsMinutes) ? created.legDurationsMinutes : [],
                createdAt: created.createdAt || new Date().toISOString()
            };
            setRoutes(prev => [...prev, newRoute]);
            showNotification('success', `Route "${routeData.name}" created successfully`);
            return newRoute;
        } catch (err) {
            console.error('Failed to create route via API', err);
            showNotification('error', 'Failed to create route');
            throw err;
        }
    };

        const handleDeleteRoute = async (id) => {
            const route = routes.find(r => r.id === id);
            try {
                await RoutePrototypeService.deleteRoute(id);
                setRoutes(prev => prev.filter(route => route.id !== id));
                // Unassign orders from deleted route
                setOrders(prev => prev.map(order =>
                    order.routeId === id ? { ...order, routeId: null, status: 'pending' } : order
                ));
                showNotification('success', `Route "${route?.name}" deleted successfully`);
            } catch (err) {
                console.error('Failed to delete route', err);
                showNotification('error', 'Failed to delete route');
            }
        };

    useEffect(() => {
        setOrders(prev => mapOrdersWithRoutes(prev));
    }, [routes, mapOrdersWithRoutes]);

    // Calculate updated stats
    const dashboardStats = {
        totalCustomers: customers.length,
        totalRoutes: routes.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
    };

    

    const layoutProps = {
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        notification,
        hideNotification,
        dashboardStats,
        orders,
        customers,
        routes,
        drivers,
        handleAssignOrderToRoute,
        handleAddCustomer,
        handleEditCustomer,
        handleDeleteCustomer,
        customersLoading,
        handleAddRoute,
        handleDeleteRoute,
        handleAssignDriverToRoute,
        handleAddOrder,
        setCustomers,
        setOrders,
        handleOptimizeRoute,
        navigate
    };

    return (
        <Routes>
            <Route path="/landing" element={<LandingPage onGetStarted={() => window.location.href = '/'} />} />
            <Route path="/login" element={<LoginForm/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/map" element={<TomTomMap />} />
            <Route path="/mapview" element={<MapView />} />
            <Route path="/driver/invite" element={<DriverOnboarding />} />
            <Route path="/" element={<Layout {...layoutProps} />} />
            <Route path="/*" element={<Layout {...layoutProps} />} />
        </Routes>
    );
}

export default App;

// CustomerProfileWrapperComponent: standalone component (not recreated on App rerenders)
export function CustomerProfileWrapperComponent({ customers, orders, setCustomers, setOrders, onAddOrder, onEditCustomer, onDeleteCustomer, onBack }){
    const { id } = useParams();
    const [loadingDetail, setLoadingDetail] = React.useState(false);
    const [detailCustomer, setDetailCustomer] = React.useState(() => customers.find(c => String(c.id) === String(id)) || null);
    const [detailOrders, setDetailOrders] = React.useState(() => (orders || []).filter(o => String(o.customerId) === String(id)));

    // Keep refs for customers/orders so the effect can read the latest values
    // without needing to include them in the dependency array (which would
    // cause this effect to re-run after we merge fetched detail data back into
    // App state and create a fetch/merge loop). We still update these refs when
    // the props change so they're always current.
    const customersRef = React.useRef(customers);
    const ordersRef = React.useRef(orders);

    React.useEffect(() => {
        customersRef.current = customers;
        ordersRef.current = orders;
    }, [customers, orders]);

    React.useEffect(() => {
        setDetailOrders((orders || []).filter(o => String(o.customerId) === String(id)));
    }, [orders, id]);

    // Effect: fetch missing customer details & orders when navigating to a customer id
    React.useEffect(() => {
        let mounted = true;
    const existingCustomer = (customersRef.current || []).find(c => String(c.id) === String(id));
    const existingOrdersForCustomer = (ordersRef.current || []).filter(o => String(o.customerId) === String(id));
    const needsCustomerFetch = !existingCustomer || !existingCustomer.openingHours;
    const shouldRefreshOrders = true;
    if (!needsCustomerFetch && !shouldRefreshOrders) return;

        setLoadingDetail(true);
        (async () => {
            try {
                if (needsCustomerFetch) {
                    const fetched = await CustomerPrototypeService.getCustomerById(id).catch(() => null);
                    if (fetched && mounted) {
                        const normalized = {
                            id: fetched.id || fetched._id || String(fetched.id),
                            name: fetched.name,
                            email: fetched.email,
                            phone: fetched.phone,
                            address: fetched.address,
                            city: fetched.city || '',
                            state: fetched.state || '',
                            postalCode: fetched.postalCode || '',
                            country: fetched.country || '',
                            latitude: fetched.latitude,
                            longitude: fetched.longitude,
                            createdAt: fetched.createdAt || new Date().toISOString(),
                            openingHours: fetched.openingHours || null
                        };
                        setDetailCustomer(normalized);
                        setCustomers(prev => {
                            const exists = prev.some(c => String(c.id) === String(normalized.id));
                            if (exists) return prev.map(c => String(c.id) === String(normalized.id) ? { ...c, ...normalized } : c);
                            return [...prev, normalized];
                        });
                    }
                }

                if (shouldRefreshOrders) {
                    const fetchedOrders = await OrderPrototypeService.getOrders(id).catch(() => []);
                    if (fetchedOrders && mounted) {
                        const normalizedOrders = (fetchedOrders || []).map(o => ({
                            id: o.id || o._id || String(o.id),
                            customerId: o.customerId,
                            service: o.service || '',
                            serviceTime: o.serviceTime || 0,
                            priority: o.priority || 'Medium',
                            notes: o.notes || '',
                            status: (o.status || 'pending').toString().toLowerCase(),
                            createdDate: o.createdAt ? (new Date(o.createdAt)).toISOString().split('T')[0] : (o.createdDate || new Date().toISOString().split('T')[0]),
                            routeId: o.routeId || null,
                            cases: Array.isArray(o.cases) ? o.cases : [],
                            pickupAddress: o.pickupAddress || '',
                            dropoffAddress: o.dropoffAddress || '',
                            pickupLat: typeof o.pickupLat === 'number' ? o.pickupLat : null,
                            pickupLng: typeof o.pickupLng === 'number' ? o.pickupLng : null,
                            dropoffLat: typeof o.dropoffLat === 'number' ? o.dropoffLat : null,
                            dropoffLng: typeof o.dropoffLng === 'number' ? o.dropoffLng : null
                        }));
                        setDetailOrders(normalizedOrders);
                        setOrders(prev => {
                            const others = prev.filter(p => String(p.customerId) !== String(id));
                            return [...others, ...normalizedOrders];
                        });
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch customer details or orders', err);
            } finally {
                if (mounted) setLoadingDetail(false);
            }
        })();

        return () => { mounted = false };
    // Intentionally only depend on `id` so this effect runs when navigating to a different
    // customer detail page. Including `customers` or `orders` in the deps caused this
    // effect to re-run after we `setCustomers`/`setOrders` (which merged fetched data
    // back into App state) and produced a continuous fetch / remount loop.
    // If the app later needs to re-fetch on customers/orders changes, do so with a
    // controlled trigger rather than depending directly on those arrays.
    }, [id, setCustomers, setOrders]);

    if (loadingDetail && !detailCustomer) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600" />
                    <div>Loading customer details...</div>
                </div>
            </div>
        );
    }

    if (!detailCustomer) {
        return (
            <div className="p-6">
                <div className="text-gray-600">Customer not found or still loading...</div>
                <div className="mt-4">
                    <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded">Back</button>
                </div>
            </div>
        );
    }

    return (
        <CustomerProfile
            customer={detailCustomer}
            orders={detailOrders || []}
            onAddOrder={onAddOrder}
            onBack={onBack}
            onEditCustomer={onEditCustomer}
            onDeleteCustomer={onDeleteCustomer}
        />
    );
}

function Layout({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    notification,
    hideNotification,
    dashboardStats,
    orders,
    customers,
    routes,
    drivers,
    handleAssignOrderToRoute,
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteCustomer,
    customersLoading,
    handleAddRoute,
    handleDeleteRoute,
    handleAssignDriverToRoute,
    handleAddOrder,
    setCustomers,
    setOrders,
    handleOptimizeRoute,
    navigate
}) {
    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:static lg:inset-0 flex-shrink-0">
                <div className="flex items-center justify-between h-16 px-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <RouteIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">DisPath</h1>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.id === 'dashboard' ? '/' : `/${item.id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </aside>
            {/* Main Content */}
            <div className="flex-1 lg:ml-0 ml-64 flex flex-col h-full">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white shadow-sm border-b px-4 py-4 flex items-center justify-between flex-shrink-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <RouteIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">DisPath</h1>
                    </div>
                </div>
                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {/* Render nested route content here */}
                    <Routes>
                        {/* Dashboard index */}
                        <Route index element={(
                            <>
                                <Dashboard
                                    stats={dashboardStats}
                                    onNavigateToOrders={() => navigate('/orders')}
                                    onNavigateToRoutes={() => navigate('/routes')}
                                    onNavigateToCustomers={() => navigate('/customers')}
                                    onNavigateToActiveRoutes={() => navigate('/routes')}
                                />
                                <div className="mt-8">
                                    <OrderManagement
                                        orders={orders}
                                        customers={customers}
                                        routes={routes}
                                        onAssignOrderToRoute={handleAssignOrderToRoute}
                                    />
                                </div>
                            </>
                        )} />

                        {/* Support legacy /dashboard path so bookmarks/refresh work */}
                        <Route path="dashboard" element={(
                            <>
                                <Dashboard
                                    stats={dashboardStats}
                                    onNavigateToOrders={() => navigate('/orders')}
                                    onNavigateToRoutes={() => navigate('/routes')}
                                    onNavigateToCustomers={() => navigate('/customers')}
                                    onNavigateToActiveRoutes={() => navigate('/routes')}
                                />
                                <div className="mt-8">
                                    <OrderManagement
                                        orders={orders}
                                        customers={customers}
                                        routes={routes}
                                        onAssignOrderToRoute={handleAssignOrderToRoute}
                                    />
                                </div>
                            </>
                        )} />

                        <Route
                            path="orders"
                            element={
                                <OrderManagement
                                    orders={orders}
                                    customers={customers}
                                    routes={routes}
                                    onAssignOrderToRoute={handleAssignOrderToRoute}
                                />
                            }
                        />

                        <Route
                            path="customers"
                            element={
                                <Customer
                                    customers={customers}
                                    onAddCustomer={handleAddCustomer}
                                    onSelectCustomer={(id) => navigate(`/customers/${id}`)}
                                    onEditCustomer={handleEditCustomer}
                                    onDeleteCustomer={handleDeleteCustomer}
                                    loading={customersLoading}
                                />
                            }
                        />

                        <Route
                            path="customers/:id"
                            element={
                                <CustomerProfileWrapperComponent
                                    customers={customers}
                                    orders={orders}
                                    setCustomers={setCustomers}
                                    setOrders={setOrders}
                                    onAddOrder={handleAddOrder}
                                    onEditCustomer={handleEditCustomer}
                                    onDeleteCustomer={handleDeleteCustomer}
                                    onBack={() => navigate('/customers')}
                                />
                            }
                        />

                        <Route
                            path="routes"
                            element={
                                <RouteInfo
                                    routes={routes}
                                    orders={orders}
                                    onAddRoute={handleAddRoute}
                                    onDeleteRoute={handleDeleteRoute}
                                    customers={customers}
                                    drivers={drivers}
                                    onAssignDriver={handleAssignDriverToRoute}
                                    onOptimizeRoute={handleOptimizeRoute}
                                />
                            }
                        />

                        <Route path="drivers" element={<DriverManagement />} />
                        <Route
                            path="case"
                            element={
                                <Maps
                                    orders={orders}
                                    customers={customers}
                                    onViewCustomer={(customerId) => navigate(`/customers/${customerId}`)}
                                />
                            }
                        />
                        <Route path="assets" element={<AssetManagement />} />
                        <Route path="portal" element={<CustomerPortal />} />
                    </Routes>
                </main>
            </div>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            {/* Notification */}
            <NotificationToast notification={notification} onClose={hideNotification} />
        </div>
    );
}
