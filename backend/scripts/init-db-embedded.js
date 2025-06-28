import mysql from 'mysql2/promise';

// Database initialization script with embedded SQL (no file dependencies)
async function initializeDatabase() {
  console.log('🔧 Initializing database...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Execute each table creation separately to avoid SQL syntax issues
    console.log('📋 Creating Candidates table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Candidates (
        candidate_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other') NOT NULL,
        mobile_number VARCHAR(15) NOT NULL,
        alternate_contact_number VARCHAR(15),
        email VARCHAR(255) NOT NULL UNIQUE,
        current_city VARCHAR(100) NOT NULL,
        home_town VARCHAR(100) NOT NULL,
        willing_to_relocate BOOLEAN DEFAULT FALSE,
        preferred_city TEXT,
        highest_qualification VARCHAR(100) NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        college_university VARCHAR(255) NOT NULL,
        affiliated_university VARCHAR(255),
        year_of_passing YEAR NOT NULL,
        aggregate_marks DECIMAL(5,2),
        all_semesters_cleared BOOLEAN DEFAULT FALSE,
        internship_project_experience BOOLEAN DEFAULT FALSE,
        project_description TEXT,
        linkedin_link VARCHAR(255),
        github_link VARCHAR(255),
        preferred_role VARCHAR(100) NOT NULL,
        immediate_joining VARCHAR(50) NOT NULL,
        open_to_shifts BOOLEAN DEFAULT FALSE,
        expected_ctc DECIMAL(10,2),
        opportunity_source VARCHAR(100),
        available_for_online_tests BOOLEAN DEFAULT FALSE,
        has_laptop_internet BOOLEAN DEFAULT FALSE,
        resume_path VARCHAR(500),
        academic_docs_path VARCHAR(500),
        aadhar_number VARCHAR(12),
        pan_no VARCHAR(10),
        passport_available BOOLEAN DEFAULT FALSE,
        certificate_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_mobile (mobile_number),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('📋 Creating Candidate_skills table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Candidate_skills (
        skill_id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        skill_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE,
        INDEX idx_candidate_id (candidate_id),
        INDEX idx_skill_name (skill_name)
      )
    `);

    console.log('📋 Creating candidate_preferred_job_location table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS candidate_preferred_job_location (
        location_id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        job_location VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE,
        INDEX idx_candidate_id (candidate_id),
        INDEX idx_job_location (job_location)
      )
    `);

    console.log('📋 Creating candidate_languages_known table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS candidate_languages_known (
        language_id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id INT NOT NULL,
        language_name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE,
        INDEX idx_candidate_id (candidate_id),
        INDEX idx_language_name (language_name)
      )
    `);

    console.log('✅ All database tables created successfully!');
    
    // Verify tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables created:', tables.map(t => Object.values(t)[0]));
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase; 