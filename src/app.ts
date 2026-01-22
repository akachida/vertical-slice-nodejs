import express from 'express'

import { Startup } from './startup'
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler'

const app = express()

app.use(express.json())

Startup.initialize()
Startup.registerRoutes(app)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(notFoundHandler)
app.use(errorHandler)

export { app }
