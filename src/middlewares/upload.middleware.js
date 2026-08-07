const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

// Files are buffered in memory then streamed to Cloudinary — nothing is
// persisted to local disk.
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

module.exports = upload;
