require('dotenv').config()
const express = require('express')
const cors = require('cors')
const productsRoutes = require('./routes/products')
const ordersRoutes = require('./routes/orders')
const categoriesRoutes = require('./routes/categories')
const analyticsRoutes = require('./routes/analytics')
const usersRoutes = require('./routes/users')
const { authMiddleware } = require('./middleware/authMiddleware')

const PORT = Number(process.env.PORT) || 3001

const app = express()

app.use(express.json())

if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: true,
    }),
  )
}

// Apply auth middleware globally (optional, can be per-route too)
app.use(authMiddleware)

app.get('/', (req, res) => {
  res.type('text').send('API is running. Try GET /api/health')
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Mount API routes
app.use('/api/products', productsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/users', usersRoutes)

// Note: User routes require converting to CommonJS or using dynamic import
// For now, products routes handle the core functionality
// When you convert server to ES modules, add:
// import userRouter from './routes/userRoutes.js'
// app.use('/api/users', userRouter)

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
