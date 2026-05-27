import React, { useMemo, useState } from 'react';
import CaseDetails from './CaseDetails';

const statusColors = {
  created: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  assigned: 'bg-blue-100 text-blue-800 border-blue-300',
  'in progress': 'bg-blue-100 text-blue-800 border-blue-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  closed: 'bg-green-100 text-green-800 border-green-300',
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const getDateOnly = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const Maps = ({ orders = [], customers = [], onViewCustomer }) => {
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);

  const customerMap = useMemo(() => {
    const map = {};
    (customers || []).forEach((customer) => {
      if (!customer) return;
      map[String(customer.id)] = customer;
    });
    return map;
  }, [customers]);

  const allCases = useMemo(() => {
    const rows = [];
    (orders || []).forEach((order) => {
      if (!order || !Array.isArray(order.cases) || order.cases.length === 0) return;
      order.cases.forEach((caseItem, index) => {
        const customer = customerMap[String(order.customerId)] || {};
        const createdAt = caseItem.createdAt || order.createdAt || order.createdDate;
        const updatedAt = order.updatedAt || createdAt;
        const normalizedStatus = (order.status || 'pending').toString().toLowerCase();
        rows.push({
          id: caseItem.id || `${order.id}-${index}`,
          caseTitle: caseItem.title || 'Case',
          description: caseItem.description || '',
          createdBy: caseItem.createdBy || '',
          service: order.service || 'Service Request',
          status: normalizedStatus,
          createdAt,
          updatedAt,
          orderId: order.id,
          customerId: order.customerId,
          customerName: customer.name || `Customer ${order.customerId || ''}`,
          address: customer.address || order.dropoffAddress || '—',
          phone: customer.phone || '—',
          email: customer.email || '—',
          notes: order.notes || '',
        });
      });
    });
    return rows.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [orders, customerMap]);

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(allCases.map((c) => c.status).filter(Boolean)));
    return ['all', ...unique];
  }, [allCases]);

  const filteredCases = useMemo(() => {
    return allCases.filter((caseRow) => {
      const statusMatch = filter === 'all' ? true : caseRow.status === filter;
      const dateMatch = !dateFilter ? true : getDateOnly(caseRow.createdAt) === dateFilter;
      return statusMatch && dateMatch;
    });
  }, [allCases, filter, dateFilter]);

  const maxDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (selectedCase) {
    return (
      <CaseDetails
        caseData={selectedCase}
        onBack={() => setSelectedCase(null)}
        onViewCustomer={onViewCustomer}
      />
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold">Customer Cases</h2>
        <div className="flex items-center gap-3">
          <div>
            <label className="mr-2 font-medium">Status:</label>
            <select
              className="border rounded px-2 py-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all'
                    ? 'All'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mr-2 font-medium">Date:</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              max={maxDate}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 table-fixed">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-2 py-2 font-semibold w-10">#</th>
              <th className="px-2 py-2 font-semibold w-48">Case</th>
              <th className="px-2 py-2 font-semibold w-48">Customer</th>
              <th className="px-2 py-2 font-semibold w-40">Contact</th>
              <th className="px-2 py-2 font-semibold w-32">Created</th>
              <th className="px-2 py-2 font-semibold w-32">Updated</th>
              <th className="px-2 py-2 font-semibold w-32">Service</th>
              <th className="px-2 py-2 font-semibold w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((caseRow, idx) => (
              <tr
                key={caseRow.id}
                className="border-b hover:bg-blue-50 whitespace-nowrap cursor-pointer"
                onClick={() => setSelectedCase(caseRow)}
              >
                <td className="px-2 py-2 font-bold text-blue-700">{idx + 1}</td>
                <td className="px-2 py-2">
                  <div className="font-semibold text-gray-900">{caseRow.caseTitle}</div>
                  <div className="text-xs text-gray-500">Order #{caseRow.orderId}</div>
                  {caseRow.createdBy && (
                    <div className="text-xs text-gray-400">By {caseRow.createdBy}</div>
                  )}
                </td>
                <td className="px-2 py-2">
                  <div>{caseRow.customerName}</div>
                  <div className="text-xs text-gray-500">{caseRow.address}</div>
                </td>
                <td className="px-2 py-2">
                  <div>{caseRow.phone}</div>
                  <div className="text-xs text-gray-500">{caseRow.email}</div>
                </td>
                <td className="px-2 py-2">{formatDateTime(caseRow.createdAt)}</td>
                <td className="px-2 py-2">{formatDateTime(caseRow.updatedAt)}</td>
                <td className="px-2 py-2">{caseRow.service}</td>
                <td className="px-2 py-2">
                  <span className={`px-2 py-1 rounded text-xs border ${statusColors[caseRow.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {caseRow.status ? caseRow.status.charAt(0).toUpperCase() + caseRow.status.slice(1) : 'Open'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCases.length === 0 && allCases.length > 0 && (
          <div className="text-center text-gray-500 py-8">No cases match the current filters.</div>
        )}
        {allCases.length === 0 && (
          <div className="text-center text-gray-500 py-8">No cases have been created yet.</div>
        )}
      </div>
    </div>
  );
};

export default Maps;
