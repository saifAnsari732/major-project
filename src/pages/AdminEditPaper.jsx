import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, FileText, X, CheckCircle, Eye } from 'lucide-react';

// ─── File Preview Component ───────────────────────────────────────────────────
const FilePreview = ({ file, label, onRemove }) => {
  if (!file) return null;
  const isPDF = file.type === 'application/pdf';
  const previewUrl = !isPDF ? URL.createObjectURL(file) : null;
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center gap-3">
      {isPDF ? (
        <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg shrink-0">
          <FileText className="h-5 w-5 text-red-500" />
        </div>
      ) : (
        <img src={previewUrl} alt={label} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-300" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{label}</p>
        <p className="text-xs text-gray-500">{file.name} ({fileSizeInMB} MB)</p>
      </div>
      <button type="button" onClick={onRemove}
        className="shrink-0 p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// ─── Existing File Card ───────────────────────────────────────────────────────
const ExistingFileCard = ({ url, label }) => {
  if (!url) return (
    <div className="mt-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-gray-400">
      No {label} uploaded
    </div>
  );

  const isImage = !url.includes('.pdf') && (
    url.includes('/image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  return (
    <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-3">
      {isImage ? (
        <img src={url} alt={label} className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0" />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg shrink-0">
          <FileText className="h-5 w-5 text-red-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-green-700">Current {label}</p>
        <p className="text-xs text-gray-500 truncate">{url.split('/').pop()}</p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="shrink-0 p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
        <Eye className="h-4 w-4 text-gray-500" />
      </a>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminEditPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);

  // Existing file URLs fetched from DB
  const [existingFiles, setExistingFiles] = useState({
    paperFile: null,
    backSideFile: null,
    solvePaperFile: null,
  });

  // New files selected by admin (to replace existing)
  const [newFiles, setNewFiles] = useState({
    paperFile: null,
    backSideFile: null,
    solvePaperFile: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    paperCode: '',
    course: '',
    branch: '',
    subject: '',
    year: '',
    semester: '',
    status: '',
  });

  useEffect(() => {
    fetchPaper();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.course) fetchBranches(formData.course);
  }, [formData.course]);

  const fetchPaper = async () => {
    try {
      const { data } = await api.get(`/papers/${id}`);
      const p = data.data;

      setFormData({
        name: p.name || '',
        paperCode: p.paperCode || '',
        course: p.course?._id || '',
        branch: p.branch?._id || '',
        subject: p.subject || '',
        year: p.year || '',
        semester: p.semester || '',
        status: p.status || 'pending',
      });

      // Save existing file URLs to show current files
      setExistingFiles({
        paperFile: p.paperFile?.url || null,
        backSideFile: p.backSideFile?.url || null,
        solvePaperFile: p.solvePaperFile?.url || null,
      });

    } catch (error) {
      toast.error('Failed to fetch paper');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data);
    } catch {}
  };

  const fetchBranches = async (courseId) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/branches`);
      setBranches(data.data);
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setNewFiles(p => ({ ...p, [name]: files?.[0] ?? null }));
  };

  const removeNewFile = (fieldName) => {
    setNewFiles(p => ({ ...p, [fieldName]: null }));
    const input = document.querySelector(`input[name="${fieldName}"]`);
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const hasNewFiles = newFiles.paperFile || newFiles.backSideFile || newFiles.solvePaperFile;

      if (hasNewFiles) {
        // Use FormData if files are being updated
        const payload = new FormData();
        Object.entries(formData).forEach(([key, val]) => {
          if (val !== '') payload.append(key, val);
        });
        if (newFiles.paperFile)      payload.append('paperFile', newFiles.paperFile);
        if (newFiles.backSideFile)   payload.append('backSideFile', newFiles.backSideFile);
        if (newFiles.solvePaperFile) payload.append('solvePaperFile', newFiles.solvePaperFile);

        await api.put(`/papers/${id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // No new files — just send JSON
        await api.put(`/papers/${id}`, formData);
      }

      toast.success('Paper updated successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update paper');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all';
  const fileCls = `${inputCls} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Paper</h1>
          <p className="text-gray-400 mt-1">Update paper details and files</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Name + Code ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Name *</label>
                <input type="text" name="name" required
                  value={formData.name} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Code *</label>
                <input type="text" name="paperCode" required
                  value={formData.paperCode} onChange={handleChange} className={inputCls} />
              </div>
            </div>

            {/* ── Course + Branch ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select name="course" value={formData.course} onChange={handleChange} className={inputCls}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select name="branch" value={formData.branch} onChange={handleChange} className={inputCls}>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b._id} value={b._id}>{b.name || b.title}</option>)}
                </select>
              </div>
            </div>

            {/* ── Subject ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input type="text" name="subject" required
                value={formData.subject} onChange={handleChange} className={inputCls} />
            </div>

            {/* ── Year + Semester ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="number" name="year" min="2000" max="2099"
                  value={formData.year} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className={inputCls}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            {/* ── Status ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputCls}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* ── Files Section ── */}
            <div className="rounded-xl border border-dashed border-cyan-300 bg-cyan-50/40 p-5 space-y-6">
              <p className="text-sm font-semibold text-cyan-700">📁 Paper Files (leave empty to keep existing)</p>

              {/* Front Side */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Front Side
                  <span className="ml-2 text-xs text-gray-400 font-normal">(Replace existing)</span>
                </label>
                <ExistingFileCard url={existingFiles.paperFile} label="Front Side" />
                <div className="mt-3">
                  <input type="file" name="paperFile"
                    onChange={handleFileChange} accept="image/*,.pdf" className={fileCls} />
                  <FilePreview file={newFiles.paperFile} label="New Front Side"
                    onRemove={() => removeNewFile('paperFile')} />
                  {newFiles.paperFile && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Will replace existing front side on save
                    </p>
                  )}
                </div>
              </div>

              {/* Back Side */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Back Side
                  <span className="ml-2 text-xs text-gray-400 font-normal">(Optional — Replace existing)</span>
                </label>
                <ExistingFileCard url={existingFiles.backSideFile} label="Back Side" />
                <div className="mt-3">
                  <input type="file" name="backSideFile"
                    onChange={handleFileChange} accept="image/*,.pdf" className={fileCls} />
                  <FilePreview file={newFiles.backSideFile} label="New Back Side"
                    onRemove={() => removeNewFile('backSideFile')} />
                  {newFiles.backSideFile && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Will replace existing back side on save
                    </p>
                  )}
                </div>
              </div>

              {/* Solution File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solution Paper
                  <span className="ml-2 text-xs text-gray-400 font-normal">(Optional — Replace existing)</span>
                </label>
                <ExistingFileCard url={existingFiles.solvePaperFile} label="Solution" />
                <div className="mt-3">
                  <input type="file" name="solvePaperFile"
                    onChange={handleFileChange} accept="image/*,.pdf" className={fileCls} />
                  <FilePreview file={newFiles.solvePaperFile} label="New Solution"
                    onRemove={() => removeNewFile('solvePaperFile')} />
                  {newFiles.solvePaperFile && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Will replace existing solution on save
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <button type="submit" disabled={saving}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg">
              <Save className="h-5 w-5" />
              {saving ? 'Saving...' : 'Update Paper'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditPaper;