import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool, query, getPoolStats } from './config/db.js';
import { handleFormUpload, getAllCandidates, getCandidateById, getCandidateInfo } from './controllers/formController.js';
import { 
  uploadPDFMiddleware,  
  uploadFilesMiddleware,  
} from './middlewares/uploadMiddleware.js';



// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ======================
// Middleware Setup
// ======================
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://*.railway.app',
    /railway\.app$/,
    'https://*.vercel.app',
    /vercel\.app$/,
    'https://ruhilfuturetech.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// Root Route - Welcome Message
// ======================
app.get('/', (req, res) => {
  res.json({
    message: 'Enquiry Form Backend API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      upload: 'POST /upload',
      candidates: 'GET /api/candidates',
      candidate: 'GET /candidate/:id'
    },
    timestamp: new Date().toISOString()
  });
});

// ======================
// Simple Health Check for Railway (Optional)
// ======================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ======================
// File Upload Endpoints
// ======================
app.get('/candidate/:candidateId', getCandidateInfo);
app.get('/api/candidates', getAllCandidates);
app.get('/api/candidates/:id', getCandidateById);

// ======================
// API Status Endpoint
// ======================
app.get('/api/status', async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT NOW() as server_time, 
      version() as db_version
    `);
    
    res.json({
      status: 'OK',
      time: new Date().toISOString(),
      database: {
        time: rows[0].server_time,
        version: rows[0].db_version
      },
      poolStats: getPoolStats()
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ======================
// Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'ERROR',
      message: 'File upload error',
      error: err.message
    });
  }

  res.status(500).json({
    status: 'ERROR',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Serve static files from uploads directory
app.use('/uploads', express.static('backend/uploads'));

// ======================
// PDF Upload Endpoint (Local)
// ======================
app.post('/upload', uploadFilesMiddleware, handleFormUpload);

app.listen(PORT, HOST, () => {
  console.log(`
  Server running:
  - Environment: ${process.env.NODE_ENV || 'development'}
  - URL: http://${HOST}:${PORT}
  - Database: ${process.env.DB_NAME}@${process.env.DB_HOST}
  - Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Disabled'}
  `);
});

export default app;