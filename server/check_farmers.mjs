import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const UserSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.model('User', UserSchema);
  
  const farmers = await User.find({ userType: 'farmer' }).lean();
  fs.writeFileSync('farmers_out.json', JSON.stringify(farmers, null, 2));
  
  console.log(`Found ${farmers.length} farmers`);
  process.exit(0);
}

check();
