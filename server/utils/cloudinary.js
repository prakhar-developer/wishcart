const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary from a URL (e.g. Google profile picture).
 * Returns the secure Cloudinary URL, or null on failure.
 */
async function uploadImageFromUrl(imageUrl, options = {}) {
  try {
    if (!imageUrl) return null;

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: options.folder || 'wishcart/avatars',
      public_id: options.public_id || undefined,
      overwrite: true,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error.message || error);
    return null;
  }
}

/**
 * Upload a base64 data URI image to Cloudinary (e.g. user-uploaded avatar).
 * Returns the secure Cloudinary URL, or null on failure.
 */
async function uploadBase64Image(base64Data, options = {}) {
  try {
    if (!base64Data) return null;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder: options.folder || 'wishcart/avatars',
      public_id: options.public_id || undefined,
      overwrite: true,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error.message || error);
    return null;
  }
}

module.exports = { cloudinary, uploadImageFromUrl, uploadBase64Image };
