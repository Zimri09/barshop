import { supabase } from '../supabaseClient';

/**
 * Fetch user's token and include it in API requests
 */
export async function getAuthToken() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.warn('No active session');
      return null;
    }

    return data.session.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Helper function to make authenticated API calls
 */
export async function apiCall(endpoint, options = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Example: Fetch user profile
 */
export async function fetchUserProfile() {
  return apiCall('/users/profile');
}

/**
 * Example: Update user profile
 */
export async function updateUserProfile(updates) {
  return apiCall('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Example: Fetch user orders
 */
export async function fetchUserOrders() {
  return apiCall('/users/orders');
}

/**
 * Example: Create order
 */
export async function createOrder(orderData) {
  return apiCall('/users/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}
