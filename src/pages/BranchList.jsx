import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Monitor, 
  Cog, 
  Zap, 
  Building, 
  Radio,
  Code,
  FileText,
  ArrowLeft
} from 'lucide-react';

const branchIcons = {
  'Computer Science': Monitor,
  'Mechanical Engineering': Cog,
  'Electrical Engineering': Zap,
  'Civil Engineering': Building,
  'Electronics & Communication': Radio,
  'Information Technology': Code
};

const branchColors = {
  'Computer Science': 'from-blue-400 to-blue-600',
  'Mechanical Engineering': 'from-red-400 to-red-600',
  'Electrical Engineering': 'from-amber-400 to-amber-600',
  'Civil Engineering': 'from-green-400 to-green-600',
  'Electronics & Communication': 'from-purple-400 to-purple-600',
  'Information Technology': 'from-teal-400 to-teal-600'
};

const BranchList = () => {
  const { courseId } = useParams();
  const [branches, setBranches] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBranches: 0, totalPapers: 0 });

  useEffect(() => {
    fetchBranches();
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setCourse(data.data);
    } catch (error) {
      toast.error('Failed to fetch course details');
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}/branches`);
      setBranches(data.data);
      
      const totalPapers = data.data.reduce((sum, branch) => sum + (branch.totalPapers || 0), 0);
      setStats({
        totalBranches: data.data.length,
        totalPapers
      });
    } catch (error) {
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
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
          <Link
            to="/"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Courses
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Branch by Course
          </h1>
          <p className="text-gray-300 text-lg">
            {course && `${course.name} - `}Manage and access all course papers by branch
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-xl">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Branches</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBranches}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Papers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPapers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {branches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No branches available for this course</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => {
              const Icon = branchIcons[branch.name] || Monitor;
              const colorClass = branchColors[branch.name] || 'from-blue-400 to-blue-600';

              return (
                <Link
                  key={branch._id}
                  to={`/branch/${branch._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-4xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden h-full">
                    <div className={`h-2 bg-gradient-to-r ${colorClass}`}></div>
                    <div className="p-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">Paper Code: {branch.code}</p>
                      
                      {branch.description && (
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{branch.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{branch.totalPapers || 0} Papers</span>
                        </div>
                        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200">
                          View Papers
                        </button>
                        
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchList;
