import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Eye, Calendar, User, FileText } from 'lucide-react';

const PaperDetail = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaper();
  }, [paperId]);

  const fetchPaper = async () => {
    try {
      const { data } = await api.get(`/papers/${paperId}`);
      setPaper(data.data);
      localStorage.setItem('currentPaper', data.data.paperFile.url); // Store paper details in localStorage
      console.log(data.data.paperFile.url);
    } catch (error) {
      toast.error('Failed to fetch paper details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // await api.put(`/papers/${paperId}/download`);
      // toast.success('Download started!');
      // window.open(paper.paperFile.url, '_blank');
      navigate('/solvepaper')
    } catch (error) {
      toast.error('Failed to download paper');
    }
  };

  const handleViewPaper = () => {
    navigate('/paperview')
    // window.open(paper.paperFile.url, '_blank');
  };

  const handleViewSolution = () => {
    if (paper.solutionFile) {
      window.open(paper.solutionFile, '_blank');
    } else {
      toast.error('Solution not available');
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

  if (!paper) {
    return (
      <>
        {/* <Navbar /> */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Paper not found</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* <Navbar /> */}

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{paper.name}</h1>
          <p className="text-gray-300 text-lg">Paper Code: {paper.paperCode}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Paper Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-semibold text-gray-900">{paper.subject}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-semibold text-gray-900">{paper.year}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Semester:</span>
                  <span className="font-semibold text-gray-900">{paper.semester}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Branch:</span>
                  <span className="font-semibold text-gray-900">{paper.branch?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Views:
                  </span>
                  <span className="font-semibold text-gray-900">{paper.views}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Downloads:
                  </span>
                  <span className="font-semibold text-gray-900">{paper.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Uploaded By:
                  </span>
                  <span className="font-semibold text-gray-900">{paper.uploadedBy?.name}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleViewPaper}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  View Paper
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  {/* <Download className="h-5 w-5 mr-2" /> */}
                  Solution Paper
                </button>
                {paper.solutionFile && (
                  <button
                    onClick={handleViewSolution}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    View Solution
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetail;
