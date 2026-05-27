import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Plus, X, Calendar, Clock, MapPin, Trash2, UserCheck } from 'lucide-react';
import RouteDetails from './RouteDetails.jsx';

const RouteInfo = ({ routes, orders, onAddRoute, onDeleteRoute, customers, drivers, onAssignDriver, onOptimizeRoute }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    date: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (selectedRoute) {
      const updated = routes.find(r => r.id === selectedRoute.id);
      if (updated) setSelectedRoute(updated);
    }
  }, [routes, selectedRoute]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Route name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddRoute(formData);
      setFormData({ name: '', date: '' });
      setShowAddForm(false);
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getRouteOrders = (routeId) => {
    return orders.filter(order => order.routeId === routeId);
  };

  const getRouteServiceTime = (routeId) => {
    const routeOrders = getRouteOrders(routeId);
    return routeOrders.reduce((total, order) => total + (order.serviceTime || 0), 0);
  };

  const formatMinutes = (value) => {
    if (!value || Number.isNaN(value)) return '0';
    return (Math.round(value * 10) / 10).toString();
  };

  const formatKilometers = (value) => {
    if (!value || Number.isNaN(value)) return '0';
    return (Math.round(value * 100) / 100).toString();
  };

  const formatDurationLabel = (value) => {
    if (!value || Number.isNaN(value)) return '0 min';
    const totalMinutes = Math.round(value);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours <= 0) return `${minutes} min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const filteredRoutes = dateFilter 
    ? routes.filter(route => route.date === dateFilter)
    : routes;

  if (selectedRoute) {
    // Pass route, orders, customers, drivers, and handlers
    return (
      <RouteDetails 
        route={selectedRoute}
        orders={orders.filter(o => o.routeId === selectedRoute.id)}
        customers={customers}
        drivers={drivers || []}
        onBack={() => setSelectedRoute(null)}
        onAssignDriver={async (routeId, driverId) => {
          if (!onAssignDriver) return;
          const updated = await onAssignDriver(routeId, driverId);
          if (updated) setSelectedRoute(updated);
        }}
        onOptimizeRoute={onOptimizeRoute}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RouteIcon className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Routes Management</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Create Route
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutes.map((route) => {
          const routeOrders = getRouteOrders(route.id);
          const serviceMinutes = getRouteServiceTime(route.id);
          const travelMinutes = typeof route.estimatedDurationMinutes === 'number'
            ? route.estimatedDurationMinutes
            : 0;
          const completionTime = serviceMinutes + travelMinutes;
          const assignedOrders = Array.isArray(route.orderIds) ? route.orderIds.length : routeOrders.length;
          
          return (
            <div
              key={route.id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRoute(route)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRoute(route.id);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{route.date}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>
                    Completion Time: {formatDurationLabel(completionTime)}
                    <span className="text-xs text-gray-500 ml-1">
                      (Service {formatMinutes(serviceMinutes)} + Travel {formatMinutes(travelMinutes)})
                    </span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>Distance: {formatKilometers(route.kilometers)} km</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCheck size={16} />
                  <span>{route.driverName ? `Driver: ${route.driverName}` : 'Driver: Unassigned'}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Assigned Orders:</span>
                    <span className="font-medium text-gray-900">{assignedOrders}</span>
                  </div>
                </div>
                
              </div>
            </div>
          );
        })}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-12">
          <RouteIcon className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dateFilter ? 'No routes found for this date' : 'No routes yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {dateFilter ? 'Try selecting a different date' : 'Create your first route to get started'}
          </p>
          {!dateFilter && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Route
            </button>
          )}
        </div>
      )}

      {/* Create Route Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Route</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter route name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p><strong>Note:</strong> Completion time and kilometers will be automatically calculated based on assigned orders.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteInfo;
