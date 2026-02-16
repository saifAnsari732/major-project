import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/global.css';
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  Filter,
  Eye,
  Download,
  Calendar
} from 'lucide-react';

const BranchDetail = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    paperCode: '',
    name: ''
  });

  useEffect(() => {
    fetchBranchDetails();
    fetchPapers();
  }, [branchId]);

  useEffect(() => {
    filterPapers();
  }, [filters, papers]);

  const fetchBranchDetails = async () => {
    try {
      const { data } = await api.get(`/branches/${branchId}`);
      setBranch(data.data);
    } catch (error) {
      toast.error('Failed to fetch branch details');
    }
  };

  const fetchPapers = async () => {
    try {
      const { data } = await api.get(`/branches/${branchId}/papers`);
      setPapers(data.data);
      setFilteredPapers(data.data);
    } catch (error) {
      toast.error('Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  const filterPapers = () => {
    let filtered = papers;

    if (filters.paperCode) {
      filtered = filtered.filter(paper =>
        paper.paperCode.toLowerCase().includes(filters.paperCode.toLowerCase())
      );
    }

    if (filters.name) {
      filtered = filtered.filter(paper =>
        paper.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    setFilteredPapers(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      paperCode: '',
      name: ''
    });
  };

  if (loading) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* <Navbar /> */}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Branches
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {branch?.name}
              </h1>
              <p className="text-gray-300 text-lg">
                Paper Code: {branch?.code} | {branch?.totalPapers || 0} Papers Available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Branch Info */}
        {branch?.description && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Branch</h2>
            <p className="text-gray-600">{branch.description}</p>
            {branch.image && (
              <img 
                src={branch.image} 
                alt={branch.name}
                className="mt-4 rounded-lg w-full h-64 object-cover"
              />
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Filter Papers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Code
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="paperCode"
                  value={filters.paperCode}
                  onChange={handleFilterChange}
                  placeholder="Search by code..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Papers List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Papers</h2>
          
          {filteredPapers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No papers found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPapers.map((paper) => (
                <div
                  key={paper._id}
                  className="border border-gray-600 rounded-xl p-6 shadow-2xl transition-all duration-300 "
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start mb-2">
                        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-lg mr-4">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{paper.name}</h3>
                          <p className="text-gray-950 text-sm mb-2">Paper Code: {paper.paperCode}</p>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Year: {paper.year}
                            </span>
                            <span>•</span>
                            <span>Semester: {paper.semester}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {paper.views} views
                            </span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              {paper.downloads} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <Link
                        to={`/paper/${paper._id}`}
                        className="view-btn"
                      >
                        View Paper
                      </Link>
                      <Link
                        to={`/solvepaper/`}
                        className="solution-btn"
                      >
                       Solution
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchDetail;
