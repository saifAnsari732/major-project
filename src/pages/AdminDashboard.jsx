import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Users, FileText, GraduationCap, Building,
  Check, X, Eye, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingPapers, setPendingPapers] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, papersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/papers/pending')
      ]);
      
      setStats(statsRes.data.data.stats);
      setPendingPapers(papersRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePaper = async (paperId) => {
    try {
      await api.put(`/papers/${paperId}/approve`);
      toast.success('Paper approved successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve paper');
    }
  };

  const handleRejectPaper = async (paperId) => {
    try {
      await api.put(`/papers/${paperId}/reject`);
      toast.success('Paper rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject paper');
    }
  };
// Add course
const addcourse = async () =>{
    try {
      console.log("dd");
     const dd= await api.put(`/courses`);
      toast.success('Paper rejected');
    } catch (error) {
      toast.error('Failed to Add Course');
      
    }
}

// Add branch
const addbranch = async (paperId) =>{

}
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

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-gray-300 text-lg">Manage and monitor platform activity</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-3 ">
        {/* Stats Grid */}
        <div className='font-semibold flex justify-start lg:gap-6 md:gap-9 items-center mb-4'>
          <button onClick={() => navigate('/CreateCourse')} className='ml-4 bg-green-400 py-1.5 px-2 rounded-lg text-black'> Course</button>
          <button onClick={() => navigate('/CreateBranch')} className='ml-4 bg-green-400 py-1.5 px-2 rounded-lg text-black'> Branch </button>
          <button className='ml-4 bg-green-400 py-1.5 px-2 rounded-lg text-black'> Update </button>
          <button className='ml-4 bg-green-400 py-1.5 px-2 rounded-lg text-black '> Delete </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Papers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPapers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-xl">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBranches || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Papers */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pending Papers</h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {pendingPapers.length} Pending
            </span>
          </div>

          {pendingPapers.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No pending papers to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPapers.map((paper) => (
                <div
                  key={paper._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Paper Code: {paper.paperCode}</p>
                        <p>Branch: {paper.branch?.name}</p>
                        <p>Uploaded by: {paper.uploadedBy?.name} ({paper.uploadedBy?.email})</p>
                        <p>Year: {paper.year} | Semester: {paper.semester}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => window.open(paper.paperFile.url, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => handleApprovePaper(paper._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectPaper(paper._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </button>
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

export default AdminDashboard;
