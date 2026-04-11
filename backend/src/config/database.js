import mongoose from 'mongoose'
import { MONGODB_URI } from './env.js'

export async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI no configurado')
  await mongoose.connect(MONGODB_URI)
}
