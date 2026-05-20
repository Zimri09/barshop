import { supabaseAnon } from './supabaseAnon.js';

/**
 * Create a Supabase client for a specific user using their JWT token
 * This allows RLS policies to work correctly on the backend
 */
export function createUserClient(token) {
  return supabaseAnon.auth.setAuth(token);
}

/**
 * Example: Query with RLS respect using user's token
 * The RLS policies will filter results based on the authenticated user
 */
export async function getUserOrders(userId, token) {
  const { data, error } = await supabaseAnon
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .throwOnError();

  if (error) throw error;
  return data;
}

/**
 * Example: Insert with RLS - requires authenticated user token
 * The token context ensures RLS policies are respected
 */
export async function createOrder(orderData, token) {
  const userClient = supabaseAnon.auth.setAuth(token);
  
  const { data, error } = await userClient
    .from('orders')
    .insert([orderData])
    .select()
    .throwOnError();

  if (error) throw error;
  return data;
}
