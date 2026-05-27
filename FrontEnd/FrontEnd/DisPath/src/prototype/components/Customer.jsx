import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Edit, Trash2 } from 'lucide-react';
import CustomerPrototypeService from '../services/customerPrototypeService';

const Customer = ({ customers = [], onAddCustomer, onSelectCustomer, onEditCustomer, onDeleteCustomer, loading = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const emptyOpeningHours = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: ''
  };
  const createEmptyForm = () => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    latitude: null,
    longitude: null,
    openingHours: { ...emptyOpeningHours }
  });
  const [formData, setFormData] = useState(createEmptyForm());
  const [localCustomers, setLocalCustomers] = useState(customers || []);
  useEffect(() => setLocalCustomers(customers || []), [customers]);
  // If no customers provided via props, fetch from backend
  useEffect(() => {
    let mounted = true;
    if (!customers || customers.length === 0) {
      CustomerPrototypeService.getAllCustomers()
        .then(data => {
          if (mounted) {
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
              createdAt: c.createdAt || c._createdAt || new Date().toISOString()
            }));
            setLocalCustomers(normalized);
          }
        })
        .catch(err => {
          console.warn('Failed to load customers from backend', err);
        });
    }
    return () => { mounted = false };
  }, [customers]);
  const [errors, setErrors] = useState({});
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressValidateMessage, setAddressValidateMessage] = useState('');
  const [validatingAddress, setValidatingAddress] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      if (validateForm()) {
      if (editingCustomer) {
        // Update path: call parent handler if available
        if (onEditCustomer) onEditCustomer(editingCustomer.id, formData);
      } else {
        // Before creating, check whether email already exists to avoid server-side unique constraint errors.
        try {
          const existing = await CustomerPrototypeService.getCustomerByEmail(formData.email).catch(() => null);
          if (existing) {
            setErrors({ email: 'A customer with this email already exists' });
            return;
          }
        } catch (checkErr) {
          // if the check fails with network error, continue and attempt create (will show server error if it fails)
          console.warn('Email check failed, continuing to create:', checkErr);
        }

        try {
          // Call backend create endpoint
          const created = await CustomerPrototypeService.createCustomer(formData);
          // Call parent handler if present
          if (onAddCustomer) onAddCustomer(created);
          // Update local list for standalone usage
          setLocalCustomers(prev => [{ ...created }, ...prev]);
        } catch (err) {
          console.error('Failed to create customer', err);
          // Map common server error to a user-friendly message
          if (err?.response?.status === 400) {
            setErrors({ form: 'Server rejected the request. Check the input fields.' });
          } else {
            setErrors({ form: 'Network or server error. Try again.' });
          }
          // fallback to optimistic local add is intentionally omitted to avoid inconsistent state when server rejects
        }
      }
  setFormData(createEmptyForm());
      setAddressSuggestions([]);
      setAddressValidateMessage('');
      setShowAddForm(false);
      setEditingCustomer(null);
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (['address', 'city', 'state', 'postalCode', 'country'].includes(field)) {
        next.latitude = null;
        next.longitude = null;
        setAddressSuggestions([]);
        setAddressValidateMessage('');
      }
      return next;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOpeningHourChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...(prev.openingHours || {}),
        [day]: value
      }
    }));
    if (errors.openingHours) {
      setErrors(prev => ({ ...prev, openingHours: '' }));
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city || '',
      state: customer.state || '',
      postalCode: customer.postalCode || '',
      country: customer.country || '',
      latitude: customer.latitude ?? null,
      longitude: customer.longitude ?? null,
      openingHours: customer.openingHours || { ...emptyOpeningHours }
    });
    setAddressSuggestions([]);
    setAddressValidateMessage('');
    setShowAddForm(true);
  };

  const buildAddressQuery = () => {
    return [formData.address, formData.city, formData.state, formData.postalCode, formData.country]
      .filter(part => part && part.trim())
      .map(part => part.trim())
      .join(', ');
  };

  const applyGeocodedAddress = (data, options = {}) => {
    const { preserveStreetIfFilled = false } = options;
    setFormData(prev => {
      const streetValue = data.street || data.displayName || prev.address;
      const shouldReplaceStreet = !preserveStreetIfFilled || !prev.address || !prev.address.trim();
      return {
        ...prev,
        address: shouldReplaceStreet ? streetValue : prev.address,
        city: data.city || prev.city,
        state: data.state || prev.state,
        postalCode: data.postalCode || prev.postalCode,
        country: data.country || prev.country,
        latitude: data.latitude ?? prev.latitude,
        longitude: data.longitude ?? prev.longitude
      };
    });
  };

  const handleValidateAddress = async () => {
    const query = buildAddressQuery();
    if (!query) {
      setAddressValidateMessage('Enter address details first.');
      setAddressSuggestions([]);
      return;
    }
    setValidatingAddress(true);
    setAddressValidateMessage('');
    try {
      // First, try to validate as an exact address match
      const validation = await CustomerPrototypeService.validateAddress(query);
      if (validation && validation.exact) {
        applyGeocodedAddress(validation, { preserveStreetIfFilled: false });
        setAddressSuggestions([]);
        setAddressValidateMessage('Address validated and updated with precise details.');
      } else {
        // No exact match: fall back to suggestions so the user can see/click one
        const suggestions = await CustomerPrototypeService.getAddressSuggestions(query);
        setAddressSuggestions(suggestions || []);
        if (!suggestions || suggestions.length === 0) {
          setAddressValidateMessage('No matches found.');
        } else {
          setAddressValidateMessage('No exact match. Select the closest address below if needed.');
        }
      }
    } catch (err) {
      console.error('Address validation failed', err);
      setAddressValidateMessage('Failed to validate address.');
      setAddressSuggestions([]);
    } finally {
      setValidatingAddress(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    applyGeocodedAddress(suggestion);
    setAddressSuggestions([]);
    setAddressValidateMessage('Address updated from suggestion.');
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name}?`)) return;
    try {
      await CustomerPrototypeService.deleteCustomer(customer.id);
      setLocalCustomers(prev => prev.filter(c => c.id !== customer.id));
      onDeleteCustomer?.(customer.id);
    } catch (error) {
      console.error('Failed to delete customer', error);
      setErrors({ form: 'Unable to delete this customer. Please try again.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(localCustomers || []).map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 cursor-pointer" onClick={() => onSelectCustomer(customer.id)}>{customer.name}</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 cursor-pointer" onClick={() => onSelectCustomer(customer.id)}>
              <p><span className="font-medium">Email:</span> {customer.email}</p>
              <p><span className="font-medium">Phone:</span> {customer.phone}</p>
              <p><span className="font-medium">Address:</span> {customer.address}</p>
              <p><span className="font-medium">City:</span> {customer.city || '—'}</p>
              <p><span className="font-medium">Country:</span> {customer.country || '—'}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Added: {new Date(customer.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <button
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => handleEdit(customer)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => handleDelete(customer)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {localCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first customer</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Customer
          </button>
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button
                onClick={() => { 
                  setShowAddForm(false); 
                  setEditingCustomer(null);
                  setFormData(createEmptyForm());
                  setAddressSuggestions([]);
                  setAddressValidateMessage('');
                  setErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1" style={{ maxHeight: '78vh' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer address"
                  rows="3"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Toronto"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
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
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="M9W 5L7"
                  />
                  {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Canada"
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleValidateAddress}
                  className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                >
                  {validatingAddress ? 'Validating...' : 'Validate Address'}
                </button>
                {addressValidateMessage && (
                  <p className="text-sm text-gray-600">{addressValidateMessage}</p>
                )}
              </div>
              {addressSuggestions.length > 0 && (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {addressSuggestions.map((suggestion, idx) => (
                    <button
                      type="button"
                      key={`${suggestion.displayName}-${idx}`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm"
                    >
                      {suggestion.displayName}
                    </button>
                  ))}
                </div>
              )}

              {/* Opening hours: Monday - Friday */}
              <div className="p-2 border border-gray-100 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours (Mon - Fri)</label>
                <p className="text-xs text-gray-500 mb-2">Select timings per weekday. Choose "24 hours" for always-open.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['monday','tuesday','wednesday','thursday','friday'].map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <div className="w-20 text-sm text-gray-700 capitalize">{day}</div>
                      <select
                        value={(formData.openingHours && formData.openingHours[day]) || ''}
                        onChange={(e) => handleOpeningHourChange(day, e.target.value)}
                        className="flex-1 px-2 py-2 text-sm border rounded bg-white"
                      >
                        <option value="">Select</option>
                        <option value="closed">Closed</option>
                        <option value="24_hours">24 hours</option>
                        <option value="08:00-17:00">08:00 - 17:00</option>
                        <option value="09:00-18:00">09:00 - 18:00</option>
                        <option value="10:00-16:00">10:00 - 16:00</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCustomer(null);
                    setFormData(createEmptyForm());
                    setAddressSuggestions([]);
                    setAddressValidateMessage('');
                    setErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
