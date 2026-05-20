const express = require('express')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router()
const auth = require('../middleware/auth')
const role = require('../middleware/role')
const {
	listProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
	adjustStock,
} = require('../controllers/products')

// Public product browse and details
router.get('/', listProducts)
router.get('/:id', getProduct)

// Protected routes: staff/admin
router.post('/upload', auth, role(['admin', 'staff']), upload.single('image'), uploadImage)
router.post('/', auth, role(['admin', 'staff']), createProduct)
router.put('/:id', auth, role(['admin', 'staff']), updateProduct)
router.delete('/:id', auth, role(['admin', 'staff']), deleteProduct)
router.patch('/:id/stock', auth, role(['admin', 'staff']), adjustStock)

module.exports = router
