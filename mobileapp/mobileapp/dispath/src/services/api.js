import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';

export async function fetchDriverAssignments(driverId) {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${driverId}/assignments`);
  if (!response.ok) {
    throw new Error('Failed to load assignments');
  }
  return response.json();
}

export async function createDriverCase(driverId, orderId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${driverId}/orders/${orderId}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to submit case');
  }
  return response.json();
}

export async function completeOrder(orderId) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'COMPLETED' })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to update order status');
  }

  return true;
}

export async function updateDriverLocation(driverId, payload) {
  const response = await fetch(`${API_BASE_URL}/api/drivers/${driverId}/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to update driver location');
  }
}
