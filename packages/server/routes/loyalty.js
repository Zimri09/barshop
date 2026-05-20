const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { getLoyalty } = require('../controllers/loyalty')

router.get('/', auth, getLoyalty)

module.exports = router
