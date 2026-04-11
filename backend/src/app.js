import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { CORS_ORIGIN } from './config/env.js'
import healthRoutes from './routes/health.routes.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN }))
app.use(express.json({ limit: '2mb' }))
app.use('/api/health', healthRoutes)
app.get('/', (_req, res) => res.json({ ok: true }))

export default app
