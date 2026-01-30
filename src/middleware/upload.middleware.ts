import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.png'; // Default to .png if no extension
    const filename = `profile-${uniqueSuffix}${ext}`;
    console.log("📝 Generated filename:", filename);
    cb(null, filename);
  },
});

// Better file filter
const fileFilter = (req: any, file: any, cb: any) => {
  console.log("🔍 File filter checking:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname
  });
  
  // Accept image files
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/octet-stream' // Sometimes images come as this
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check by MIME type first
  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log("✅ File accepted by MIME type:", file.mimetype);
    return cb(null, true);
  }
  
  // Check by extension as fallback
  if (allowedExtensions.includes(ext)) {
    console.log("✅ File accepted by extension:", ext);
    return cb(null, true);
  }
  
  console.log("❌ File rejected:", {
    mimetype: file.mimetype,
    extension: ext
  });
  
  cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp, svg)"));
};

// Create multer instance
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (more generous)
  }
});

console.log("✅ Multer middleware configured");