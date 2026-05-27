import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Clock, Users } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { RouteModal } from './modals/RouteModal';
import { AssignCustomersModal } from './modals/AssignCustomerModal.jsx';
import CustomerPrototypeService from '../services/customerPrototypeService';

// Sample routes data
const sampleRoutes = [
    {
        id: 'r1',
        name: 'Morning Delivery',
        status: 'active',
        startLocation: '123 Main St, Toronto, ON',
        endLocation: '789 King St, Toronto, ON',
        estimatedTime: 45,
        distance: 12.5,
    assignedCustomers: []
    },
    {
        id: 'r2',
        name: 'Evening Pickup',
        status: 'planning',
        startLocation: '456 Queen St, Toronto, ON',
        endLocation: '123 Main St, Toronto, ON',
        estimatedTime: 30,
        distance: 8.2,
        assignedCustomers: []
    },
    {
        id: 'r3',
        name: 'Express Route',
        status: 'completed',
        startLocation: '789 King St, Toronto, ON',
        endLocation: '456 Queen St, Toronto, ON',
        estimatedTime: 20,
        distance: 5.7,
    assignedCustomers: []
    }
];

const Routes = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [routes, setRoutes] = useState(sampleRoutes);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        let mounted = true;
        CustomerPrototypeService.getAllCustomers()
            .then(data => {
                if (mounted) {
                    // Normalize _id -> id if needed
                    const normalized = (data || []).map(c => ({ id: c.id || c._id || c._id_str || String(c.id), name: c.name }));
                    setCustomers(normalized);
                }
            })
            .catch(err => {
                console.warn('Failed to load customers from backend, falling back to empty list', err);
            });
        return () => { mounted = false };
    }, []);

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.endLocation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddRoute = (routeData) => {
        onAddRoute(routeData);
        setIsRouteModalOpen(false);
    };

    const handleEditRoute = (routeData) => {
        if (editingRoute) {
            onEditRoute(editingRoute.id, routeData);
            setEditingRoute(null);
            setIsRouteModalOpen(false);
        }
    };

    const startEdit = (route) => {
        setEditingRoute(route);
        setIsRouteModalOpen(true);
    };

    const closeRouteModal = () => {
        setIsRouteModalOpen(false);
        setEditingRoute(null);
    };

    const openAssignModal = (routeId) => {
        setSelectedRouteId(routeId);
        setIsAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setIsAssignModalOpen(false);
        setSelectedRouteId('');
    };

    const handleAssignCustomers = (customerIds) => {
        onAssignCustomers(selectedRouteId, customerIds);
        closeAssignModal();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-800';
            case 'planning':
                return 'bg-amber-100 text-amber-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const selectedRoute = routes.find(r => r.id === selectedRouteId);

    // Add a new route
    const onAddRoute = (routeData) => {
        setRoutes(prev => [
            ...prev,
            {
                ...routeData,
                id: (Date.now() + Math.random()).toString(),
                status: 'planning',
                assignedCustomers: [],
            }
        ]);
    };

    // Edit an existing route
    const onEditRoute = (routeId, routeData) => {
        setRoutes(prev => prev.map(r =>
            r.id === routeId ? { ...r, ...routeData } : r
        ));
    };

    // Delete a route
    const onDeleteRoute = (routeId) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            setRoutes(prev => prev.filter(r => r.id !== routeId));
        }
    };

    // Assign customers to a route
    const onAssignCustomers = (routeId, customerIds) => {
        setRoutes(prev => prev.map(route =>
            route.id === routeId
                ? {
                    ...route,
                    assignedCustomers: customers.filter(c => customerIds.includes(c.id))
                }
                : route
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
                    <p className="text-gray-600">Manage delivery routes and assignments</p>
                </div>
                <Button
                    icon={Plus}
                    onClick={() => setIsRouteModalOpen(true)}
                    className="w-full sm:w-auto"
                >
                    Create Route
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    type="text"
                    placeholder="Search routes by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Routes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRoutes.map((route) => (
                    <Card key={route.id} hover className="p-6">
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{route.name}</h3>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)} capitalize`}>
                    {route.status}
                  </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(route)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteRoute(route.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Route Details */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-700 font-medium">From: {route.startLocation}</p>
                                        <p className="text-gray-700">To: {route.endLocation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700">{route.estimatedTime} min</span>
                                    </div>
                                    <div className="text-gray-700">{route.distance} km</div>
                                </div>
                            </div>

                            {/* Assigned Customers */}
                            <div className="pt-3 border-t">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">
                      Assigned Customers ({route.assignedCustomers.length})
                    </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openAssignModal(route.id)}
                                    >
                                        Assign
                                    </Button>
                                </div>

                                {route.assignedCustomers.length > 0 ? (
                                    <div className="space-y-2">
                                        {route.assignedCustomers.slice(0, 3).map((customer) => (
                                            <div key={customer.id} className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-gray-700">{customer.name}</span>
                                            </div>
                                        ))}
                                        {route.assignedCustomers.length > 3 && (
                                            <p className="text-xs text-gray-500 ml-4">
                                                +{route.assignedCustomers.length - 3} more
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No customers assigned yet</p>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredRoutes.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                        <Search className="w-full h-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
                    <p className="text-gray-600">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first route.'}
                    </p>
                </div>
            )}

            {/* Route Modal */}
            <RouteModal
                isOpen={isRouteModalOpen}
                onClose={closeRouteModal}
                onSubmit={editingRoute ? handleEditRoute : handleAddRoute}
                initialData={editingRoute}
            />

            {/* Assign Customers Modal */}
            <AssignCustomersModal
                isOpen={isAssignModalOpen}
                onClose={closeAssignModal}
                onAssign={handleAssignCustomers}
                customers={customers}
                assignedCustomerIds={selectedRoute?.assignedCustomers.map(c => c.id) || []}
                routeName={selectedRoute?.name || ''}
            />
        </div>
    );
};

export default Routes;

