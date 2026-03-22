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
  
  const ProductSchema = new mongoose.Schema({}, { strict: false });
  const Product = mongoose.model('Product', ProductSchema);
  
  const products = await Product.find({}, { cropName: 1, images: 1 }).lean();
  fs.writeFileSync('db_out.json', JSON.stringify(products, null, 2));
  
  process.exit(0);
}

check();
