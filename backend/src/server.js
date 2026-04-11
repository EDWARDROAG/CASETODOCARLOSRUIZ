import app from './app.js'
import { PORT } from './config/env.js'
import { connectDB } from './config/database.js'

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log('[associate-backend] running on port', PORT) // @strip
  })
}

start().catch((err) => {
  console.error('[associate-backend] startup error', err) // @strip
  process.exit(1)
})
