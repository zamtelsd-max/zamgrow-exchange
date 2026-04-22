import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { generalLimiter } from './middleware/rateLimit'

// Routes
import authRoutes from './routes/auth'
import listingsRoutes from './routes/listings'
import marketRoutes from './routes/market'
import usersRoutes from './routes/users'
import adminRoutes from './routes/admin'
import notificationsRoutes from './routes/notifications'
import paymentsRoutes from './routes/payments'
import salesRoutes from './routes/sales'
import pricingRoutes from './routes/pricing'

const app = express()
const httpServer = createServer(app)

// Socket.IO for real-time features
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'] }
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}))
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://zamtelsd-max.github.io',
      'https://depcxnwq.gensparkclaw.com',
      'https://is.gd',
    ]
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return cb(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(generalLimiter)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'zamgrow-api', version: '1.0.0', timestamp: new Date().toISOString() }))

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/listings', listingsRoutes)
app.use('/api/v1/market', marketRoutes)
app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/notifications', notificationsRoutes)
app.use('/api/v1', paymentsRoutes)
app.use('/api/v1/sales', salesRoutes)
app.use('/api/v1/pricing', pricingRoutes)

// Socket events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  socket.on('join_room', (userId: string) => socket.join(`user_${userId}`))
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`))
})

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found' }))

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message })
})

const PORT = parseInt(process.env.PORT || '3001')
httpServer.listen(PORT, () => {
  console.log(`\u{1F33E} Zamgrow Exchange API running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

export { io }
export default app
