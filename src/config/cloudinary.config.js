/**
 * Cloudinary Configuration
 * 
 * Setup Instructions:
 * 1. Sign up for a free Cloudinary account at https://cloudinary.com
 * 2. Get your Cloud Name from the dashboard
 * 3. Create an unsigned upload preset:
 *    - Go to Settings > Upload
 *    - Scroll to "Upload presets"
 *    - Click "Add upload preset"
 *    - Set Signing Mode to "Unsigned"
 *    - Set Folder to "payment_proofs" (optional)
 *    - Save and copy the preset name
 * 4. Replace the values below with your credentials
 */

export const CLOUDINARY_CONFIG = {
  // Your Cloudinary cloud name (found in dashboard)
  CLOUD_NAME: 'dykbxopqn',

  // Your unsigned upload preset name
  UPLOAD_PRESET: 'profile picture',

  // API URL (automatically constructed)
  get API_URL() {
    return `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;
  },

  // Default folder for uploads
  DEFAULT_FOLDER: 'payment_proofs',

  // Image transformation options (optional)
  TRANSFORMATIONS: {
    // Resize images to max 1920x1080 to save bandwidth
    quality: 'auto:good',
    fetch_format: 'auto',
    max_width: 1920,
    max_height: 1080,
  },
};

// Validate configuration
export const validateCloudinaryConfig = () => {
  if (CLOUDINARY_CONFIG.CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    console.warn('⚠️ Cloudinary: Cloud name not configured. Please update src/config/cloudinary.config.js');
    return false;
  }

  if (CLOUDINARY_CONFIG.UPLOAD_PRESET === 'YOUR_UPLOAD_PRESET') {
    console.warn('⚠️ Cloudinary: Upload preset not configured. Please update src/config/cloudinary.config.js');
    return false;
  }

  return true;
};

export default CLOUDINARY_CONFIG;
