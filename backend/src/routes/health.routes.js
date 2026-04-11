import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'associate-backend',
    slug: process.env.ASSOCIATE_SLUG || null,
    ts: new Date().toISOString()
  })
})

export default router
