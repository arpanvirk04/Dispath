import React, { useState } from 'react';
import {
  Truck,
  Search,
  Filter,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  MapPin,
  Fuel,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown, Users,
} from 'lucide-react';

// Mock asset data
const mockAssets = [
  {
    id: 'TRK-001',
    name: 'Delivery Truck Alpha',
    type: 'Truck',
    make: 'Ford',
    model: 'Transit 350',
    year: 2022,
    licensePlate: 'ONT-1234',
    vin: '1FTBW3XM5NKA12345',
    status: 'In Service',
    currentLocation: 'Downtown Toronto Hub',
    assignedDriver: 'John Smith',
    mileage: 45678,
    fuelLevel: 85,
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-02-15',
    maintenanceInterval: 5000,
    usageHours: 2340,
    efficiency: 8.5, // km per liter
    repairHistory: [
      { date: '2024-01-15', type: 'Oil Change', cost: 120, description: 'Regular oil and filter change' },
      { date: '2023-12-10', type: 'Brake Repair', cost: 450, description: 'Replaced front brake pads' },
      { date: '2023-11-05', type: 'Tire Replacement', cost: 800, description: 'Replaced all 4 tires' }
    ],
    alerts: ['Maintenance Due Soon'],
    acquisitionDate: '2022-03-15',
    acquisitionCost: 45000,
    currentValue: 38000,
    insurance: {
      provider: 'State Farm',
      policyNumber: 'SF-789456',
      expiryDate: '2024-03-15',
      premium: 2400
    }
  },
  {
    id: 'TRK-002',
    name: 'Delivery Truck Beta',
    type: 'Truck',
    make: 'Mercedes',
    model: 'Sprinter 2500',
    year: 2021,
    licensePlate: 'ONT-5678',
    vin: '1FTBW3XM5NKA67890',
    status: 'Maintenance',
    currentLocation: 'Service Center',
    assignedDriver: 'Lisa Anderson',
    mileage: 67890,
    fuelLevel: 45,
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-02-20',
    maintenanceInterval: 5000,
    usageHours: 3450,
    efficiency: 9.2,
    repairHistory: [
      { date: '2024-01-20', type: 'Engine Repair', cost: 1200, description: 'Replaced engine cooling system' },
      { date: '2023-12-15', type: 'Transmission Service', cost: 350, description: 'Transmission fluid change' },
      { date: '2023-10-08', type: 'AC Repair', cost: 650, description: 'Fixed air conditioning compressor' }
    ],
    alerts: ['In Maintenance', 'High Mileage'],
    acquisitionDate: '2021-06-10',
    acquisitionCost: 52000,
    currentValue: 42000,
    insurance: {
      provider: 'Allstate',
      policyNumber: 'AS-456789',
      expiryDate: '2024-06-10',
      premium: 2800
    }
  },
  {
    id: 'TRL-001',
    name: 'Cargo Trailer Alpha',
    type: 'Trailer',
    make: 'Great Dane',
    model: 'Everest',
    year: 2020,
    licensePlate: 'ONT-9012',
    vin: '1GRAA0625LF123456',
    status: 'Available',
    currentLocation: 'North York Depot',
    assignedDriver: null,
    mileage: 89012,
    fuelLevel: null, // Trailers don't have fuel
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    maintenanceInterval: 10000,
    usageHours: 4567,
    efficiency: null,
    repairHistory: [
      { date: '2024-01-10', type: 'Brake Inspection', cost: 200, description: 'Annual brake system inspection' },
      { date: '2023-09-15', type: 'Tire Replacement', cost: 1200, description: 'Replaced 6 trailer tires' },
      { date: '2023-06-20', type: 'Electrical Repair', cost: 300, description: 'Fixed trailer lighting system' }
    ],
    alerts: [],
    acquisitionDate: '2020-08-20',
    acquisitionCost: 35000,
    currentValue: 28000,
    insurance: {
      provider: 'Progressive',
      policyNumber: 'PG-123789',
      expiryDate: '2024-08-20',
      premium: 1800
    }
  },
  {
    id: 'TRK-003',
    name: 'Express Van Charlie',
    type: 'Van',
    make: 'Ram',
    model: 'ProMaster 1500',
    year: 2023,
    licensePlate: 'ONT-3456',
    vin: '3C6TRVAG8NE123789',
    status: 'In Service',
    currentLocation: 'Scarborough Route',
    assignedDriver: 'Carlos Rodriguez',
    mileage: 23456,
    fuelLevel: 92,
    lastMaintenance: '2024-01-25',
    nextMaintenance: '2024-04-25',
    maintenanceInterval: 8000,
    usageHours: 1234,
    efficiency: 7.8,
    repairHistory: [
      { date: '2024-01-25', type: 'Oil Change', cost: 100, description: 'Synthetic oil change and filter' },
      { date: '2023-11-30', type: 'Warranty Service', cost: 0, description: 'Recall repair - door handle' }
    ],
    alerts: [],
    acquisitionDate: '2023-04-12',
    acquisitionCost: 38000,
    currentValue: 35000,
    insurance: {
      provider: 'State Farm',
      policyNumber: 'SF-987654',
      expiryDate: '2024-04-12',
      premium: 2200
    }
  },
  {
    id: 'TRK-004',
    name: 'Heavy Duty Delta',
    type: 'Truck',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2019,
    licensePlate: 'ONT-7890',
    vin: '1FUJBBCK5KLBR1234',
    status: 'Out of Service',
    currentLocation: 'Repair Shop',
    assignedDriver: null,
    mileage: 156789,
    fuelLevel: 15,
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-03-05',
    maintenanceInterval: 15000,
    usageHours: 8901,
    efficiency: 6.2,
    repairHistory: [
      { date: '2024-01-28', type: 'Major Repair', cost: 3500, description: 'Engine overhaul and transmission repair' },
      { date: '2024-01-05', type: 'Brake Service', cost: 800, description: 'Complete brake system service' },
      { date: '2023-11-20', type: 'Tire Service', cost: 1500, description: 'Replaced 8 truck tires' }
    ],
    alerts: ['Out of Service', 'Major Repair Required', 'High Mileage'],
    acquisitionDate: '2019-09-05',
    acquisitionCost: 85000,
    currentValue: 58000,
    insurance: {
      provider: 'Commercial Auto',
      policyNumber: 'CA-555444',
      expiryDate: '2024-09-05',
      premium: 4200
    }
  }
];

const AssetManagement = () => {
  const [assets, setAssets] = useState(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.make.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    const matchesType = typeFilter === 'All' || asset.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Service':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Available':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Maintenance':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Out of Service':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Service':
        return <CheckCircle className="w-4 h-4" />;
      case 'Available':
        return <Clock className="w-4 h-4" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'Out of Service':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const totalAssets = assets.length;
  const inService = assets.filter(a => a.status === 'In Service').length;
  const available = assets.filter(a => a.status === 'Available').length;
  const inMaintenance = assets.filter(a => a.status === 'Maintenance' || a.status === 'Out of Service').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  if (selectedAsset) {
    return <AssetDetails asset={selectedAsset} onBack={() => setSelectedAsset(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Management</h1>
        <p className="text-gray-600">Manage your fleet vehicles and equipment</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssets}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Service</p>
              <p className="text-2xl font-bold text-green-600">{inService}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-blue-600">{available}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Maintenance</p>
              <p className="text-2xl font-bold text-amber-600">{inMaintenance}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search assets by name, license plate, or make..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Status</option>
          <option value="In Service">In Service</option>
          <option value="Available">Available</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Types</option>
          <option value="Truck">Trucks</option>
          <option value="Van">Vans</option>
          <option value="Trailer">Trailers</option>
        </select>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedAsset(asset)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-600">{asset.make} {asset.model} ({asset.year})</p>
                    <p className="text-xs text-gray-500">{asset.licensePlate}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye size={16} />
                </button>
              </div>

              {/* Status and Location */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                    {getStatusIcon(asset.status)}
                    {asset.status}
                  </div>
                  {asset.alerts.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle size={14} />
                      <span className="text-xs">{asset.alerts.length}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{asset.currentLocation}</span>
                </div>
                {asset.assignedDriver && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{asset.assignedDriver}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Mileage</p>
                  <p className="font-semibold text-gray-900">{asset.mileage.toLocaleString()} km</p>
                </div>
                {asset.fuelLevel !== null && (
                  <div>
                    <p className="text-gray-500">Fuel Level</p>
                    <p className="font-semibold text-gray-900">{asset.fuelLevel}%</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Usage Hours</p>
                  <p className="font-semibold text-gray-900">{asset.usageHours.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Next Service</p>
                  <p className="font-semibold text-gray-900">{new Date(asset.nextMaintenance).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Alerts */}
              {asset.alerts.length > 0 && (
                <div className="border-t pt-3">
                  <div className="flex flex-wrap gap-1">
                    {asset.alerts.map((alert, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200"
                      >
                        {alert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'All' || typeFilter !== 'All'
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first asset.'}
          </p>
        </div>
      )}
    </div>
  );
};

// Asset Details Component
const AssetDetails = ({ asset, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'financials', label: 'Financials' },
    { id: 'history', label: 'History' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Service':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Available':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Maintenance':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Out of Service':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Assets
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
          <p className="text-gray-600">{asset.make} {asset.model} ({asset.year})</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Status</p>
              <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(asset.status)}`}>
                {asset.status}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mileage</p>
              <p className="text-2xl font-bold text-gray-900">{asset.mileage.toLocaleString()}</p>
              <p className="text-xs text-gray-500">kilometers</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usage Hours</p>
              <p className="text-2xl font-bold text-gray-900">{asset.usageHours.toLocaleString()}</p>
              <p className="text-xs text-gray-500">total hours</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">${asset.currentValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">estimated</p>
            </div>
            <TrendingDown className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Asset ID:</span>
                    <span className="font-medium">{asset.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License Plate:</span>
                    <span className="font-medium">{asset.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VIN:</span>
                    <span className="font-medium text-xs">{asset.vin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{asset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acquisition Date:</span>
                    <span className="font-medium">{new Date(asset.acquisitionDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{asset.currentLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned Driver:</span>
                    <span className="font-medium">{asset.assignedDriver || 'Unassigned'}</span>
                  </div>
                  {asset.fuelLevel !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Level:</span>
                      <span className="font-medium">{asset.fuelLevel}%</span>
                    </div>
                  )}
                  {asset.efficiency && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Efficiency:</span>
                      <span className="font-medium">{asset.efficiency} km/L</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {asset.alerts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
                <div className="space-y-2">
                  {asset.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-800">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">Last Maintenance</h4>
                <p className="text-gray-600">{new Date(asset.lastMaintenance).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">Next Maintenance</h4>
                <p className="text-gray-600">{new Date(asset.nextMaintenance).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">Maintenance Interval</h4>
                <p className="text-gray-600">{asset.maintenanceInterval.toLocaleString()} km</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Repair History</h3>
              <div className="space-y-4">
                {asset.repairHistory.map((repair, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{repair.type}</h4>
                        <p className="text-gray-600">{repair.description}</p>
                        <p className="text-sm text-gray-500">{new Date(repair.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${repair.cost}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Value</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acquisition Cost:</span>
                    <span className="font-medium">${asset.acquisitionCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Value:</span>
                    <span className="font-medium">${asset.currentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Depreciation:</span>
                    <span className="font-medium text-red-600">
                      ${(asset.acquisitionCost - asset.currentValue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{asset.insurance.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Policy Number:</span>
                    <span className="font-medium">{asset.insurance.policyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-medium">{new Date(asset.insurance.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Premium:</span>
                    <span className="font-medium">${asset.insurance.premium.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Costs</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Repair Costs:</span>
                  <span className="font-semibold text-gray-900">
                    ${asset.repairHistory.reduce((sum, repair) => sum + repair.cost, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
            <div className="space-y-4">
              {asset.repairHistory.map((repair, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{repair.type}</h4>
                    <p className="text-gray-600">{repair.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">{new Date(repair.date).toLocaleDateString()}</p>
                      <p className="font-semibold text-gray-900">${repair.cost}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetManagement;

