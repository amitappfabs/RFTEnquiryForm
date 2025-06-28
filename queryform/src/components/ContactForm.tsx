import React, { useState, useEffect } from 'react';
import { Send, User, Mail, Phone, MessageSquare, MapPin, Building, Calendar, FileText, CheckCircle, ChevronLeft, ChevronRight, Upload, GraduationCap, Briefcase, Globe, Layers, ListChecks, ClipboardCheck, FilePlus } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, API_CONFIG } from '../config/api';

interface ContactFormProps {
  user: { name: string; email: string } | null;
}

const initialFormData = {
  // 1. Personal Details
  fullName: '',
  dob: '',
  gender: '',
  mobile: '',
  altMobile: '',
  email: '',
  // 2. Location Details
  currentCity: '',
  homeTown: '',
  willingToRelocate: '',
  preferredCities: '',
  // 3. Education
  qualification: '',
  course: '',
  college: '',
  affiliatedUniv: '',
  graduationYear: '',
  marks: '',
  allSemCleared: '',
  // 4. Skills
  techSkills: [] as string[],
  certifications: '',
  // 5. Experience
  hasInternship: '',
  projectDesc: '',
  portfolio: '',
  // 6. Preferences
  preferredRole: '',
  preferredLocations: [] as string[],
  joining: '',
  shifts: '',
  expectedCTC: '',
  // 7. General
  source: '',
  onlineTest: '',
  laptop: '',
  // 8. Documents
  resume: null as File | null,
  academics: null as File | null,
  // Optional
  languages: '',
  aadhar: '',
  pan: '',
  passport: '',
  // 9. Declaration
  agree: false,
};

const steps = [
  'Personal Details',
  'Location Details',
  'Education',
  'Skills',
  'Experience',
  'Preferences',
  'General',
  'Documents',
  'Declaration',
];

const techSkillOptions = [
  'Python', 'Java', 'C++', 'JavaScript', 'Web Development', 'SQL/Databases',
  'Data Structures & Algorithms', 'Cloud/DevOps', 'Machine Learning/AI', 'Cybersecurity', 'Others'
];
const qualificationOptions = [
  'Diploma', 'B.Tech', 'B.Sc', 'B.Com', 'BA', 'M.Tech', 'M.Sc', 'MBA', 'Others'
];
const genderOptions = ['Male', 'Female', 'Other'];
const yesNoOptions = ['Yes', 'No'];
const shiftOptions = ['Yes', 'No'];
const joiningOptions = ['Yes', 'No', 'Notice Period'];
const locationOptions = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Other'
];

const ContactForm: React.FC<ContactFormProps> = ({ user }) => {
  const [formData, setFormData] = useState<
    typeof initialFormData & { [key: string]: any }
  >({
    ...initialFormData,
    fullName: user?.name || '',
    email: user?.email || '',
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load form data from localStorage on mount or when user changes
  useEffect(() => {
    let loaded = { ...initialFormData };
    if (user && user.email) {
      const saved = localStorage.getItem(`formData_${user.email}`);
      if (saved) {
        loaded = { ...loaded, ...JSON.parse(saved) };
      }
      loaded.fullName = user.name;
      loaded.email = user.email;
    }
    setFormData(loaded);
  }, [user]);

  // Auto-save form data to localStorage on every change (if user is signed in)
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`formData_${user.email}`,
        JSON.stringify({ ...formData, resume: undefined, academics: undefined }) // don't store files
      );
    }
  }, [formData, user]);

  // --- Validation per step ---
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.dob) newErrors.dob = 'Date of Birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.mobile.trim()) newErrors.mobile = 'Mobile Number is required';
      if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Enter valid 10-digit number';
      if (formData.altMobile && !/^\d{10}$/.test(formData.altMobile)) newErrors.altMobile = 'Enter valid 10-digit number';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    }
    if (step === 1) {
      if (!formData.currentCity.trim()) newErrors.currentCity = 'Current City is required';
      if (!formData.homeTown.trim()) newErrors.homeTown = 'Home Town is required';
      if (!formData.willingToRelocate) newErrors.willingToRelocate = 'This field is required';
      if (formData.willingToRelocate === 'Yes' && !formData.preferredCities.trim()) newErrors.preferredCities = 'Preferred Cities required';
    }
    if (step === 2) {
      if (!formData.qualification) newErrors.qualification = 'Qualification is required';
      if (!formData.course.trim()) newErrors.course = 'Course Name is required';
      if (!formData.college.trim()) newErrors.college = 'College/University is required';
      if (!formData.graduationYear.trim()) {
        newErrors.graduationYear = 'Year of Passing is required';
      } else {
        const year = parseInt(formData.graduationYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1950 || year > currentYear + 10) {
          newErrors.graduationYear = `Year must be between 1950 and ${currentYear + 10}`;
        }
      }
      if (!formData.marks.trim()) newErrors.marks = 'Aggregate Marks/CGPA is required';
      if (!formData.allSemCleared) newErrors.allSemCleared = 'This field is required';
    }
    if (step === 3) {
      if (formData.techSkills.length === 0) newErrors.techSkills = 'Select at least one skill';
    }
    if (step === 4) {
      if (!formData.hasInternship) newErrors.hasInternship = 'This field is required';
      if (formData.hasInternship === 'Yes' && !formData.projectDesc.trim()) newErrors.projectDesc = 'Description required';
    }
    if (step === 5) {
      if (!formData.preferredRole.trim()) newErrors.preferredRole = 'Preferred Role is required';
      if (formData.preferredLocations.length === 0) newErrors.preferredLocations = 'Select at least one location';
      if (!formData.joining) newErrors.joining = 'This field is required';
      if (!formData.shifts) newErrors.shifts = 'This field is required';
    }
    if (step === 6) {
      if (!formData.source.trim()) newErrors.source = 'This field is required';
      if (!formData.onlineTest) newErrors.onlineTest = 'This field is required';
      if (!formData.laptop) newErrors.laptop = 'This field is required';
      // Aadhar validation (if provided)
      if (formData.aadhar) {
        if (!/^\d{12}$/.test(formData.aadhar)) newErrors.aadhar = 'Aadhar must be 12 digits';
      }
      // PAN validation (if provided)
      if (formData.pan) {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) newErrors.pan = 'PAN must be 10 characters (e.g., ABCDE1234F)';
      }
      // Passport validation (if provided)
      if (formData.passport) {
        if (!/^[A-Z0-9]{8,9}$/i.test(formData.passport)) newErrors.passport = 'Passport should be 8-9 alphanumeric characters';
      }
    }
    if (step === 7) {
      if (!formData.resume) newErrors.resume = 'Resume is required';
    }
    if (step === 8) {
      if (!formData.agree) newErrors.agree = 'You must agree to the declaration';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handlers ---
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(s => s + 1);
      setErrorMessage(null); // Clear any error when moving to next step
    }
  };
  const handleBack = () => {
    setStep(s => s - 1);
    setErrorMessage(null); // Clear any error when going back
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);
    setErrorMessage(null); // Clear any previous error messages
    
    try {
      // Prepare form data for API submission
      const formDataToSend = new FormData();
      
      // Map the form data to match backend API structure
      const mappedData = {
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        mobile: formData.mobile,
        altMobile: formData.altMobile || '',
        email: formData.email,
        currentCity: formData.currentCity,
        homeTown: formData.homeTown,
        willingToRelocate: formData.willingToRelocate,
        preferredLocations: formData.preferredLocations.length > 0 
          ? formData.preferredLocations 
          : (formData.preferredCities ? formData.preferredCities.split(',').map(s => s.trim()) : []),
        qualification: formData.qualification,
        course: formData.course,
        college: formData.college,
        affiliatedUniv: formData.affiliatedUniv || '',
        graduationYear: formData.graduationYear,
        marks: formData.marks,
        allSemCleared: formData.allSemCleared,
        techSkills: formData.techSkills,
        otherTechSkills: '', // Can be added to form if needed
        certifications: formData.certifications || '',
        hasInternship: formData.hasInternship,
        projectDesc: formData.projectDesc || '',
        linkedin: '', // Can be added to form if needed
        github: formData.portfolio || '', // Using portfolio field as github
        preferredRole: formData.preferredRole,
        joining: formData.joining,
        shifts: formData.shifts,
        expectedCTC: formData.expectedCTC || '',
        source: formData.source,
        onlineTest: formData.onlineTest,
        laptop: formData.laptop,
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()) : [],
        aadhar: formData.aadhar || '',
        pan: formData.pan || '',
        passport: formData.passport || ''
      };

      // Add form data as JSON string
      formDataToSend.append('data', JSON.stringify(mappedData));
      
      // Add files
      if (formData.resume) {
        formDataToSend.append('pdf', formData.resume);
      }

      // Submit to backend API
      const response = await axios.post(getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD), formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSubmitted(true);
        setFormData({ ...initialFormData, fullName: user?.name || '', email: user?.email || '' });
        setStep(0);
        // Clear saved form data for this user
        if (user && user.email) {
          localStorage.removeItem(`formData_${user.email}`);
        }
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // Extract specific error message from backend response
      let errorMessage = 'Failed to submit form. Please try again.';
      
      if (error.response && error.response.data) {
        // If backend sent specific error details
        if (error.response.data.details) {
          errorMessage = error.response.data.details;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set error message to display in UI
      setErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="text-green-600" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Form Submitted Successfully!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for your enquiry. We will get back to you soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Fill Another Form
        </button>
      </div>
    );
  }

  // --- Step Components ---
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><User className="mr-2" />Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => handleInputChange('fullName', e.target.value)}
                  className="input"
                  placeholder="As per Aadhaar or ID"
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={e => handleInputChange('dob', e.target.value)}
                  className="input"
                />
                {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={e => handleInputChange('gender', e.target.value)}
                  className="input"
                >
                  <option value="">Select</option>
                  {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Mobile Number *</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    handleInputChange('mobile', value);
                  }}
                  onKeyDown={e => {
                    if (formData.mobile.length >= 10 && e.key !== 'Backspace' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                  className={`input ${formData.mobile.length === 10 ? 'border-yellow-500 focus:ring-yellow-500' : ''}`}
                  placeholder="Primary Mobile"
                  maxLength={10}
                />
                {formData.mobile.length === 10 && (
                  <p className="text-yellow-500 text-sm mt-1" aria-live="polite">Maximum 10 digits allowed</p>
                )}
                {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Alternate Contact Number</label>
                <input
                  type="tel"
                  value={formData.altMobile}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    handleInputChange('altMobile', value);
                  }}
                  onKeyDown={e => {
                    if (formData.altMobile.length >= 10 && e.key !== 'Backspace' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                  className={`input ${formData.altMobile.length === 10 ? 'border-yellow-500 focus:ring-yellow-500' : ''}`}
                  placeholder="Optional"
                  maxLength={10}
                />
                {formData.altMobile.length === 10 && (
                  <p className="text-yellow-500 text-sm mt-1" aria-live="polite">Maximum 10 digits allowed</p>
                )}
                {errors.altMobile && <p className="text-red-500 text-sm">{errors.altMobile}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="input"
                  placeholder="Official / Personal"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><MapPin className="mr-2" />Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">Current City *</label>
                <input type="text" value={formData.currentCity} onChange={e => handleInputChange('currentCity', e.target.value)} className="input" />
                {errors.currentCity && <p className="text-red-500 text-sm">{errors.currentCity}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Home Town / Permanent Address *</label>
                <input type="text" value={formData.homeTown} onChange={e => handleInputChange('homeTown', e.target.value)} className="input" />
                {errors.homeTown && <p className="text-red-500 text-sm">{errors.homeTown}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Willing to Relocate? *</label>
                <select value={formData.willingToRelocate} onChange={e => handleInputChange('willingToRelocate', e.target.value)} className="input">
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Preferred Cities">Preferred Cities</option>
                </select>
                {errors.willingToRelocate && <p className="text-red-500 text-sm">{errors.willingToRelocate}</p>}
              </div>
              {formData.willingToRelocate === 'Yes' || formData.willingToRelocate === 'Preferred Cities' ? (
                <div>
                  <label className="block mb-1 font-medium">Preferred Cities</label>
                  <input type="text" value={formData.preferredCities} onChange={e => handleInputChange('preferredCities', e.target.value)} className="input" placeholder="Comma separated" />
                  {errors.preferredCities && <p className="text-red-500 text-sm">{errors.preferredCities}</p>}
                </div>
              ) : null}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><GraduationCap className="mr-2" />Educational Background</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">Highest Qualification *</label>
                <select value={formData.qualification} onChange={e => handleInputChange('qualification', e.target.value)} className="input">
                  <option value="">Select</option>
                  {qualificationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.qualification && <p className="text-red-500 text-sm">{errors.qualification}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Course Name & Specialization *</label>
                <input type="text" value={formData.course} onChange={e => handleInputChange('course', e.target.value)} className="input" />
                {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">College/University Name *</label>
                <input type="text" value={formData.college} onChange={e => handleInputChange('college', e.target.value)} className="input" />
                {errors.college && <p className="text-red-500 text-sm">{errors.college}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Affiliated University (if applicable)</label>
                <input type="text" value={formData.affiliatedUniv} onChange={e => handleInputChange('affiliatedUniv', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Year of Passing / Expected Graduation *</label>
                <input 
                  type="number" 
                  value={formData.graduationYear} 
                  onChange={e => handleInputChange('graduationYear', e.target.value)} 
                  className="input" 
                  placeholder="YYYY" 
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  step="1"
                />
                {errors.graduationYear && <p className="text-red-500 text-sm">{errors.graduationYear}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Aggregate Marks / CGPA (Till Now) *</label>
                <input type="text" value={formData.marks} onChange={e => handleInputChange('marks', e.target.value)} className="input" />
                {errors.marks && <p className="text-red-500 text-sm">{errors.marks}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Are all semesters cleared? *</label>
                <select value={formData.allSemCleared} onChange={e => handleInputChange('allSemCleared', e.target.value)} className="input">
                  <option value="">Select</option>
                  {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.allSemCleared && <p className="text-red-500 text-sm">{errors.allSemCleared}</p>}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Layers className="mr-2" />Technical / Domain Skills</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Which technical skills do you possess? *</label>
              <div className="flex flex-wrap gap-3">
                {techSkillOptions.map(skill => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.techSkills.includes(skill)}
                      onChange={() => handleCheckboxChange('techSkills', skill)}
                      className="accent-blue-600"
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
              {errors.techSkills && <p className="text-red-500 text-sm">{errors.techSkills}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Any certification courses completed? (Optional)</label>
              <input type="text" value={formData.certifications} onChange={e => handleInputChange('certifications', e.target.value)} className="input" />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Briefcase className="mr-2" />Internship or Project Experience</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Have you done any internship or major project? *</label>
              <select value={formData.hasInternship} onChange={e => handleInputChange('hasInternship', e.target.value)} className="input">
                <option value="">Select</option>
                {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {errors.hasInternship && <p className="text-red-500 text-sm">{errors.hasInternship}</p>}
            </div>
            {formData.hasInternship === 'Yes' && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Brief Description of Project / Internship *</label>
                <textarea value={formData.projectDesc} onChange={e => handleInputChange('projectDesc', e.target.value)} className="input" rows={4} />
                {errors.projectDesc && <p className="text-red-500 text-sm">{errors.projectDesc}</p>}
              </div>
            )}
            <div>
              <label className="block mb-1 font-medium">Link to Portfolio / GitHub / LinkedIn (Optional)</label>
              <input type="url" value={formData.portfolio} onChange={e => handleInputChange('portfolio', e.target.value)} className="input" />
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><ClipboardCheck className="mr-2" />Job Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">Preferred Role / Function Area *</label>
                <input type="text" value={formData.preferredRole} onChange={e => handleInputChange('preferredRole', e.target.value)} className="input" placeholder="e.g., Software Developer" />
                {errors.preferredRole && <p className="text-red-500 text-sm">{errors.preferredRole}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Preferred Job Location(s) *</label>
                <div className="flex flex-wrap gap-3">
                  {locationOptions.map(loc => (
                    <label key={loc} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.preferredLocations.includes(loc)}
                        onChange={() => handleCheckboxChange('preferredLocations', loc)}
                        className="accent-blue-600"
                      />
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>
                {errors.preferredLocations && <p className="text-red-500 text-sm">{errors.preferredLocations}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Immediate Joining Availability? *</label>
                <select value={formData.joining} onChange={e => handleInputChange('joining', e.target.value)} className="input">
                  <option value="">Select</option>
                  {joiningOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.joining && <p className="text-red-500 text-sm">{errors.joining}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Open to work in rotational/night shifts? *</label>
                <select value={formData.shifts} onChange={e => handleInputChange('shifts', e.target.value)} className="input">
                  <option value="">Select</option>
                  {shiftOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.shifts && <p className="text-red-500 text-sm">{errors.shifts}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Expected CTC (if applicable)</label>
                <input type="text" value={formData.expectedCTC} onChange={e => handleInputChange('expectedCTC', e.target.value)} className="input" />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><ListChecks className="mr-2" />General Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium">How did you hear about this opportunity? *</label>
                <input type="text" value={formData.source} onChange={e => handleInputChange('source', e.target.value)} className="input" />
                {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Are you available for online tests and interviews? *</label>
                <select value={formData.onlineTest} onChange={e => handleInputChange('onlineTest', e.target.value)} className="input">
                  <option value="">Select</option>
                  {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.onlineTest && <p className="text-red-500 text-sm">{errors.onlineTest}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Do you have a working laptop and stable internet connection? *</label>
                <select value={formData.laptop} onChange={e => handleInputChange('laptop', e.target.value)} className="input">
                  <option value="">Select</option>
                  {yesNoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {errors.laptop && <p className="text-red-500 text-sm">{errors.laptop}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Languages Known (Optional)</label>
                <input type="text" value={formData.languages} onChange={e => handleInputChange('languages', e.target.value)} className="input" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Aadhar Number (Optional)</label>
                <input
                  type="text"
                  value={formData.aadhar}
                  onChange={e => handleInputChange('aadhar', e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                  className="input"
                  placeholder="12-digit Aadhar"
                  maxLength={12}
                />
                {errors.aadhar && <p className="text-red-500 text-sm">{errors.aadhar}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">PAN Number (Optional)</label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={e => handleInputChange('pan', e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10))}
                  className="input"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.pan && <p className="text-red-500 text-sm">{errors.pan}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Passport Number (Optional)</label>
                <input
                  type="text"
                  value={formData.passport}
                  onChange={e => handleInputChange('passport', e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 9))}
                  className="input"
                  placeholder="8-9 alphanumeric"
                  maxLength={9}
                />
                {errors.passport && <p className="text-red-500 text-sm">{errors.passport}</p>}
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><FilePlus className="mr-2" />Resume & Documents</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Upload Resume (PDF) *</label>
              <input type="file" accept="application/pdf" onChange={e => handleFileChange('resume', e.target.files ? e.target.files[0] : null)} className="input" />
              {errors.resume && <p className="text-red-500 text-sm">{errors.resume}</p>}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Upload Academic Documents (Optional, PDF)</label>
              <input type="file" accept="application/pdf" onChange={e => handleFileChange('academics', e.target.files ? e.target.files[0] : null)} className="input" />
            </div>
          </div>
        );
      case 8:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center"><CheckCircle className="mr-2" />Declaration</h2>
            <div className="mb-4">
              <p className="mb-2">“I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that any misrepresentation may lead to disqualification.”</p>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.agree} onChange={e => handleInputChange('agree', e.target.checked)} className="accent-blue-600" />
                <span>I agree to be contacted via phone, WhatsApp, and email regarding this hiring process.</span>
              </label>
              {errors.agree && <p className="text-red-500 text-sm">{errors.agree}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">Enquiry Form</h2>
          <span className="text-gray-500">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="flex space-x-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          ))}
        </div>
      </div>
      
      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Form Submission Error</h3>
              <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {renderStep()}
        <div className="flex justify-between mt-8">
          {step > 0 && (
            <button type="button" onClick={handleBack} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              <ChevronLeft className="mr-2" /> Back
            </button>
          )}
          <div className="flex-1"></div>
          {step < steps.length - 1 && (
            <button type="button" onClick={handleNext} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors ml-auto">
              Next <ChevronRight className="ml-2" />
            </button>
          )}
          {step === steps.length - 1 && (
            <button type="submit" disabled={isSubmitting} className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors ml-auto disabled:opacity-50">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2" /> Submit
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContactForm;