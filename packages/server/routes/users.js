const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const { listUsers, updateUserRole } = require('../controllers/users')

router.get('/', auth, role(['admin']), listUsers)
router.patch('/:id/role', auth, role(['admin']), updateUserRole)

module.exports = router
