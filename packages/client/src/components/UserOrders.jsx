import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Example: Accessing RLS-protected tables (requires authenticated user)
export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserOrders(user.id);
      } else {
        setLoading(false);
        setError('Not authenticated');
      }
    });
  }, []);

  const fetchUserOrders = async (userId) => {
    try {
      setLoading(true);
      // RLS will automatically filter to current user's orders
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4 text-yellow-600">Please sign in to view your orders</div>;
  if (loading) return <div className="p-4">Loading your orders...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded p-4 bg-blue-50">
              <p className="font-bold">Order #{order.id}</p>
              <p>Status: {order.status}</p>
              <p>Total: ${order.total}</p>
              <p className="text-sm text-gray-500">Created: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
