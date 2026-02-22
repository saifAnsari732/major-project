import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Eye, User, FileText, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PaperDetail = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  useEffect(() => {
    fetchPaper();
  }, [paperId]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setShowSolutionModal(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showSolutionModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSolutionModal]);

  const fetchPaper = async () => {
    try {
      const { data } = await api.get(`/papers/${paperId}`);
      setPaper(data.data);
      if (data.data?.paperFile?.url)
        localStorage.setItem('currentPaper', data.data.paperFile.url);
      if (data.data?.backSideFile?.url)
        localStorage.setItem('backpaper', data.data.backSideFile.url);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPaper = () => navigate('/paperview');

  const handlesolution = () => {
    if (!paper?.solvePaperFile?.url) {
      toast.error('Solution not available for this paper');
      return;
    }
    setShowSolutionModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-600"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Paper not found</p>
        </div>
      </div>
    );
  }

  const solutionUrl = paper?.solvePaperFile?.url;
  const hasSolution = !!solutionUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{paper.name}</h1>
          <p className="text-gray-300 text-lg">Paper Code: {paper.paperCode}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Paper Details</h2>
              <div className="space-y-4">
                {[
                  ['Subject', paper.subject],
                  ['Year', paper.year],
                  ['Semester', paper.semester],
                  ['Branch', paper.branch?.name],
                  ['Views', paper.views],
                  ['Downloads', paper.downloads],
                  ['Uploaded By', paper?.uploadedBy?.name || 'Unknown User'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <span className="text-gray-600">{label}:</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleViewPaper}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="h-5 w-5" /> View Paper
                </button>

                <button
                  onClick={handlesolution}
                  disabled={!hasSolution}
                  className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-white
                    ${hasSolution
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                      : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                  <FileText className="h-5 w-5" />
                  {hasSolution ? 'View Solution' : 'No Solution Available'}
                </button>
{/* 
                {hasSolution && (
                  <a
                    href={solutionUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" /> Download Solution
                  </a>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Solution Modal (Full Screen) ── */}
      {showSolutionModal && hasSolution && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">

          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-semibold text-sm">Solution Paper</p>
                <p className="text-gray-400 text-xs">{paper.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* <a
                href={""}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" /> Download
              </a> */}
              <button
                onClick={() => setShowSolutionModal(false)}
                className="p-2 rounded-lg bg-gray-700 hover:bg-red-600 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body — Full scrollable image */}
          <div className="flex-1 overflow-y-auto flex items-start justify-center p-4">
            <img
              src={solutionUrl}
              alt="Solution Paper"
              className="max-w-full rounded-lg shadow-2xl"
              style={{ width: '100%', maxWidth: '900px', height: 'auto' }}
            />
          </div>

          {/* Modal Footer */}
          <div className="shrink-0 px-4 py-3 bg-gray-900 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-xs">Press <kbd className="bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs">Esc</kbd> to close</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaperDetail;