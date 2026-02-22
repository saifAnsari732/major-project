import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText, Image, ChevronLeft, ChevronRight, X, Download, AlertCircle, CheckCircle } from 'lucide-react';

// Courses that navigate directly to their papers page after upload
const DIRECT_TO_PAPERS = ['BCA', 'MCA'];

// FilePreview component with status indicator
const FilePreview = ({ file, label, onRemove, isOptional = true }) => {
  if (!file) return null;
  const isPDF = file.type === 'application/pdf';
  const previewUrl = !isPDF ? URL.createObjectURL(file) : null;
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="relative mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center gap-3">
      {isPDF ? (
        <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg shrink-0">
          <FileText className="h-5 w-5 text-red-500" />
        </div>
      ) : (
        <img src={previewUrl} alt={label} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-300" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{label}</p>
        <p className="text-xs text-gray-500 truncate">
          {file.name} ({fileSizeInMB} MB)
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// PaperViewer with solution display
export const PaperViewer = ({ paper }) => {
  const [activeSide, setActiveSide] = useState('front');
  const [showSolution, setShowSolution] = useState(false);

  const frontUrl = paper?.paperFile?.url;
  const backUrl = paper?.backSideFile?.url;
  const solutionUrl = paper?.solvePaperFile?.url;
  const hasBack = !!backUrl;
  const hasSolution = !!solutionUrl;

  const currentUrl = activeSide === 'front' ? frontUrl : backUrl;
  const isPDF = currentUrl?.includes('.pdf') || currentUrl?.split('?')[0].endsWith('.pdf');
  const isSolutionPDF = solutionUrl?.includes('.pdf') || solutionUrl?.split('?')[0].endsWith('.pdf');

  return (
    <div className="w-full space-y-6">
      {/* Main Paper Viewer */}
      <div>
        {hasBack && (
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setActiveSide('front')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSide === 'front' ? 'bg-cyan-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <ChevronLeft className="h-4 w-4" /> Front Side
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSide === 'back' ? 'bg-cyan-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Back Side <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {currentUrl ? (
          isPDF ? (
            <object
              data={currentUrl}
              type="application/pdf"
              className="w-full rounded-xl border border-gray-200 shadow-sm"
              style={{ height: '75vh' }}
            >
              <a href={currentUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center h-full text-cyan-600 underline">
                Click here to view PDF
              </a>
            </object>
          ) : (
            <img
              src={currentUrl}
              alt={`Paper - ${activeSide} side`}
              className="w-full rounded-xl border border-gray-200 shadow-sm object-contain max-h-[75vh]"
            />
          )
        ) : (
          <div className="flex items-center justify-center h-60 rounded-xl border border-dashed border-gray-300 text-gray-400">
            No file available
          </div>
        )}

        {hasBack && (
          <p className="text-xs text-center text-gray-400 mt-2">
            Viewing: <span className="font-semibold capitalize text-gray-600">{activeSide} side</span>
          </p>
        )}
      </div>

      {/* Solution Paper Section */}
      {hasSolution && (
        <div className="border-t pt-6">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold text-green-900">
              <FileText className="h-5 w-5" />
              Solution Paper
              <CheckCircle className="h-4 w-4 text-green-600" />
            </span>
            <span className="text-green-600">
              {showSolution ? '▼' : '▶'}
            </span>
          </button>

          {showSolution && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <img
                  src={solutionUrl}
                  alt="Solution Paper"
                  className="w-full object-contain max-h-[600px] rounded-xl"
                />
              </div>

              {/* Download Button */}
              <a
                href={solutionUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Solution
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// UploadPaper form
const UploadPaper = () => {
  const userId = localStorage.getItem('userid');
  const userRole = localStorage.getItem('role'); // 'admin' or 'user'
  const isAdmin = userRole === 'admin';

  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    papercode: '',
    courseId: '',
    branchId: '',
    subject: '',
    years: new Date().getFullYear(),
    semester: 1,
    frontSideFile: null,
    backSideFile: null,
    solvePaperFile: null,
    uploadedBy: userId,
  });

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (formData.courseId) fetchBranches(formData.courseId);
    else setBranches([]);
  }, [formData.courseId]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data);
    }
    catch {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchBranches = async (courseId) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/branches`);
      setBranches(data.data);
    }
    catch {
      toast.error('Failed to fetch branches');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(p => ({ ...p, [name]: files?.[0] ?? null }));
      return;
    }
    setFormData(p => ({
      ...p,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const removeFile = (fieldName) => {
    setFormData(p => ({ ...p, [fieldName]: null }));
    const input = document.querySelector(`input[name="${fieldName}"]`);
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.frontSideFile) {
      toast.error('Please select the front side file');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('paperCode', formData.papercode);
      payload.append('course', formData.courseId);

      if (formData.branchId) payload.append('branch', formData.branchId);

      payload.append('subject', formData.subject);
      payload.append('year', formData.years);
      payload.append('semester', formData.semester);
      payload.append('uploadedBy', formData.uploadedBy);

      // Always add front side (required)
      payload.append('paperFile', formData.frontSideFile);

      // Add back side if provided (optional)
      if (formData.backSideFile) {
        payload.append('backSideFile', formData.backSideFile);
        console.log('📎 Back side file added to upload');
      }

      // Add solution file if provided (optional)
      if (formData.solvePaperFile) {
        payload.append('solvePaperFile', formData.solvePaperFile);
        console.log('📝 Solution file added to upload');
      } else {
        console.log('⚠️ No solution file provided (optional)');
      }

      setUploadProgress(20);

      const response = await api.post('/papers', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(Math.min(percentCompleted, 95));
        }
      });

      setUploadProgress(100);
      console.log("object", formData);
      // Show appropriate success message
      if (response.data?.solutionIncluded) {
        toast.success('Paper with solution uploaded successfully! 🎉');
      } else if (formData.solvePaperFile) {
        toast.success('Paper uploaded! (Solution file failed to upload, but paper is saved)');
      } else {
        toast.success('Paper uploaded successfully!');
      }

      // Navigate: BCA/MCA → their papers page, others → profile
      const selectedCourse = courses.find(c => c._id === formData.courseId);
      if (selectedCourse && DIRECT_TO_PAPERS.includes(selectedCourse.name)) {
        // navigate(`/course/${formData.courseId}/papers`);
      } else {
        setTimeout(() => navigate('/profile'), 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || error.response?.data?.errors || 'Failed to upload paper');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all';
  const fileCls = `${inputCls} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-1">Upload Paper</h1>
          <p className="text-gray-300 text-lg">Share your knowledge and earn coins!</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2.5 rounded-xl">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Paper Information</h2>
              <p className="text-gray-500 text-sm">Fill in the details to upload your paper</p>
            </div>
          </div>
          <hr className="my-4 border-gray-100" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Uploaded By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded By</label>
              <input
                type="password"
                name="uploadedBy"
                value={formData.uploadedBy}
                onChange={handleChange}
                className={inputCls}
                placeholder="Your name or username"
              />
            </div>

            {/* Name + Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g., Data Structures Mid Term"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Code</label>
                <input
                  type="text"
                  name="papercode"
                  value={formData.papercode}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g., BSHC101"
                />
              </div>
            </div>

            {/* Course + Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                <select
                  name="courseId"
                  required
                  value={formData.courseId}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  disabled={!formData.courseId}
                  className={`${inputCls} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b._id} value={b._id}>{b.name || b.title}</option>)}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g., Data Structures and Algorithms"
              />
            </div>

            {/* Year + Semester */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <input
                  type="number"
                  name="years"
                  required
                  min="2000"
                  max="2099"
                  value={formData.years}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <select
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            {/* Files */}
            <div className="rounded-xl border border-dashed border-cyan-300 bg-cyan-50/40 p-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Image className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-semibold text-cyan-700">Paper Files</span>
              </div>

              {/* Front Side - REQUIRED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Front Side <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-400 font-normal">(Image or PDF)</span>
                </label>
                <input
                  type="file"
                  name="frontSideFile"
                  required
                  onChange={handleChange}
                  accept="image/*,.pdf"
                  className={fileCls}
                />
                <FilePreview
                  file={formData.frontSideFile}
                  label="Front Side"
                  onRemove={() => removeFile('frontSideFile')}
                  isOptional={false}
                />
              </div>

              {/* Back Side - OPTIONAL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Back Side
                  <span className="ml-2 text-xs text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="backSideFile"
                  onChange={handleChange}
                  accept="image/*,.pdf"
                  className={fileCls}
                />
                <FilePreview
                  file={formData.backSideFile}
                  label="Back Side"
                  onRemove={() => removeFile('backSideFile')}
                />
              </div>

              {/* Solution File - ADMIN ONLY */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solution Paper
                    <span className="ml-2 text-xs text-gray-400 font-normal">(Admin Only — PDF or Image)</span>
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>
                  </label>
                  <input
                    type="file"
                    name="solvePaperFile"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                    className={fileCls}
                  />
                  {formData.solvePaperFile && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      Solution file selected ✓
                    </div>
                  )}
                  <FilePreview
                    file={formData.solvePaperFile}
                    label="Solution Paper"
                    onRemove={() => removeFile('solvePaperFile')}
                  />
                </div>
              )}

            </div>
            <div className='bg-blue-50 border text-sm border-blue-200 rounded-lg p-4'>

            <li>You'll earn <strong>5 coins</strong> on upload + <strong>10 more</strong> when approved</li>
            </div>

            {/* Note
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">📝 Upload Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Front side is required (image or PDF)</li>
                    <li>Back side & solution are optional</li>
                    <li>Admin will review before publishing</li>
                  </ul>
                </div>
              </div>
            </div> */}

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="font-medium text-cyan-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading ({uploadProgress}%)...
                </span>
              ) : 'Upload Paper'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPaper;