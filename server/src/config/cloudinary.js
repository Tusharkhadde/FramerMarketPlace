// import { v2 as cloudinary } from 'cloudinary'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// })

// export const uploadToCloudinary = async (fileBuffer, folder = 'products') => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload_stream(
//       {
//         folder: `farmer-marketplace/${folder}`,
//         resource_type: 'image',
//         transformation: [
//           { width: 800, height: 800, crop: 'limit' },
//           { quality: 'auto' },
//           { fetch_format: 'auto' },
//         ],
//       },
//       (error, result) => {
//         if (error) reject(error)
//         else resolve(result)
//       }
//     ).end(fileBuffer)
//   })
// }

// export const deleteFromCloudinary = async (publicId) => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId)
//     return result
//   } catch (error) {
//     console.error('Error deleting from Cloudinary:', error)
//     throw error
//   }
// }

// export default cloudinary
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = async (filePath, folder = 'products') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `farmmarket/${folder}`,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    })

    // Delete local file after upload
    fs.unlinkSync(filePath)

    return result
  } catch (error) {
    // Delete local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    throw error
  }
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
  }
}

export default cloudinary