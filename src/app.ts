import express from 'express'

import { Startup } from './startup'

const app = express()

app.use(express.json())

Startup.initialize()
Startup.registerRoutes(app)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

export { app }
