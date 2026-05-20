import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Example: Reading PUBLIC data (no RLS required)
export default function PublicProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicProducts();
  }, []);

  const fetchPublicProducts = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .limit(20);

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading products...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Public Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-4 bg-gray-50">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-gray-600">Brand: {product.brand}</p>
            <p className="text-lg font-semibold">${product.price}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
