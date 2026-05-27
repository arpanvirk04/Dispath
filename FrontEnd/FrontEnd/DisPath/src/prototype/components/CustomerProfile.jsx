import React, { useMemo, useState } from 'react';
import { ArrowLeft, Plus, X, Edit, Trash2, Package, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const mockServiceHistory = [
  { id: 'SVC001', service: 'Package Delivery', date: '2025-08-09', duration: '30 min' },
  { id: 'SVC002', service: 'Document Pickup', date: '2025-08-05', duration: '15 min' }
];

const statusColors = {
  open: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  closed: 'bg-green-100 text-green-800 border-green-300',
  pending: 'bg-blue-100 text-blue-800 border-blue-300'
};

const CustomerProfile = ({ customer, orders, onAddOrder, onBack, onEditCustomer, onDeleteCustomer }) => {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    serviceTime: '',
    priority: 'Medium',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [showEditForm, setShowEditForm] = useState(false);
  // initialize edit form with customer values when available
  const [editFormData, setEditFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    state: customer?.state || '',
    postalCode: customer?.postalCode || '',
    country: customer?.country || '',
    latitude: customer?.latitude ?? null,
    longitude: customer?.longitude ?? null
  });
  const [editErrors, setEditErrors] = useState({});
  React.useEffect(() => {
    setEditFormData({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || '',
      state: customer?.state || '',
      postalCode: customer?.postalCode || '',
      country: customer?.country || '',
      latitude: customer?.latitude ?? null,
      longitude: customer?.longitude ?? null
    });
  }, [customer]);

  const weekdayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  const dayLabel = (dayKey) => {
    return dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
  };

  const formatOpeningHour = (val) => {
    if (!val || val === '') return 'Not set';
    if (val === '24_hours') return '24 hours';
    if (val === 'closed') return 'Closed';
    return val; // assume hh:mm-hh:mm or similar
  };

  const formatCaseDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  };

  const customerCases = useMemo(() => {
    const flattened = [];
    (orders || []).forEach((order) => {
      const orderCases = Array.isArray(order.cases) ? order.cases : [];
      orderCases.forEach((caseItem) => {
        flattened.push({
          ...caseItem,
          orderId: order.id,
          service: order.service || 'Service Request'
        });
      });
    });
    return flattened.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [orders]);

  // If customer data isn't loaded yet, show a small loading state so the page doesn't crash
  if (!customer) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
          <div>Loading customer...</div>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.service.trim()) newErrors.service = 'Service description is required';
    if (!formData.serviceTime) newErrors.serviceTime = 'Service time is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Await the parent's onAddOrder so UI can react to failure/success
        await onAddOrder(customer.id, {
          ...formData,
          serviceTime: parseInt(formData.serviceTime)
        });
        setFormData({ service: '', serviceTime: '', priority: 'Medium', notes: '' });
        setShowOrderForm(false);
        setErrors({});
      } catch (err) {
        console.error('Create order failed', err);
        setErrors({ form: 'Failed to create order. Try again.' });
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.name.trim()) newErrors.name = 'Name is required';
    if (!editFormData.email.trim()) newErrors.email = 'Email is required';
    if (!editFormData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!editFormData.address.trim()) newErrors.address = 'Address is required';
    if (!editFormData.city.trim()) newErrors.city = 'City is required';
    if (!editFormData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!editFormData.country.trim()) newErrors.country = 'Country is required';
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (validateEditForm()) {
      onEditCustomer(customer.id, editFormData);
      setShowEditForm(false);
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => {
      const next = { ...prev, [field]: value };
      if (['address', 'city', 'state', 'postalCode', 'country'].includes(field)) {
        next.latitude = null;
        next.longitude = null;
      }
      return next;
    });
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      onDeleteCustomer(customer.id);
      onBack();
    }
  };

  const openEditForm = () => {
    setEditFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      postalCode: customer.postalCode || '',
      country: customer.country || '',
      latitude: customer.latitude ?? null,
      longitude: customer.longitude ?? null
    });
    setEditErrors({});
    setShowEditForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">Customer Profile</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openEditForm}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Customer Basic Info */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{customer.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{customer.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="text-gray-900">{customer.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="text-gray-900">{customer.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <p className="text-gray-900">{customer.city || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State / Province</label>
            <p className="text-gray-900">{customer.state || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <p className="text-gray-900">{customer.postalCode || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <p className="text-gray-900">{customer.country || '—'}</p>
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Opening Hours (Mon - Fri)</h2>
        {(!customer.openingHours || Object.keys(customer.openingHours).length === 0) ? (
          <p className="text-gray-600">No opening hours set</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {weekdayOrder.map((day) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{dayLabel(day)}</span>
                <span className="text-sm text-gray-900">{formatOpeningHour(customer.openingHours?.[day])}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Order
          </button>
        </div>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order, orderIndex) => {
              const serviceLabel = (order.service && order.service.trim()) ? order.service : 'Service Request';
              const orderBadge = `Order ${orderIndex + 1}`;
              return (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      <span className="font-medium">{serviceLabel}</span>
                      <span className="text-xs text-gray-400">{orderBadge}</span>
                      <span className={`px-2 py-1 rounded text-xs border ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{order.createdDate}</span>
                  </div>
                  <p className="text-gray-700 mb-1">{serviceLabel}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span><Clock size={14} className="inline mr-1" />{order.serviceTime} min</span>
                    <span>Priority: {order.priority}</span>
                  </div>
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-2">Notes: {order.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">No orders yet</p>
        )}
      </div>

      {/* Cases */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Cases ({customerCases.length})</h2>
        {customerCases.length > 0 ? (
          <div className="space-y-3">
            {customerCases.map((caseItem, idx) => (
              <div key={caseItem.id || `${caseItem.orderId}-${idx}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-orange-600" />
                      <span className="font-medium">{caseItem.title || 'Case'}</span>
                      {caseItem.service && (
                        <span className="text-xs text-gray-400">Linked to {caseItem.service}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{caseItem.service}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{formatCaseDate(caseItem.createdAt)}</p>
                    {caseItem.createdBy && (
                      <p className="text-xs text-gray-400">By {caseItem.createdBy}</p>
                    )}
                  </div>
                </div>
                {caseItem.description && (
                  <p className="text-sm text-gray-600 mt-3">{caseItem.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No cases for this customer yet.</p>
        )}
      </div>

      {/* Service History */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Service History</h2>
        <div className="space-y-3">
          {mockServiceHistory.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium">{service.service}</span>
                </div>
                <span className="text-sm text-gray-500">{service.date}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Duration: {service.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Order</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type/Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => handleInputChange('service', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.service ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Package Delivery, Document Pickup"
                />
                {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Time (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.serviceTime}
                  onChange={(e) => handleInputChange('serviceTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.serviceTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                  min="1"
                />
                {errors.serviceTime && <p className="text-red-500 text-xs mt-1">{errors.serviceTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Additional notes or instructions"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Customer</h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleEditInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    editErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
                {editErrors.name && <p className="text-red-500 text-xs mt-1">{editErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    editErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {editErrors.email && <p className="text-red-500 text-xs mt-1">{editErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleEditInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    editErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {editErrors.phone && <p className="text-red-500 text-xs mt-1">{editErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editFormData.address}
                  onChange={(e) => handleEditInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    editErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer address"
                  rows="3"
                />
                {editErrors.address && <p className="text-red-500 text-xs mt-1">{editErrors.address}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => handleEditInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Toronto"
                  />
                  {editErrors.city && <p className="text-red-500 text-xs mt-1">{editErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => handleEditInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                    placeholder="ON"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.postalCode}
                    onChange={(e) => handleEditInputChange('postalCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="M9W 5L7"
                  />
                  {editErrors.postalCode && <p className="text-red-500 text-xs mt-1">{editErrors.postalCode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.country}
                    onChange={(e) => handleEditInputChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Canada"
                  />
                  {editErrors.country && <p className="text-red-500 text-xs mt-1">{editErrors.country}</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
