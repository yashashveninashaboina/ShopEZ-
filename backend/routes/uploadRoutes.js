import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Ensure uploads folder exists in working directory
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp|gif/;
  const mimetypes = /image\/jpeg|image\/png|image\/webp|image\/gif/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, webp, gif)!'), false);
  }
}

const upload = multer({ storage, fileFilter });

// @desc    Upload product images (single or multiple)
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const localPath = file.path;
      // Try to upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(localPath);
      
      if (cloudinaryUrl) {
        return cloudinaryUrl;
      }
      
      // Fallback: return local path served by static middleware
      // e.g. /uploads/image-12345.jpg
      const filename = path.basename(localPath);
      return `/uploads/${filename}`;
    });

    const imageUrls = await Promise.all(uploadPromises);
    res.json({ urls: imageUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
