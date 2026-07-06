import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// BUG FIX: No file type validation existed — any file type could be uploaded (security risk)
const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp|avif/;
const ALLOWED_DOC_TYPES = /pdf|doc|docx/;

const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype.split("/")[1];

  if (ALLOWED_IMAGE_TYPES.test(ext) && ALLOWED_IMAGE_TYPES.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, gif, webp, avif) are allowed"), false);
  }
};

const documentFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (ALLOWED_DOC_TYPES.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Word documents are allowed"), false);
  }
};

const anyFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (ALLOWED_IMAGE_TYPES.test(ext) || ALLOWED_DOC_TYPES.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// Profile picture upload (images only, max 5MB)
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Document upload (PDF/Word, max 10MB)
export const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// General upload (images + docs, max 10MB)
export const upload = multer({
  storage,
  fileFilter: anyFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
