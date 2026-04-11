import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import authRoutes from './routes/auth'
import listingsRoutes from './routes/listings'
import offersRoutes from './routes/offers'
import paymentsRoutes from './routes/payments'
import pricingRoutes from './routes/pricing'
import usersRoutes from './routes/users'
import adminRoutes from './routes/admin'
import notificationsRoutes from './routes/notifications'
import { logger } from './utils/logger'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// Socket.io for real-time updates
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }))
app.use('/api/', limiter)

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zamgrow Exchange API',
      version: '1.0.0',
      description: "Zambia's #1 Agricultural Marketplace REST API",
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
}
const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
}))

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/listings', listingsRoutes)
app.use('/api/v1/offers', offersRoutes)
app.use('/api/v1/payments', paymentsRoutes)
app.use('/api/v1/pricing', pricingRoutes)
app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/notifications', notificationsRoutes)

// Health Check
app.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    service: 'Zamgrow Exchange API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// 404 Handler
app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack })
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// Socket.io connection
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)

  socket.on('join-user', (userId: string) => {
    socket.join(`user-${userId}`)
  })

  socket.on('join-listing', (listingId: string) => {
    socket.join(`listing-${listingId}`)
  })

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  logger.info(`🌾 Zamgrow Exchange API running on port ${PORT}`)
  logger.info(`📖 API Docs: http://localhost:${PORT}/api/docs`)
})

export default app
