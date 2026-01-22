import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'

import { Startup } from './startup'
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler'

const app = express()

app.use(helmet())

app.use(cors())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)
app.use(express.json({ limit: '10kb' }))

Startup.initialize()
Startup.registerRoutes(app)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(notFoundHandler)
app.use(errorHandler)

export { app }
