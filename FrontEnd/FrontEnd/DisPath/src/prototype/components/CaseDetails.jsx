import React from 'react';

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

const CaseDetails = ({ caseData, onBack, onViewCustomer }) => {
  if (!caseData) {
    return <div className="p-8 text-center text-gray-500">Case not found.</div>;
  }

  const statusClass = statusColors[caseData.status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-blue-600 hover:underline">
          &larr; Back to Cases
        </button>
        {onViewCustomer && caseData.customerId && (
          <button
            onClick={() => onViewCustomer(caseData.customerId)}
            className="text-sm px-3 py-1 rounded border border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            View Customer Profile
          </button>
        )}
      </div>
      <h2 className="text-2xl font-bold mb-2">{caseData.caseTitle || 'Case Details'}</h2>
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded text-xs border ${statusClass}`}>
          {caseData.status ? caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1) : 'Open'}
        </span>
        {caseData.orderId && (
          <span className="px-2 py-1 rounded text-xs border border-gray-200 text-gray-600">
            Order #{caseData.orderId}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="font-semibold">Customer Name:</div>
          <div>{caseData.customerName}</div>
        </div>
        <div>
          <div className="font-semibold">Service:</div>
          <div>{caseData.service}</div>
        </div>
        <div>
          <div className="font-semibold">Address:</div>
          <div>{caseData.address}</div>
        </div>
        <div>
          <div className="font-semibold">Phone:</div>
          <div>{caseData.phone}</div>
        </div>
        <div>
          <div className="font-semibold">Email:</div>
          <div>{caseData.email}</div>
        </div>
        <div>
          <div className="font-semibold">Created:</div>
          <div>{formatDateTime(caseData.createdAt)}</div>
        </div>
        <div>
          <div className="font-semibold">Last Updated:</div>
          <div>{formatDateTime(caseData.updatedAt)}</div>
        </div>
        <div>
          <div className="font-semibold">Created By:</div>
          <div>{caseData.createdBy || '—'}</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-1">Case Description:</div>
        <div className="bg-gray-50 border rounded p-3 text-gray-700 whitespace-pre-line">
          {caseData.description || 'No details provided.'}
        </div>
      </div>
      <div>
        <div className="font-semibold mb-1">Customer Notes:</div>
        <div className="bg-gray-50 border rounded p-3 text-gray-700">
          {caseData.notes || '—'}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
