import React from 'react';
import { Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Pending' },
  assigned: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Package, label: 'Assigned' },
  completed: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, label: 'Cancelled' },
};

const OrderManagement = ({ orders = [], customers = [], routes = [], onAssignOrderToRoute }) => {
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const handleRouteChange = (orderId, routeId) => {
    onAssignOrderToRoute(orderId, routeId || null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
          {orders.length} orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders will appear here when customers create them</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Service Time</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created Date</th>
                <th className="px-4 py-3 font-semibold">Route</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const statusKey = order.status || 'pending';
                const statusEntry = statusConfig[statusKey] || statusConfig['pending'];
                const StatusIcon = statusEntry.icon;
                const serviceLabel = (order.service && order.service.trim()) ? order.service : 'Service Request';
                const isCompleted = statusKey === 'completed';
                return (
                  <tr key={order.id} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-3">{getCustomerName(order.customerId)}</td>
                    <td className="px-4 py-3">{serviceLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {order.serviceTime} min
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                        order.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        order.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${statusEntry.color}`}>
                        <StatusIcon size={12} />
                        {statusEntry.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.createdDate}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.routeId || ''}
                        onChange={(e) => handleRouteChange(order.id, e.target.value)}
                        disabled={isCompleted}
                        className={`border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isCompleted ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-gray-300'
                        }`}
                      >
                        <option value="">No Route</option>
                        {routes.map(route => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
