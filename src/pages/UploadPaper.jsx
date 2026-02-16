import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText } from 'lucide-react';

const UploadPaper = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    papercode: '',
    courseId: '',
    branchId: '',
    subject: '',
    years: new Date().getFullYear(),
    semester: 1,
    paperfileimage: null,
    solvepaperfile: null,
    uploadedBy: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      fetchBranches(formData.courseId);
    }
  }, [formData.courseId]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchBranches = async (courseId) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/branches`);
      setBranches(data.data);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files && files.length > 0 ? files[0] : null;
      console.log(`Selected ${name}:`, file); // Debug log
      setFormData({ ...formData, [name]: file });
      return;
    }
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.paperfileimage) {
      toast.error('Please select a file to upload');
      setLoading(false);
      return;
    }

    console.log("Form data before submit:", formData);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('paperCode', formData.papercode);
      payload.append('course', formData.courseId);
      if (formData.branchId) {
        payload.append('branch', formData.branchId);
      }
      payload.append('subject', formData.subject);
      payload.append('year', formData.years);
      payload.append('semester', formData.semester);
      payload.append('uploadedBy', formData.uploadedBy);

      // Ensure paper file is appended correctly
      if (formData.paperfileimage) {
        payload.append('paperFile', formData.paperfileimage);
        console.log('Paper file being uploaded:', formData.paperfileimage.name);
      }

      // Append solve PDF if provided (optional) - FIXED: This should work now
      if (formData.solvepaperfile) {
        payload.append('solvePaperFile', formData.solvepaperfile);
        console.log('Solve PDF being uploaded:', formData.solvepaperfile.name);
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let pair of payload.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      const response = await api.post('/papers', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Paper uploaded successfully');
      // navigate('/profile');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || error.response?.data?.errors || 'Failed to upload paper');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* <Navbar /> */}

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-3xl font-bold text-white mb-4">Upload Paper</h1>
          <p className="text-gray-300 text-lg">Share your knowledge and earn coins!</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="bg-white rounded-2xl shadow-lg px-5">
          <h2 className="text-xl font-bold text-gray-900">Paper Information</h2>
          <p className="text-gray-600 text-sm">Fill in the details to upload your paper</p>
          <div className="flex items-center mt-3 mb-6">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-3 rounded-xl mr-4">
              <Upload className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uploaded By
              </label>
              <input
                type="text"
                name="uploadedBy"
                value={formData.uploadedBy}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Your name or username"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="e.g., Data Structures Mid Term"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Code *
                </label>
                <input
                  type="text"
                  name="papercode"
                  required
                  value={formData.papercode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="e.g., BTH-CS-266"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  name="courseId"
                  required
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name || c.title || `Course ${c._id || c.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name || b.title || `Branch ${b._id || b.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., Data Structures and Algorithms"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="years"
                  required
                  min="2000"
                  max="2099"
                  value={formData.years}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* paper file */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Paper File *
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="paperfileimage"
                  required
                  onChange={handleChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                />
                {formData.paperfileimage && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formData.paperfileimage.name}
                  </p>
                )}
              </div>
            </div>
            {/* solve pdf file */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Solve PDF (Optional)
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="solvepaperfile"
                  onChange={handleChange}
                  accept=".pdf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                />
                {formData.solvepaperfile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formData.solvepaperfile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Note:</p>
                  <p>
                    Your paper will be reviewed by admin before being published. You'll earn 10 coins once approved!
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Uploading...' : 'Upload Paper'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPaper;