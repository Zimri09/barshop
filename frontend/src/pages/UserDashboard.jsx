import React, { useEffect, useState } from 'react';
import { fetchUserProfile, updateUserProfile, fetchUserOrders, createOrder } from '../services/apiClient';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
    loadOrders();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await fetchUserOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updated = await updateUserProfile({
        full_name: profile?.full_name || 'User',
        avatar_url: profile?.avatar_url,
      });
      setProfile(updated);
      alert('Profile updated!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const newOrder = await createOrder({
        items: [{ product_id: 1, quantity: 2 }],
        total: 99.99,
      });
      setOrders([newOrder, ...orders]);
      alert('Order created!');
    } catch (err) {
      alert('Error creating order: ' + err.message);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        {profile ? (
          <div>
            <p className="mb-2">
              <strong>Name:</strong> {profile.full_name || 'N/A'}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {profile.email || 'N/A'}
            </p>
            <button
              onClick={handleUpdateProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Profile
            </button>
          </div>
        ) : (
          <p>No profile data</p>
        )}
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
          <button
            onClick={handleCreateOrder}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Order
          </button>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded p-4 bg-gray-50">
                <p className="font-bold">Order #{order.id}</p>
                <p>Status: <span className="font-semibold">{order.status}</span></p>
                <p>Total: ${order.total}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
