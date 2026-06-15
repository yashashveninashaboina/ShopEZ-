import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configure cloudinary only if variables exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a local file to Cloudinary.
 * If successful, deletes the local file and returns the secure URL.
 * If Cloudinary is not configured, returns null.
 * @param {string} localFilePath - Path to the local file
 * @returns {Promise<string|null>} - Cloudinary URL or null
 */
export const uploadToCloudinary = async (localFilePath) => {
  if (!isCloudinaryConfigured) {
    console.log('Cloudinary not configured. Falling back to local storage.');
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'shopez_products',
      resource_type: 'auto'
    });

    // Delete local file after successful upload to Cloudinary
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    return null;
  }
};
