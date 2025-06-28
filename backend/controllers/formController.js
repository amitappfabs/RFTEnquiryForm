import cloudinary from '../config/cloudinary.js';
import { query } from '../config/db.js';

const uploadPDF = async (req, res, next) => {
  try {
    if (!req.cloudinaryResults || !req.cloudinaryResults.resume) {
      return res.status(400).json({ error: 'Resume file upload failed' });
    }

    // Process form data
    const formData = JSON.parse(req.body.data);

    // Validate numeric fields
    const validateNumericField = (value, fieldName, maxValue, precision) => {
      if (!value || value.trim() === '') return null; // Allow empty values to be null
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new Error(`Invalid ${fieldName}: must be a valid number`);
      }
      if (num > maxValue) {
        throw new Error(`${fieldName} exceeds maximum allowed value (${maxValue})`);
      }
      // Round to specified precision (e.g., 2 decimal places)
      return Number(num.toFixed(precision));
    };

    // Validate aggregate_marks (e.g., max 100.00 for grades/CGPA)
    const marks = validateNumericField(formData.marks, 'Aggregate Marks/CGPA', 100, 2);

    // Validate expected_ctc (e.g., max 9999999.99 for CTC in lakhs)
    const ctc = validateNumericField(formData.expectedCTC, 'Expected CTC', 9999999.99, 2);

    // Begin transaction
    await query('START TRANSACTION');

    // Insert into Candidates table
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
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `;

    const candidateValues = [
      formData.fullName,
      formData.dob,
      formData.gender.toLowerCase(),
      formData.mobile,
      formData.altMobile || null,
      formData.email,
      formData.currentCity,
      formData.homeTown,
      formData.willingToRelocate === 'Yes',
      formData.preferredLocations.join(', '),
      formData.qualification,
      formData.course,
      formData.college,
      formData.affiliatedUniv || null,
      formData.graduationYear,
      marks, // Use validated marks
      formData.allSemCleared === 'Yes',
      formData.hasInternship === 'Yes',
      formData.projectDesc || null,
      formData.linkedin || null,
      formData.github || null,
      formData.preferredRole,
      formData.joining,
      formData.shifts === 'Yes',
      ctc, // Use validated CTC
      formData.source,
      formData.onlineTest === 'Yes',
      formData.laptop === 'Yes',
      req.cloudinaryResults.resume.secure_url,
      req.cloudinaryResults.academics ? req.cloudinaryResults.academics.secure_url : null,
      formData.aadhar || null,
      formData.pan || null,
      !!formData.passport,
      formData.certifications || null
    ];

    const candidateResult = await query(candidateQuery, candidateValues);
    const candidateId = candidateResult.insertId;

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

    // Commit transaction
    await query('COMMIT');

    res.status(201).json({
      success: true,
      candidateId,
      resumeUrl: req.cloudinaryResults.resume.secure_url
    });

  } catch (error) {
    // Rollback transaction on error
    await query('ROLLBACK');
    console.error('Error submitting form:', error);

    // Delete uploaded files if transaction failed
    if (req.cloudinaryResults && req.cloudinaryResults.resume) {
      try {
        await cloudinary.uploader.destroy(req.cloudinaryResults.resume.public_id);
      } catch (e) {
        console.error('Error cleaning up uploaded file:', e);
      }
    }

    res.status(500).json({
      error: 'Failed to submit form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Controller to fetch candidate information by candidate_id
const getCandidateInfo = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Validate candidateId
    if (!candidateId || isNaN(parseInt(candidateId))) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    // Query to fetch candidate details from Candidates table
    const candidateQuery = `
      SELECT 
        candidate_id,
        full_name AS fullName,
        date_of_birth AS dob,
        gender,
        mobile_number AS mobile,
        alternate_contact_number AS altMobile,
        email,
        current_city AS currentCity,
        home_town AS homeTown,
        willing_to_relocate AS willingToRelocate,
        preferred_city AS preferredLocations,
        highest_qualification AS qualification,
        course_name AS course,
        college_university AS college,
        affiliated_university AS affiliatedUniv,
        year_of_passing AS graduationYear,
        aggregate_marks AS marks,
        all_semesters_cleared AS allSemCleared,
        internship_project_experience AS hasInternship,
        project_description AS projectDesc,
        linkedin_link AS linkedin,
        github_link AS github,
        preferred_role AS preferredRole,
        immediate_joining AS joining,
        open_to_shifts AS shifts,
        expected_ctc AS expectedCTC,
        opportunity_source AS source,
        available_for_online_tests AS onlineTest,
        has_laptop_internet AS laptop,
        resume_path AS resume,
        academic_docs_path AS academics,
        aadhar_number AS aadhar,
        pan_no AS pan,
        passport_available AS passport,
        certificate_name AS certifications
      FROM Candidates
      WHERE candidate_id = $1
    `;

    const candidateResult = await query(candidateQuery, [candidateId]);

    // Check if candidate exists
    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = candidateResult.rows[0];

    // Fetch skills
    const skillsQuery = `
      SELECT skill_name
      FROM Candidate_skills
      WHERE candidate_id = $1
    `;
    const skillsResult = await query(skillsQuery, [candidateId]);
    const techSkills = skillsResult.rows.map(row => row.skill_name);

    // Fetch preferred job locations
    const locationsQuery = `
      SELECT job_location
      FROM candidate_preferred_job_location
      WHERE candidate_id = $1
    `;
    const locationsResult = await query(locationsQuery, [candidateId]);
    const preferredLocations = locationsResult.rows.map(row => row.job_location);

    // Fetch languages known
    const languagesQuery = `
      SELECT language_name
      FROM candidate_languages_known
      WHERE candidate_id = $1
    `;
    const languagesResult = await query(languagesQuery, [candidateId]);
    const languages = languagesResult.rows.map(row => row.language_name);

    // Structure the response to match frontend formData
    const response = {
      success: true,
      data: {
        ...candidate,
        techSkills,
        otherTechSkills: techSkills.filter(skill => ![
          'Python', 'Java', 'C++', 'JavaScript', 'Web Development', 
          'SQL/Databases', 'Data Structures & Algorithms', 
          'Cloud/DevOps', 'Machine Learning/AI', 'Cybersecurity'
        ].includes(skill)).join(', '),
        techSkills: techSkills.filter(skill => [
          'Python', 'Java', 'C++', 'JavaScript', 'Web Development', 
          'SQL/Databases', 'Data Structures & Algorithms', 
          'Cloud/DevOps', 'Machine Learning/AI', 'Cybersecurity', 'Others'
        ].includes(skill)),
        preferredLocations,
        languages,
        agree: true, // Assuming agreement is implied since data was submitted
      }
    };

    // Remove null/undefined fields for cleaner response
    Object.keys(response.data).forEach(key => {
      if (response.data[key] === null || response.data[key] === undefined) {
        delete response.data[key];
      }
    });

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching candidate info:', error);
    res.status(500).json({
      error: 'Failed to fetch candidate information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// Controller to fetch all candidates' information with optional pagination and filtering
const getAllCandidates = async (req, res) => {
  try {
    // Extract query parameters for pagination and filtering
    const { page = 1, limit = 10, email, fullName } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || parseInt(page) < 1 || parseInt(limit) < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // Build the WHERE clause for filtering
    let whereClauses = [];
    let queryParams = [];
    let paramIndex = 1;

    if (email) {
      whereClauses.push(`email ILIKE $${paramIndex}`);
      queryParams.push(`%${email}%`);
      paramIndex++;
    }

    if (fullName) {
      whereClauses.push(`full_name ILIKE $${paramIndex}`);
      queryParams.push(`%${fullName}%`);
      paramIndex++;
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Query to fetch candidates with pagination
    const candidatesQuery = `
      SELECT 
        candidate_id,
        full_name AS fullName,
        date_of_birth AS dob,
        gender,
        mobile_number AS mobile,
        alternate_contact_number AS altMobile,
        email,
        current_city AS currentCity,
        home_town AS homeTown,
        willing_to_relocate AS willingToRelocate,
        preferred_city AS preferredLocations,
        highest_qualification AS qualification,
        course_name AS course,
        college_university AS college,
        affiliated_university AS affiliatedUniv,
        year_of_passing AS graduationYear,
        aggregate_marks AS marks,
        all_semesters_cleared AS allSemCleared,
        internship_project_experience AS hasInternship,
        project_description AS projectDesc,
        linkedin_link AS linkedin,
        github_link AS github,
        preferred_role AS preferredRole,
        immediate_joining AS joining,
        open_to_shifts AS shifts,
        expected_ctc AS expectedCTC,
        opportunity_source AS source,
        available_for_online_tests AS onlineTest,
        has_laptop_internet AS laptop,
        resume_path AS resume,
        academic_docs_path AS academics,
        aadhar_number AS aadhar,
        pan_no AS pan,
        passport_available AS passport,
        certificate_name AS certifications
      FROM Candidates
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(limit, offset);

    const candidatesResult = await query(candidatesQuery, queryParams);

    // Get total count for pagination metadata
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Candidates
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const totalCandidates = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalCandidates / parseInt(limit));

    // Fetch related data (skills, locations, languages) for each candidate
    const candidates = await Promise.all(
      candidatesResult.rows.map(async (candidate) => {
        // Fetch skills
        const skillsQuery = `
          SELECT skill_name
          FROM Candidate_skills
          WHERE candidate_id = $1
        `;
        const skillsResult = await query(skillsQuery, [candidate.candidate_id]);
        const techSkills = skillsResult.rows.map(row => row.skill_name);

        // Fetch preferred job locations
        const locationsQuery = `
          SELECT job_location
          FROM candidate_preferred_job_location
          WHERE candidate_id = $1
        `;
        const locationsResult = await query(locationsQuery, [candidate.candidate_id]);
        const preferredLocations = locationsResult.rows.map(row => row.job_location);

        // Fetch languages known
        const languagesQuery = `
          SELECT language_name
          FROM candidate_languages_known
          WHERE candidate_id = $1
        `;
        const languagesResult = await query(languagesQuery, [candidate.candidate_id]);
        const languages = languagesResult.rows.map(row => row.language_name);

        // Structure candidate data to match frontend formData
        return {
          ...candidate,
          techSkills: techSkills.filter(skill => [
            'Python', 'Java', 'C++', 'JavaScript', 'Web Development',
            'SQL/Databases', 'Data Structures & Algorithms',
            'Cloud/DevOps', 'Machine Learning/AI', 'Cybersecurity', 'Others'
          ].includes(skill)),
          otherTechSkills: techSkills
            .filter(skill => ![
              'Python', 'Java', 'C++', 'JavaScript', 'Web Development',
              'SQL/Databases', 'Data Structures & Algorithms',
              'Cloud/DevOps', 'Machine Learning/AI', 'Cybersecurity'
            ].includes(skill))
            .join(', '),
          preferredLocations,
          languages,
          agree: true, // Assuming agreement since data was submitted
        };
      })
    );

    // Clean up null/undefined fields
    candidates.forEach(candidate => {
      Object.keys(candidate).forEach(key => {
        if (candidate[key] === null || candidate[key] === undefined) {
          delete candidate[key];
        }
      });
    });

    // Send response with pagination metadata
    res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCandidates,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching all candidates:', error);
    res.status(500).json({
      error: 'Failed to fetch candidates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export { uploadPDF, getCandidateInfo, getAllCandidates};