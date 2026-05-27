import React, { useState } from 'react';
import { 
  Building2, 
  Star, 
  Clock, 
  Package, 
  Calendar, 
  MessageSquare, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

// Mock data for companies available on the platform
const mockCompanies = [
  {
    id: 1,
    name: 'Express Delivery Co.',
    logo: '📦',
    description: 'Fast and reliable delivery services',
    rating: 4.8,
    services: ['Package Delivery', 'Express Shipping', 'Same Day Delivery'],
    pricing: 'Starting at $5.99',
    isSubscribed: true
  },
  {
    id: 2,
    name: 'Fresh Food Delivery',
    logo: '🍕',
    description: 'Fresh food delivered to your door',
    rating: 4.6,
    services: ['Food Delivery', 'Grocery Delivery', 'Restaurant Pickup'],
    pricing: 'Starting at $3.99',
    isSubscribed: true
  },
  {
    id: 3,
    name: 'QuickMove Logistics',
    logo: '🚚',
    description: 'Professional moving and logistics',
    rating: 4.7,
    services: ['Moving Services', 'Furniture Delivery', 'Heavy Items'],
    pricing: 'Starting at $25.00',
    isSubscribed: false
  },
  {
    id: 4,
    name: 'MedCare Delivery',
    logo: '💊',
    description: 'Medical supplies and prescriptions',
    rating: 4.9,
    services: ['Prescription Delivery', 'Medical Supplies', 'Emergency Delivery'],
    pricing: 'Starting at $4.99',
    isSubscribed: false
  }
];

// Mock order history data
const mockOrderHistory = {
  1: [
    {
      id: 'ORD001',
      date: '2025-08-10',
      status: 'delivered',
      service: 'Package Delivery',
      description: 'Electronics package from Amazon',
      deliveryTime: '2025-08-10 14:30',
      cost: '$8.99'
    },
    {
      id: 'ORD002',
      date: '2025-08-08',
      status: 'delivered',
      service: 'Express Shipping',
      description: 'Urgent documents to downtown office',
      deliveryTime: '2025-08-08 10:15',
      cost: '$12.99'
    },
    {
      id: 'ORD003',
      date: '2025-08-15',
      status: 'scheduled',
      service: 'Same Day Delivery',
      description: 'Birthday gift package',
      scheduledTime: '2025-08-15 16:00',
      cost: '$15.99'
    }
  ],
  2: [
    {
      id: 'ORD004',
      date: '2025-08-09',
      status: 'delivered',
      service: 'Food Delivery',
      description: 'Pizza from Tony\'s Pizzeria',
      deliveryTime: '2025-08-09 19:45',
      cost: '$24.99'
    },
    {
      id: 'ORD005',
      date: '2025-08-12',
      status: 'in_transit',
      service: 'Grocery Delivery',
      description: 'Weekly grocery order',
      estimatedTime: '2025-08-12 15:30',
      cost: '$45.99'
    }
  ]
};

const statusConfig = {
  delivered: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
  in_transit: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock },
  scheduled: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Calendar },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle }
};

const CustomerPortal = () => {
  const [activeTab, setActiveTab] = useState('companies');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const subscribedCompanies = mockCompanies.filter(company => company.isSubscribed);
  const availableCompanies = mockCompanies.filter(company => !company.isSubscribed);

  const handleSubscribe = (companyId) => {
    // In real app, this would make an API call
    console.log('Subscribing to company:', companyId);
  };

  const handleCreateCase = (orderData) => {
    // In real app, this would make an API call
    console.log('Creating case for order:', orderData);
    setShowCaseForm(false);
    setSelectedOrder(null);
  };

  const CompanyCard = ({ company, showSubscribeButton = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{company.logo}</div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
            <p className="text-gray-600 text-sm">{company.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={16} fill="currentColor" />
          <span className="text-sm font-medium">{company.rating}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {company.services.map((service, index) => (
            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              {service}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600">{company.pricing}</p>
      </div>

      <div className="flex gap-2">
        {showSubscribeButton ? (
          <button
            onClick={() => handleSubscribe(company.id)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Subscribe
          </button>
        ) : (
          <button
            onClick={() => setSelectedCompany(company.id)}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            View Orders
          </button>
        )}
      </div>
    </div>
  );

  const OrderHistoryView = ({ companyId }) => {
    const orders = mockOrderHistory[companyId] || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Order History</h3>
          <button
            onClick={() => setSelectedCompany(null)}
            className="text-blue-600 hover:underline"
          >
            ← Back to Companies
          </button>
        </div>
        
        {orders.map((order, index) => {
          const StatusIcon = statusConfig[order.status].icon;
          return (
            <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Order {index + 1}</span>
                    <span className={`px-2 py-1 rounded text-xs border ${statusConfig[order.status].color}`}>
                      <StatusIcon size={12} className="inline mr-1" />
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{order.service}</p>
                  <p className="text-gray-800">{order.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.cost}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  {order.deliveryTime && <span>Delivered: {order.deliveryTime}</span>}
                  {order.scheduledTime && <span>Scheduled: {order.scheduledTime}</span>}
                  {order.estimatedTime && <span>ETA: {order.estimatedTime}</span>}
                </div>
                {order.status === 'delivered' && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowCaseForm(true);
                    }}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare size={14} />
                    Create Case
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const CaseForm = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">
          Create Case for {selectedOrder?.service || 'Selected Order'}
        </h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateCase(selectedOrder);
        }}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Issue Type</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Damaged Package</option>
              <option>Late Delivery</option>
              <option>Missing Items</option>
              <option>Wrong Address</option>
              <option>Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              className="w-full border rounded px-3 py-2 h-24 resize-none" 
              placeholder="Please describe the issue..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCaseForm(false);
                setSelectedOrder(null);
              }}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Portal</h1>
        <p className="text-gray-600">Manage your subscriptions and track your deliveries</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('companies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'companies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Companies
          </button>
          <button
            onClick={() => setActiveTab('subscribed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscribed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Subscriptions ({subscribedCompanies.length})
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {selectedCompany ? (
        <OrderHistoryView companyId={selectedCompany} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'companies' && 
            availableCompanies
              .filter(company => 
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(company => (
                <CompanyCard key={company.id} company={company} showSubscribeButton={true} />
              ))
          }
          
          {activeTab === 'subscribed' && 
            subscribedCompanies
              .filter(company => 
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(company => (
                <CompanyCard key={company.id} company={company} showSubscribeButton={false} />
              ))
          }
        </div>
      )}

      {/* Case Form Modal */}
      {showCaseForm && <CaseForm />}
    </div>
  );
};

export default CustomerPortal;
