const cloudinary = require('../config/cloudinary');
const logger = require('../config/logger');

// Uploads a local file buffer/path to Cloudinary and returns the secure URL.
// `folder` groups uploads by domain, e.g. "auraguard/violations".
const uploadToCloudinary = async (filePathOrBuffer, folder = 'auraguard/misc') => {
  try {
    const result = await cloudinary.uploader.upload(filePathOrBuffer, {
      folder,
      resource_type: 'auto',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    logger.error(`Cloudinary upload failed: ${error.message}`);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    logger.error(`Cloudinary delete failed for ${publicId}: ${error.message}`);
    throw error;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
