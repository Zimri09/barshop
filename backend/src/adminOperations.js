import { supabaseAdmin } from './supabaseAdmin.js';

// Example: Admin-only query (bypasses RLS)
export async function getAllOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, user:user_id(email, name)');

  if (error) throw error;
  return data;
}

// Example: Update user data as admin (bypasses RLS)
export async function updateUserRole(userId, role) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

// Example: Create user as admin
export async function createUserAsAdmin(email, password) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;
  return data;
}

// Example: Delete user as admin
export async function deleteUserAsAdmin(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}

// Example: Batch update (admin privilege)
export async function batchUpdateProductStock(updates) {
  // updates: [{ id: 1, stock: 50 }, { id: 2, stock: 30 }]
  const promises = updates.map((update) =>
    supabaseAdmin
      .from('products')
      .update({ stock: update.stock })
      .eq('id', update.id)
  );

  const results = await Promise.all(promises);
  return results;
}
