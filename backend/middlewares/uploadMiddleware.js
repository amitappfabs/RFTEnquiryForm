import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config: save with unique name (timestamp + original name)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  }
});

// Only accept PDF files, max size 10MB
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware to handle single PDF file upload (form field: 'pdf')
const uploadPDFMiddleware = upload.single('pdf');

const uploadFilesMiddleware = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'academics', maxCount: 1 },
]);

// Process the upload to Cloudinary
const processCloudinaryUpload = async (req, res, next) => {
  if (!req.file) {
    return next(); // Skip if no file
  }

  try {
    // Create a temporary file path (optional, alternative to memory storage)
    // const tempFilePath = `./uploads/${req.file.originalname}`;
    // await fs.writeFile(tempFilePath, req.file.buffer);
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto', // Auto-detect file type
          folder: 'pdf_uploads' // Optional folder in Cloudinary
        }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      stream.end(req.file.buffer);
      
      // Alternative if using temp file:
      // cloudinary.uploader.upload(tempFilePath, 
      //   { resource_type: 'auto' }, 
      //   (error, result) => {...});
    });

    // Attach the Cloudinary result to the request object
    req.cloudinaryResult = result;
    
    // Clean up temp file if used
    // await fs.unlink(tempFilePath);
    
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
};

const processCloudinaryUploads = async (req, res, next) => {
  try {
    const results = {};
    // Upload resume if present
    if (req.files && req.files.resume && req.files.resume[0]) {
      const originalName = req.files.resume[0].originalname || `resume_${Date.now()}.pdf`;
      const publicId = originalName.endsWith('.pdf') ? originalName.replace(/\.pdf$/i, '') : originalName;
      results.resume = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'pdf_uploads',
            public_id: publicId,
            format: 'pdf',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.files.resume[0].buffer);
      });
    }
    // Upload academics if present
    if (req.files && req.files.academics && req.files.academics[0]) {
      const originalName = req.files.academics[0].originalname || `academics_${Date.now()}.pdf`;
      const publicId = originalName.endsWith('.pdf') ? originalName.replace(/\.pdf$/i, '') : originalName;
      results.academics = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'pdf_uploads',
            public_id: publicId,
            format: 'pdf',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.files.academics[0].buffer);
      });
    }
    req.cloudinaryResults = results;
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
};

export { uploadPDFMiddleware, processCloudinaryUpload, uploadFilesMiddleware, processCloudinaryUploads };