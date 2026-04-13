import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import User from '../src/models/User.js'

// Resolve paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')
const envPath = path.join(__dirname, '../.env')
const jsonPath = path.join(rootDir, 'farmers_data.json')

// Load environment variables
dotenv.config({ path: envPath })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file')
  process.exit(1)
}

const seedFarmers = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('📦 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // 2. Read farmers data
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ Data file not found at: ${jsonPath}`)
      process.exit(1)
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8')
    const farmers = JSON.parse(rawData)
    console.log(`📄 Loaded ${farmers.length} farmers from JSON`)

    // 3. Filter out existing users by email
    const emails = farmers.map(f => f.email.toLowerCase())
    const existingUsers = await User.find({ email: { $in: emails } }).select('email')
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()))

    const newFarmers = farmers.filter(f => !existingEmails.has(f.email.toLowerCase()))

    if (newFarmers.length === 0) {
      console.log('⚠️ All farmers already exist in the database. Skipping insertion.')
    } else {
      console.log(`🚀 Inserting ${newFarmers.length} new farmers...`)
      
      // Use insertMany to bypass the pre-save hook (preserving pre-hashed passwords)
      const result = await User.insertMany(newFarmers, { ordered: false })
      console.log(`✅ Successfully seeded ${result.length} new farmers!`)
    }

    console.log('\n🎉 Seeding process completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedFarmers()
