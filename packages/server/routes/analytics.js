const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const { getAnalytics } = require('../controllers/analytics')

router.get('/', auth, role(['admin', 'staff']), getAnalytics)

module.exports = router
