-- Enquiry Form Database Schema for MySQL
-- This file contains all the table structures needed for the application

CREATE DATABASE IF NOT EXISTS enquiry_form_db;
USE enquiry_form_db;

-- Candidates table - main table for candidate information
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
);

-- Candidate Skills table - for storing technical skills
CREATE TABLE IF NOT EXISTS Candidate_skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_skill_name (skill_name)
);

-- Candidate Preferred Job Locations table
CREATE TABLE IF NOT EXISTS candidate_preferred_job_location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_job_location (job_location)
);

-- Candidate Languages Known table
CREATE TABLE IF NOT EXISTS candidate_languages_known (
    language_id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    language_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES Candidates(candidate_id) ON DELETE CASCADE,
    INDEX idx_candidate_id (candidate_id),
    INDEX idx_language_name (language_name)
);

-- Insert some sample data for testing (optional)
-- INSERT INTO Candidates (
--     full_name, date_of_birth, gender, mobile_number, email, current_city, home_town,
--     willing_to_relocate, highest_qualification, course_name, college_university,
--     year_of_passing, aggregate_marks, all_semesters_cleared, preferred_role, immediate_joining
-- ) VALUES (
--     'John Doe', '1995-05-15', 'male', '9876543210', 'john.doe@example.com', 'Mumbai', 'Delhi',
--     TRUE, 'Bachelor of Technology', 'Computer Science', 'ABC University',
--     2023, 8.5, TRUE, 'Software Developer', 'Yes'
-- ); 