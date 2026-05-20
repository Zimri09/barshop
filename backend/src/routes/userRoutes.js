import express from 'express';
import { supabaseAnon } from '../supabaseAnon.js';

const userRouter = express.Router();

/**
 * Get current user profile
 * Protected: requires auth token
 */
userRouter.get('/profile', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Fetch user profile from users table with RLS
    const { data, error } = await supabaseAnon
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Update user profile
 * Protected: requires auth token
 */
userRouter.patch('/profile', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { full_name, avatar_url } = req.body;

    // Update only current user's profile (RLS ensures this)
    const { data, error } = await supabaseAnon
      .from('users')
      .update({ full_name, avatar_url, updated_at: new Date() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get current user's orders
 * Protected: requires auth token
 * RLS policy ensures users can only see their own orders
 */
userRouter.get('/orders', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { data, error } = await supabaseAnon
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Create a new order
 * Protected: requires auth token
 * RLS policy ensures order is created for current user
 */
userRouter.post('/orders', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { items, total } = req.body;

    const { data, error } = await supabaseAnon
      .from('orders')
      .insert([
        {
          user_id: req.user.id,
          items,
          total,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default userRouter;
