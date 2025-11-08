const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const UPLOAD_BASE = path.join(__dirname, "../uploads");
const IMAGE_DIR = path.join(UPLOAD_BASE, "images");
const DOC_DIR = path.join(UPLOAD_BASE, "docs");
const OTHER_DIR = path.join(UPLOAD_BASE, "others");

[IMAGE_DIR, DOC_DIR, OTHER_DIR].forEach(ensureDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = OTHER_DIR;
    if (file.mimetype.startsWith("image/")) folder = IMAGE_DIR;
    else if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    )
      folder = DOC_DIR;
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, "");
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type! Only images, PDFs, and Excel files are allowed."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
