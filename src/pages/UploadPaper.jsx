import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText, Image, ChevronLeft, ChevronRight, X, Download, CheckCircle } from 'lucide-react';

const DIRECT_TO_PAPERS = ['BCA', 'MCA'];

const FilePreview = ({ file, label, onRemove, isOptional = true }) => {
  if (!file) return null;
  const isPDF = file.type === 'application/pdf';
  const previewUrl = !isPDF ? URL.createObjectURL(file) : null;
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  return (
    <div className="relative mt-2 rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
      {isPDF ? (
        <div className="w-10 h-10 flex items-center justify-center bg-red-500/20 rounded-xl shrink-0">
          <FileText className="h-5 w-5 text-red-400" />
        </div>
      ) : (
        <img src={previewUrl} alt={label} className="w-10 h-10 object-cover rounded-xl shrink-0 border border-white/10" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{label}</p>
        <p className="text-xs text-gray-500 truncate">{file.name} ({fileSizeInMB} MB)</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <button type="button" onClick={onRemove}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 flex items-center justify-center text-red-400 transition-all">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

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

  return (
    <div className="w-full space-y-6">
      <div>
        {hasBack && (
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setActiveSide('front')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeSide === 'front' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}>
              <ChevronLeft className="h-4 w-4" /> Front Side
            </button>
            <button onClick={() => setActiveSide('back')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeSide === 'back' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}>
              Back Side <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {currentUrl ? (
          isPDF ? (
            <object data={currentUrl} type="application/pdf" className="w-full rounded-2xl border border-white/10 shadow-2xl" style={{ height: '75vh' }}>
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-full text-purple-400 underline">Click here to view PDF</a>
            </object>
          ) : (
            <img src={currentUrl} alt={`Paper - ${activeSide} side`} className="w-full rounded-2xl border border-white/10 shadow-2xl object-contain max-h-[75vh]" />
          )
        ) : (
          <div className="flex items-center justify-center h-60 rounded-2xl border border-dashed border-white/10 text-gray-500">No file available</div>
        )}
        {hasBack && <p className="text-xs text-center text-gray-500 mt-2">Viewing: <span className="font-semibold capitalize text-gray-300">{activeSide} side</span></p>}
      </div>
      {hasSolution && (
        <div className="border-t border-white/8 pt-6">
          <button onClick={() => setShowSolution(!showSolution)}
            className="w-full flex items-center justify-between px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/15 transition-colors">
            <span className="flex items-center gap-2 font-semibold text-green-400"><FileText className="h-5 w-5" /> Solution Paper <CheckCircle className="h-4 w-4" /></span>
            <span className="text-green-400 text-sm">{showSolution ? '▼' : '▶'}</span>
          </button>
          {showSolution && (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <img src={solutionUrl} alt="Solution Paper" className="w-full object-contain max-h-[600px]" />
              </div>
              <a href={solutionUrl} download target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-green-500/25">
                <Download className="h-4 w-4" /> Download Solution
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UploadPaper = () => {
  const userId = localStorage.getItem('userid');
  const userRole = localStorage.getItem('role');
  const isAdmin = userRole === 'admin';
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '', papercode: '', courseId: '', branchId: '', subject: '',
    years: new Date().getFullYear(), semester: 1,
    frontSideFile: null, backSideFile: null, solvePaperFile: null, uploadedBy: userId,
  });

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (formData.courseId) fetchBranches(formData.courseId); else setBranches([]); }, [formData.courseId]);

  const fetchCourses = async () => {
    try { const { data } = await api.get('/courses'); setCourses(data.data); }
    catch { toast.error('Failed to fetch courses'); }
  };
  const fetchBranches = async (courseId) => {
    try { const { data } = await api.get(`/courses/${courseId}/branches`); setBranches(data.data); }
    catch { toast.error('Failed to fetch branches'); }
  };
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') { setFormData(p => ({ ...p, [name]: files?.[0] ?? null })); return; }
    setFormData(p => ({ ...p, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };
  const removeFile = (fieldName) => {
    setFormData(p => ({ ...p, [fieldName]: null }));
    const input = document.querySelector(`input[name="${fieldName}"]`);
    if (input) input.value = '';
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.frontSideFile) { toast.error('Please select the front side file'); return; }
    setLoading(true); setUploadProgress(0);
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
      payload.append('paperFile', formData.frontSideFile);
      if (formData.backSideFile) payload.append('backSideFile', formData.backSideFile);
      if (formData.solvePaperFile) payload.append('solvePaperFile', formData.solvePaperFile);
      setUploadProgress(20);
      const response = await api.post('/papers', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(percentCompleted, 95));
        }
      });
      setUploadProgress(100);
      if (response.data?.solutionIncluded) toast.success('Paper with solution uploaded! 🎉');
      else if (formData.solvePaperFile) toast.success('Paper uploaded! (Solution file failed, but paper is saved)');
      else toast.success('Paper uploaded successfully!');
      const selectedCourse = courses.find(c => c._id === formData.courseId);
      if (!(selectedCourse && DIRECT_TO_PAPERS.includes(selectedCourse.name))) {
        setTimeout(() => navigate('/profile'), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors || 'Failed to upload paper');
    } finally { setLoading(false); setUploadProgress(0); }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-purple-500/50 transition-all';
  const selectCls = `${inputCls} appearance-none cursor-pointer`;
  const fileCls = `w-full text-sm text-gray-400 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none cursor-pointer file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 transition-all`;

  return (
    <div className="min-h-screen bg-[#080b14] font-sans relative overflow-x-hidden">

      {/* Blobs */}
      <div className="fixed top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed top-[35%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-[25%] w-[400px] h-[400px] rounded-full bg-pink-500/6 blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#0d1030] to-[#080b14] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(102,126,234,0.13),transparent_60%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-5 py-10 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-4">
            <Upload size={11} className="text-purple-400" />
            <span className="text-purple-400 text-[11px] font-bold tracking-wider">CONTRIBUTE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">Upload a Paper</h1>
          <p className="text-gray-400 text-sm">Share your knowledge and earn coins!</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-5 py-10 relative z-10">
        <div className="bg-white/[0.025] border border-white/7 rounded-2xl p-6 backdrop-blur">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
              <Upload size={20} color="#fff" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Paper Information</h2>
              <p className="text-gray-500 text-xs">Fill in the details to upload your paper</p>
            </div>
          </div>
          <div className="border-t border-white/6 mb-6" />

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Uploaded By */}
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Uploaded By</label>
              <input type="password" name="uploadedBy" value={formData.uploadedBy} onChange={handleChange} className={inputCls} placeholder="Your user ID" />
            </div>

            {/* Name + Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Paper Name <span className="text-red-400">*</span></label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputCls} placeholder="e.g., Data Structures Mid Term" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Paper Code</label>
                <input type="text" name="papercode" value={formData.papercode} onChange={handleChange} className={inputCls} placeholder="e.g., BSHC101" />
              </div>
            </div>

            {/* Course + Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Course <span className="text-red-400">*</span></label>
                <select name="courseId" required value={formData.courseId} onChange={handleChange} className={selectCls}>
                  <option value="" className="bg-[#0f1420]">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id} className="bg-[#0f1420]">{c.name || c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Branch</label>
                <select name="branchId" value={formData.branchId} onChange={handleChange} disabled={!formData.courseId} className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="" className="bg-[#0f1420]">Select Branch</option>
                  {branches.map(b => <option key={b._id} value={b._id} className="bg-[#0f1420]">{b.name || b.title}</option>)}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Subject <span className="text-red-400">*</span></label>
              <input type="text" name="subject" required value={formData.subject} onChange={handleChange} className={inputCls} placeholder="e.g., Data Structures and Algorithms" />
            </div>

            {/* Year + Semester */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Year <span className="text-red-400">*</span></label>
                <input type="number" name="years" required min="2000" max="2099" value={formData.years} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Semester <span className="text-red-400">*</span></label>
                <select name="semester" required value={formData.semester} onChange={handleChange} className={selectCls}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-[#0f1420]">Semester {s}</option>)}
                </select>
              </div>
            </div>

            {/* File Uploads */}
            <div className="rounded-2xl border-2 border-dashed border-purple-500/25 bg-purple-500/5 p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-bold text-purple-300">Paper Files</span>
              </div>

              {/* Front Side */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Front Side <span className="text-red-400">*</span>
                  <span className="ml-2 text-gray-600 font-normal normal-case text-[11px]">Image or PDF</span>
                </label>
                <input type="file" name="frontSideFile" required onChange={handleChange} accept="image/*,.pdf" className={fileCls} />
                <FilePreview file={formData.frontSideFile} label="Front Side" onRemove={() => removeFile('frontSideFile')} isOptional={false} />
              </div>

              {/* Back Side */}
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Back Side
                  <span className="ml-2 text-gray-600 font-normal normal-case text-[11px]">Optional</span>
                </label>
                <input type="file" name="backSideFile" onChange={handleChange} accept="image/*,.pdf" className={fileCls} />
                <FilePreview file={formData.backSideFile} label="Back Side" onRemove={() => removeFile('backSideFile')} />
              </div>

              {/* Solution — Admin only */}
              {isAdmin && (
                <div>
                  <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wide flex items-center gap-2 flex-wrap">
                    Solution Paper
                    <span className="text-gray-600 font-normal normal-case text-[11px]">Admin Only</span>
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">Admin</span>
                  </label>
                  <input type="file" name="solvePaperFile" onChange={handleChange} accept="image/*,.pdf" className={fileCls} />
                  {formData.solvePaperFile && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-xl border border-green-500/20">
                      <CheckCircle className="h-4 w-4" /> Solution file selected ✓
                    </div>
                  )}
                  <FilePreview file={formData.solvePaperFile} label="Solution Paper" onRemove={() => removeFile('solvePaperFile')} />
                </div>
              )}
            </div>

            {/* Coins note */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-300">
              <span>🪙</span>
              <span>Earn <strong>4 Rs</strong> on upload + <strong>1 more</strong> when approved</span>
            </div>

            {/* Progress bar */}
            {loading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Uploading...</span>
                  <span className="font-bold text-purple-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Uploading ({uploadProgress}%)...
                </>
              ) : (
                <><Upload size={16} /> Upload Paper</>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPaper;