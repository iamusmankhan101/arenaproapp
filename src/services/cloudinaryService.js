/**
 * Cloudinary Service for handling image uploads
 */

const CLOUDINARY_CLOUD_NAME = 'dykbxopqn';
const CLOUDINARY_UPLOAD_PRESET = 'venue_images'; // Using existing preset from project

/**
 * Uploads an image to Cloudinary
 * @param {string} uri - Local URI of the image
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (uri) => {
    try {
        console.log('📤 Uploading image to Cloudinary...');

        const formData = new FormData();
        formData.append('file', {
            uri: uri,
            type: 'image/jpeg', // Standard type for profile pics
            name: `profile_${Date.now()}.jpg`
        });
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            console.log('✅ Image uploaded to Cloudinary:', data.secure_url);
            return data.secure_url;
        } else {
            console.error('❌ Cloudinary upload error:', data);
            throw new Error(data.error?.message || 'Cloudinary upload failed');
        }
    } catch (error) {
        console.error('❌ Error uploading to Cloudinary:', error);
        throw error;
    }
};
