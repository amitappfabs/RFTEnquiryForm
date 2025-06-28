import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool, query, getPoolStats } from './config/db.js';
import { uploadPDF, getCandidateInfo, getAllCandidates } from './controllers/formController.js';
import { 
  uploadPDFMiddleware, 
  processCloudinaryUpload, 
  uploadFilesMiddleware, 
  processCloudinaryUploads 
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
    /railway\.app$/
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
// app.post('/api/upload', uploadPDFMiddleware, processCloudinaryUpload, uploadPDF);
app.get('/candidate/:candidateId', getCandidateInfo);

// app.post('/submit-form', uploadFilesMiddleware, processCloudinaryUploads, uploadPDF);
app.get('/api/candidates', getAllCandidates);

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
app.post('/upload', uploadPDFMiddleware, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'ERROR', message: 'No file uploaded or invalid file type.' });
  }
  // Parse form data
  let formData = {};
  if (req.body.data) {
    try {
      formData = JSON.parse(req.body.data);
    } catch (e) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid form data.' });
    }
  }
  // Build file URL
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  // Validate numeric fields
  const validateNumericField = (value, fieldName, maxValue, precision) => {
    if (!value || value.trim() === '') return null;
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`Invalid ${fieldName}: must be a valid number`);
    }
    if (num > maxValue) {
      throw new Error(`${fieldName} exceeds maximum allowed value (${maxValue})`);
    }
    return Number(num.toFixed(precision));
  };

  try {
    const marks = validateNumericField(formData.marks, 'Aggregate Marks/CGPA', 100, 2);
    const ctc = validateNumericField(formData.expectedCTC, 'Expected CTC', 9999999.99, 2);
    
    // Validate graduation year
    const validateGraduationYear = (year) => {
      if (!year) throw new Error('Graduation year is required');
      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear + 10) {
        throw new Error(`Graduation year must be between 1950 and ${currentYear + 10}`);
      }
      return yearNum;
    };
    
    const graduationYear = validateGraduationYear(formData.graduationYear);
    
    await query('START TRANSACTION');
    const candidateQuery = `
      INSERT INTO Candidates (
        full_name, date_of_birth, gender, mobile_number, alternate_contact_number, email,
        current_city, home_town, willing_to_relocate, preferred_city,
        highest_qualification, course_name, college_university, affiliated_university,
        year_of_passing, aggregate_marks, all_semesters_cleared,
        internship_project_experience, project_description, linkedin_link, github_link,
        preferred_role, immediate_joining, open_to_shifts, expected_ctc,
        opportunity_source, available_for_online_tests, has_laptop_internet,
        resume_path, academic_docs_path, aadhar_number, pan_no, passport_available,
        certificate_name
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;
    const candidateValues = [
      formData.fullName,
      formData.dob,
      formData.gender ? formData.gender.toLowerCase() : null,
      formData.mobile,
      formData.altMobile || null,
      formData.email,
      formData.currentCity,
      formData.homeTown,
      formData.willingToRelocate === 'Yes',
      formData.preferredLocations ? formData.preferredLocations.join(', ') : null,
      formData.qualification,
      formData.course,
      formData.college,
      formData.affiliatedUniv || null,
      graduationYear,
      marks,
      formData.allSemCleared === 'Yes',
      formData.hasInternship === 'Yes',
      formData.projectDesc || null,
      formData.linkedin || null,
      formData.github || null,
      formData.preferredRole,
      formData.joining,
      formData.shifts === 'Yes',
      ctc,
      formData.source,
      formData.onlineTest === 'Yes',
      formData.laptop === 'Yes',
      fileUrl,
      null, // academic_docs_path
      formData.aadhar || null,
      formData.pan || null,
      !!formData.passport,
      formData.certifications || null
    ];
    const result = await query(candidateQuery, candidateValues);
    const candidateId = result.insertId;
    // Insert skills
    if (formData.techSkills && formData.techSkills.length > 0) {
      const skills = [
        ...formData.techSkills,
        ...(formData.otherTechSkills ? formData.otherTechSkills.split(',').map(s => s.trim()) : [])
      ].filter(skill => skill && skill !== 'Others');
      for (const skill of skills) {
        await query(
          'INSERT INTO Candidate_skills (candidate_id, skill_name) VALUES (?, ?)',
          [candidateId, skill]
        );
      }
    }
    // Insert preferred locations
    if (formData.preferredLocations && formData.preferredLocations.length > 0) {
      for (const location of formData.preferredLocations) {
        await query(
          'INSERT INTO candidate_preferred_job_location (candidate_id, job_location) VALUES (?, ?)',
          [candidateId, location]
        );
      }
    }
    // Insert languages known
    if (formData.languages && formData.languages.length > 0) {
      for (const language of formData.languages) {
        await query(
          'INSERT INTO candidate_languages_known (candidate_id, language_name) VALUES (?, ?)',
          [candidateId, language]
        );
      }
    }
    await query('COMMIT');
    res.status(201).json({
      success: true,
      candidateId,
      fileUrl
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error submitting form:', error);
    
    // Send user-friendly error messages
    let userMessage = 'Failed to submit form. Please check your information and try again.';
    
    if (error.message) {
      // Check for specific validation errors
      if (error.message.includes('Graduation year must be between')) {
        userMessage = error.message;
      } else if (error.message.includes('Aggregate Marks')) {
        userMessage = error.message;
      } else if (error.message.includes('Expected CTC')) {
        userMessage = error.message;
      } else if (error.message.includes('Duplicate entry')) {
        userMessage = 'An account with this email already exists. Please use a different email address.';
      } else if (error.message.includes('Data too long for column')) {
        userMessage = 'One of your entries is too long. Please shorten your text and try again.';
      } else if (error.message.includes('Out of range value')) {
        if (error.message.includes('year_of_passing')) {
          userMessage = 'Please enter a valid graduation year (between 1950 and 2035).';
        } else {
          userMessage = 'One of your numeric values is out of range. Please check your entries.';
        }
      } else if (error.message.includes('required')) {
        userMessage = error.message;
      }
    }
    
    res.status(400).json({
      success: false,
      error: 'Form submission failed',
      message: userMessage,
      details: userMessage
    });
  }
});

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