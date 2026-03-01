// backend/src/middleware/upload.js
// Multer middleware for handling file uploads in memory

'use strict';

const multer = require('multer');
const AppError = require('../utils/AppError');

// Store files in memory (buffer) — we stream to Cloudinary directly
const storage = multer.memoryStorage();

function fileFilter(allowedMimes) {
  return (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `Invalid file type. Allowed: ${allowedMimes.join(', ')}`,
          400
        ),
        false
      );
    }
  };
}

// Avatar upload: images only, max 2MB
const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
}).single('avatar');

// Resume upload: PDF only, max 5MB
const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(['application/pdf']),
}).single('resume');

// LinkedIn PDF upload: PDF only, max 5MB
const uploadLinkedinPdf = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(['application/pdf']),
}).single('linkedinPdf');

// Wrap multer to produce proper AppErrors instead of multer's raw errors
function wrapMulter(multerFn) {
  return (req, res, next) => {
    multerFn(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds the allowed limit.', 400));
        }
        return next(new AppError(err.message, 400));
      }
      next(err);
    });
  };
}

module.exports = {
  uploadAvatar: wrapMulter(uploadAvatar),
  uploadResume: wrapMulter(uploadResume),
  uploadLinkedinPdf: wrapMulter(uploadLinkedinPdf),
};
