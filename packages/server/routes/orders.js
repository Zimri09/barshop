const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const optionalAuth = require('../middleware/optionalAuth')
const role = require('../middleware/role')
const { createOrder, listOrders, getOrder, updateOrderStatus, updateOrderContact } = require('../controllers/orders')

router.post('/', optionalAuth, createOrder)
router.get('/', auth, listOrders)
router.get('/:id', auth, getOrder)
router.patch('/:id/status', auth, role(['admin', 'staff']), updateOrderStatus)
router.patch('/:id/contact', optionalAuth, updateOrderContact)

module.exports = router
