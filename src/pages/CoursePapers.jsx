import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FileText, Download, Eye, Search, Filter,
  ArrowLeft, Upload, BookOpen, Calendar,
  ChevronDown, X, Layers
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────────
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const isImage = (url = '') =>
  /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url);

// ── PaperCard ──────────────────────────────────────────────────────────────────
const PaperCard = ({ paper, onDownload }) => {
  const frontUrl = paper?.paperFile?.url;
  const hasBack = !!paper?.backSideFile?.url;
// console.log("33",paper.course.name);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center overflow-hidden">
        {frontUrl && isImage(frontUrl) ? (
          <img src={frontUrl} alt={paper.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <FileText className="h-10 w-10" />
            <span className="text-xs">PDF / Document</span>
          </div>
        )}
        {/* badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Sem {paper.semester}
          </span>
          {hasBack && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Layers className="h-2.5 w-2.5" /> 2-sided
            </span>
          )}
        </div>
        <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
          {paper.year}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{paper.name}</h3>
        <p className="text-xs text-gray-500 mb-1">{paper.subject}</p>
        {paper.paperCode && (
          <p className="text-[11px] text-blue-500 font-mono mb-3">{paper.paperCode}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 mt-auto">
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{paper.views ?? 0}</span>
          <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{paper.downloads ?? 0}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/paper/${paper._id}`}
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            View
          </Link>
          <button
            onClick={() => onDownload(paper)}
            className="flex-1 text-xs font-medium py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-1"
          >
            <Download className="h-3.5 w-3.5" /> Solution
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const CoursePapers = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [papers, setPapers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // derived year list
  const availableYears = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);

  // ── fetch ──
  useEffect(() => {
    fetchCourseAndPapers();
  }, [courseId]);

  const fetchCourseAndPapers = async () => {
    setLoading(true);
    try {
      const [courseRes, papersRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get('/papers', { params: { course: courseId, status: 'approved' } }),
      ]);
      setCourse(courseRes.data.data);
      console.log("object",papersRes.data);
      setPapers(papersRes.data.data);
      setFiltered(papersRes.data.data);
    } catch {
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  // ── filter logic ──
  useEffect(() => {
    let result = papers;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.subject?.toLowerCase().includes(q) ||
          p.paperCode?.toLowerCase().includes(q)
      );
    }

    if (semFilter) result = result.filter((p) => String(p.semester) === semFilter);
    if (yearFilter) result = result.filter((p) => String(p.year) === yearFilter);

    setFiltered(result);
  }, [search, semFilter, yearFilter, papers]);

  const clearFilters = () => {
    setSearch('');
    setSemFilter('');
    setYearFilter('');
  };

  const activeFiltersCount = [semFilter, yearFilter].filter(Boolean).length;

  // ── download ──
  const handleDownload = async (paper) => {
    try {
      await api.put(`/papers/${paper._id}/download`);
      window.open(paper.paperFile?.url, '_blank');
    } catch {
      window.open(paper.paperFile?.url, '_blank');
    }
  };

  // ── loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">

      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm mb-5"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2.5 rounded-xl">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {course?.name ?? 'Course'} Papers
                </h1>
              </div>
              <p className="text-gray-400 text-sm">
                Browse and download previous year question papers
              </p>
            </div>

          
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{papers.length}</p>
              <p className="text-gray-400 text-xs">Total Papers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {[...new Set(papers.map((p) => p.semester))].length}
              </p>
              <p className="text-gray-400 text-xs">Semesters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {[...new Set(papers.map((p) => p.year))].length}
              </p>
              <p className="text-gray-400 text-xs">Years</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Filters bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, subject or paper code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3 items-center">
              {/* Semester */}
              <select
                value={semFilter}
                onChange={(e) => setSemFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {SEMESTER_OPTIONS.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>

              {/* Year */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Clear */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  <X className="h-3.5 w-3.5" /> Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Papers grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Result count */}
        <p className="text-sm text-gray-500 mb-5">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of{' '}
          <span className="font-semibold text-gray-800">{papers.length}</span> papers
          {(search || activeFiltersCount > 0) && (
            <button onClick={clearFilters} className="ml-2 text-blue-600 hover:underline text-xs">
              Clear all
            </button>
          )}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No papers found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {papers.length === 0
                ? 'No papers uploaded for this course yet.'
                : 'Try adjusting your search or filters.'}
            </p>
            {papers.length === 0 && (
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:shadow-lg transition-all"
              >
                <Upload className="h-4 w-4" /> Be the first to upload!
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((paper) => (
              <PaperCard key={paper._id} paper={paper} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePapers;