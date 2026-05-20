import express from 'express';
import { getAllOrders, updateUserRole, createUserAsAdmin, deleteUserAsAdmin } from './adminOperations.js';

const adminRouter = express.Router();

// ⚠️ IMPORTANT: Add authentication middleware to verify admin status!
// This is just an example - implement proper role-based access control

// Get all orders (admin only)
adminRouter.get('/orders', async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user role (admin only)
adminRouter.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const data = await updateUserRole(req.params.id, role);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create user as admin
adminRouter.post('/users', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await createUserAsAdmin(email, password);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user (admin only)
adminRouter.delete('/users/:id', async (req, res) => {
  try {
    await deleteUserAsAdmin(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default adminRouter;
