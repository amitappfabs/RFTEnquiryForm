import React, { useState, useEffect } from 'react';
import { User, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, API_CONFIG } from '../config/api';

interface Candidate {
  candidate_id: number;
  fullName: string;
  email: string;
  mobile: string;
  preferredRole: string;
  expectedCTC?: number;
  created_at: string;
  techSkills?: string[];
  otherTechSkills?: string;
  preferredLocations?: string[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCandidates: number;
  limit: number;
}

interface CandidatesListProps {
  onBack: () => void;
}

const CandidatesList: React.FC<CandidatesListProps> = ({ onBack }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCandidates: 0,
    limit: 10
  });
  const [filters, setFilters] = useState({ email: '', fullName: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl(API_CONFIG.ENDPOINTS.CANDIDATES), {
        params: {
          page: pagination.currentPage,
          limit: pagination.limit,
          ...filters
        }
      });
      
      if (response.data.data) {
        setCandidates(response.data.data);
        setPagination(response.data.pagination);
        setError(null);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      setError('Failed to fetch candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [pagination.currentPage, filters]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">All Candidates</h2>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Form
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchCandidates}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Filter by Email</label>
          <input
            type="text"
            value={filters.email}
            onChange={e => handleFilterChange('email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Enter email..."
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Filter by Full Name</label>
          <input
            type="text"
            value={filters.fullName}
            onChange={e => handleFilterChange('fullName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="Enter name..."
          />
        </div>
      </div>

      {/* Candidates List */}
      {candidates.length === 0 ? (
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No candidates found.</p>
          <p className="text-gray-500">Submit the form to see candidates here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {candidates.map(candidate => (
            <div
              key={candidate.candidate_id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <User className="mr-3 text-blue-600" size={24} />
                <h3 className="text-xl font-semibold text-gray-900">{candidate.fullName}</h3>
                <span className="ml-auto text-sm text-gray-500">
                  ID: {candidate.candidate_id}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{candidate.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mobile</p>
                  <p className="text-gray-900">{candidate.mobile}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Preferred Role</p>
                  <p className="text-gray-900">{candidate.preferredRole}</p>
                </div>
                {candidate.expectedCTC && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Expected CTC</p>
                    <p className="text-gray-900">₹{candidate.expectedCTC} LPA</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Applied On</p>
                  <p className="text-gray-900">{new Date(candidate.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {candidate.techSkills && candidate.techSkills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.techSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.otherTechSkills && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {candidate.otherTechSkills}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {candidate.preferredLocations && candidate.preferredLocations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Preferred Locations</p>
                  <p className="text-gray-900">{candidate.preferredLocations.join(', ')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCandidates)} of{' '}
            {pagination.totalCandidates} candidates
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="mr-2" size={16} /> Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="ml-2" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesList; 