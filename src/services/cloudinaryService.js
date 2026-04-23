/**
 * Cloudinary Image Upload Service
 * Handles image uploads to Cloudinary from React Native
 */

import { CLOUDINARY_CONFIG, validateCloudinaryConfig } from '../config/cloudinary.config';

/**
 * Upload image to Cloudinary
 * @param {string} imageUri - Local image URI from device
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadToCloudinary = async (imageUri, folder = CLOUDINARY_CONFIG.DEFAULT_FOLDER) => {
  try {
    // Validate configuration
    if (!validateCloudinaryConfig()) {
      throw new Error('Cloudinary not configured. Please update src/config/cloudinary.config.js');
    }

    console.log('📤 Uploading image to Cloudinary...');

    // Create form data
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename || 'payment_proof.jpg',
    });

    // Append upload preset (required for unsigned uploads)
    formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    
    // Optional: Add folder
    if (folder) {
      formData.append('folder', folder);
    }
    
    // Optional: Add timestamp to filename for uniqueness
    const timestamp = Date.now();
    formData.append('public_id', `${timestamp}_${filename?.replace(/\.[^/.]+$/, '')}`);

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_CONFIG.API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Cloudinary upload failed:', errorData);
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    console.log('✅ Image uploaded to Cloudinary:', data.secure_url);

    return data.secure_url;
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} imageUris - Array of local image URIs
 * @param {string} folder - Optional folder name
 * @returns {Promise<Array<string>>} - Array of Cloudinary URLs
 */
export const uploadMultipleToCloudinary = async (imageUris, folder = 'payment_proofs') => {
  try {
    const uploadPromises = imageUris.map(uri => uploadToCloudinary(uri, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('❌ Error uploading multiple images:', error);
    throw error;
  }
};

export default {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
