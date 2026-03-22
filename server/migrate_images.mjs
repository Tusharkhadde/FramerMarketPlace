import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'farmmarket/products',
    resource_type: 'auto',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error('No MONGODB_URI in .env');
    return process.exit(1);
  }
  
  if (process.env.CLOUDINARY_API_SECRET === '**********') {
    console.error('CLOUDINARY_API_SECRET is still obscured (**********). Please set it back to the real secret in .env before migrating!');
    return process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const ProductSchema = new mongoose.Schema({
    cropName: String,
    images: [{ url: String, publicId: String }]
  }, { strict: false });
  const Product = mongoose.model('Product', ProductSchema);

  const products = await Product.find({});
  let migratedCount = 0;

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    let needsUpdate = false;
    const newImages = [];

    for (const image of product.images) {
      // Check if the image url points to the local uploads folder
      if (image.url && image.url.startsWith('/uploads/')) {
        const localFilename = path.basename(image.url);
        const absolutePath = path.join(__dirname, 'uploads', localFilename);
        
        if (fs.existsSync(absolutePath)) {
          console.log(`Migrating ${localFilename} for product: ${product.cropName}...`);
          try {
            const result = await uploadToCloudinary(absolutePath);
            newImages.push({
              url: result.secure_url,
              publicId: result.public_id
            });
            needsUpdate = true;
          } catch (err) {
            console.error(`Error uploading ${localFilename}:`, err.message);
            newImages.push(image); // keep original if upload fails
          }
        } else {
          console.log(`File not found on disk: ${absolutePath}`);
          newImages.push(image);
        }
      } else {
        newImages.push(image);
      }
    }

    if (needsUpdate) {
      product.images = newImages;
      await product.save();
      console.log(`Updated product: ${product.cropName}`);
      migratedCount++;
    }
  }

  console.log(`\nMigration complete. Migrated ${migratedCount} products to Cloudinary.`);
  process.exit(0);
}

migrate().catch(console.error);
