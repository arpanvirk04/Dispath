import React, { useState, useEffect } from 'react';
import { Users, Plus, X, MapPin, Clock, Package, Star, Phone, Mail, Calendar, TrendingUp, Award } from 'lucide-react';
import DriverPrototypeService from '../services/driverPrototypeService';

const mockDrivers = [
  {
    id: 'DRV001',
    name: 'John Martinez',
    email: 'john.martinez@dispath.com',
    phone: '416-555-0123',
    licenceType: 'Full - Class G',
    status: 'active',
    rating: 4.8,
    totalDeliveries: 245,
    completedToday: 8,
    avgDeliveryTime: 28,
    joinDate: '2024-03-15',
    currentLocation: 'Downtown Toronto',
    stats: {
      totalDistance: 2850,
      onTimeRate: 94,
      customerRating: 4.8,
      totalEarnings: 8750,
      weeklyHours: 42,
      deliveriesThisWeek: 35,
      avgRating: 4.8,
      completionRate: 98
    },
    recentDeliveries: [
      { id: 'DEL001', customer: 'Alice Johnson', time: '10:30 AM', status: 'completed', rating: 5 },
      { id: 'DEL002', customer: 'Bob Smith', time: '11:15 AM', status: 'completed', rating: 4 },
      { id: 'DEL003', customer: 'Carol Wilson', time: '12:00 PM', status: 'in_progress', rating: null }
    ]
  },
  {
    id: 'DRV002',
    name: 'Sarah Chen',
    email: 'sarah.chen@dispath.com',
    phone: '416-555-0124',
  licenceType: 'Full - Class G',
    status: 'active',
    rating: 4.9,
    totalDeliveries: 189,
    completedToday: 6,
    avgDeliveryTime: 32,
    joinDate: '2024-05-20',
    currentLocation: 'North York',
    stats: {
      totalDistance: 2240,
      onTimeRate: 96,
      customerRating: 4.9,
      totalEarnings: 6890,
      weeklyHours: 38,
      deliveriesThisWeek: 28,
      avgRating: 4.9,
      completionRate: 99
    },
    recentDeliveries: [
      { id: 'DEL004', customer: 'David Brown', time: '09:45 AM', status: 'completed', rating: 5 },
      { id: 'DEL005', customer: 'Emma Davis', time: '10:30 AM', status: 'completed', rating: 5 },
      { id: 'DEL006', customer: 'Frank Miller', time: '11:20 AM', status: 'completed', rating: 4 }
    ]
  },
  {
    id: 'DRV003',
    name: 'Mike Thompson',
    email: 'mike.thompson@dispath.com',
    phone: '416-555-0125',
  licenceType: 'Motorcycle Permit',
    status: 'offline',
    rating: 4.6,
    totalDeliveries: 156,
    completedToday: 0,
    avgDeliveryTime: 22,
    joinDate: '2024-07-10',
    currentLocation: 'Scarborough',
    stats: {
      totalDistance: 1890,
      onTimeRate: 89,
      customerRating: 4.6,
      totalEarnings: 4680,
      weeklyHours: 35,
      deliveriesThisWeek: 24,
      avgRating: 4.6,
      completionRate: 95
    },
    recentDeliveries: [
      { id: 'DEL007', customer: 'Grace Lee', time: 'Yesterday 4:30 PM', status: 'completed', rating: 5 },
      { id: 'DEL008', customer: 'Henry Wong', time: 'Yesterday 3:15 PM', status: 'completed', rating: 4 },
      { id: 'DEL009', customer: 'Iris Johnson', time: 'Yesterday 2:00 PM', status: 'completed', rating: 5 }
    ]
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-300',
  offline: 'bg-gray-100 text-gray-800 border-gray-300',
  busy: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

const DriverManagement = () => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [drivers, setDrivers] = useState(mockDrivers);
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [inviteNotice, setInviteNotice] = useState('');

  // Load drivers from backend on mount
  useEffect(() => {
    let mounted = true;
    DriverPrototypeService.getAllDrivers()
      .then(data => {
        if (!mounted) return;
        const normalized = (data || []).map(d => ({
          id: d.id || d._id || String(d.id),
          name: d.name,
          email: d.email,
          phone: d.phone,
          licenceType: d.licenceType || d.licenseNumber || '',
          status: d.status || 'active',
          rating: d.rating || 0,
          totalDeliveries: d.totalDeliveries || 0,
          completedToday: d.completedToday || 0,
          avgDeliveryTime: d.avgDeliveryTime || 0,
          joinDate: d.joinDate || d.createdAt || new Date().toISOString(),
          currentLocation: d.currentLocation || '' ,
          stats: d.stats || { totalDistance: 0, onTimeRate: 0, customerRating: 0 }
        }));
        setDrivers(normalized.length ? normalized : mockDrivers);
      })
      .catch(err => {
        console.warn('Failed to load drivers', err);
        setDrivers(mockDrivers);
      });
    return () => { mounted = false };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      // Map frontend licenceType -> backend licenseNumber for now
      const payload = {
        email: formData.email
      };
      const invite = await DriverPrototypeService.inviteDriver(payload);
      setInviteNotice(`Invite sent to ${payload.email}. Link: ${invite?.inviteLink || 'Check server logs for link.'}`);
      setFormData({ email: '' });
      setShowAddForm(false);
      setErrors({});
    } catch (err) {
      console.error('Failed to invite driver', err);
      // keep form open so user can retry
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (selectedDriver) {
    // defensive guards: ensure nested objects/arrays exist to avoid runtime errors
    const stats = selectedDriver.stats || {};
    const recentDeliveries = selectedDriver.recentDeliveries || [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedDriver(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedDriver.name}</h1>
              <p className="text-gray-600">Driver Profile & Statistics</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm border ${statusColors[selectedDriver.status]}`}>
            {selectedDriver.status.charAt(0).toUpperCase() + selectedDriver.status.slice(1)}
          </span>
        </div>

        {/* Driver Info Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Driver Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-700">{selectedDriver.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{selectedDriver.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700">{selectedDriver.currentLocation}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Licence Type: </span>
                <span className="text-gray-900">{selectedDriver.licenceType || selectedDriver.licenseNumber}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Join Date: </span>
                <span className="text-gray-900">{new Date(selectedDriver.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{selectedDriver.totalDeliveries}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.customerRating}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onTimeRate}%</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDistance} km</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Hours</span>
                <span className="font-medium">{stats.weeklyHours}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deliveries This Week</span>
                <span className="font-medium">{stats.deliveriesThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium">{stats.completionRate}%</span>
              </div>
              {/* Removed Total Earnings field */}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Deliveries</h3>
            <div className="space-y-3">
              {recentDeliveries.map((delivery, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{delivery.customer}</p>
                    <p className="text-sm text-gray-600">{delivery.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      delivery.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                    {delivery.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{delivery.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Invite Driver
        </button>
      </div>
      {inviteNotice && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          {inviteNotice}
        </div>
      )}

      {/* Driver List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(drivers || []).map((driver) => (
          <div
            key={driver.id}
            onClick={() => setSelectedDriver(driver)}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
              <span className={`px-2 py-1 rounded text-xs border ${statusColors[driver.status]}`}>
                {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center justify-between">
                <span>Licence:</span>
                <span className="font-medium">{driver.licenceType || driver.licenseNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rating:</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="font-medium">{driver.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Today:</span>
                <span className="font-medium">{driver.completedToday} deliveries</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total:</span>
                <span className="font-medium">{driver.totalDeliveries} deliveries</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} />
                <span>{driver.currentLocation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Driver Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Invite Driver</h3>
                <p className="text-sm text-gray-500">We’ll email the driver an invite link using this info.</p>
              </div>
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
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
