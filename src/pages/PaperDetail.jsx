import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Eye, FileText, X, Sparkles, BookOpen, Calendar, Hash, Building, BarChart2, User } from 'lucide-react';

const PaperDetail = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  useEffect(() => { fetchPaper(); }, [paperId]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setShowSolutionModal(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showSolutionModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSolutionModal]);

  const fetchPaper = async () => {
    try {
      const { data } = await api.get(`/papers/${paperId}`);
      setPaper(data.data);
      if (data.data?.paperFile?.url) localStorage.setItem('currentPaper', data.data.paperFile.url);
      if (data.data?.backSideFile?.url) localStorage.setItem('backpaper', data.data.backSideFile.url);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const handleViewPaper = () => navigate('/paperview');

  const handlesolution = () => {
    if (!paper?.solvePaperFile?.url) { toast.error('Solution not available for this paper'); return; }
    setShowSolutionModal(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-full border-[3px] border-purple-500/20 border-t-purple-500 animate-spin" />
      <p className="text-gray-500 text-sm">Loading paper...</p>
    </div>
  );

  if (!paper) return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-9 h-9 text-purple-400" />
        </div>
        <p className="text-white font-semibold text-lg">Paper not found</p>
        <p className="text-gray-500 text-sm mt-1">This paper may have been removed</p>
      </div>
    </div>
  );

  const solutionUrl = paper?.solvePaperFile?.url;
  const hasSolution = !!solutionUrl;

  const details = [
    { label: 'Subject', value: paper.subject, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Year', value: paper.year, icon: Calendar, color: 'text-pink-400' },
    { label: 'Semester', value: `Semester ${paper.semester}`, icon: Hash, color: 'text-blue-400' },
    { label: 'Branch', value: paper.branch?.name, icon: Building, color: 'text-green-400' },
    { label: 'Views', value: paper.views ?? 0, icon: Eye, color: 'text-amber-400' },
    { label: 'Downloads', value: paper.downloads ?? 0, icon: Download, color: 'text-cyan-400' },
    { label: 'Uploaded By', value: paper?.uploadedBy?.name || 'Unknown', icon: User, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[#080b14] font-sans relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="fixed top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed top-[30%] right-[-100px] w-[400px] h-[400px] rounded-full bg-pink-500/8 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-[25%] w-[400px] h-[400px] rounded-full bg-blue-500/6 blur-3xl pointer-events-none" />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-b from-[#0d1030] to-[#080b14] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(102,126,234,0.13),transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl px-4 py-2"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex items-start gap-5 flex-wrap">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <FileText size={28} color="#fff" />
            </div>

            <div className="flex-1 min-w-[200px]">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-3">
                <Sparkles size={11} className="text-purple-400" />
                <span className="text-purple-400 text-[11px] font-bold tracking-wider">QUESTION PAPER</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
                {paper.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-400 font-mono bg-white/5 border border-white/8 px-3 py-1 rounded-lg">
                  {paper.paperCode}
                </span>
                <span className="text-sm text-gray-400">Sem {paper.semester} · {paper.year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Details Card */}
          <div className="lg:col-span-2 bg-white/[0.025] border border-white/7 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart2 size={18} className="text-purple-400" /> Paper Details
            </h2>

            <div className="space-y-1">
              {details.map(({ label, value, icon: Icon, color }, i) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] rounded-xl px-3 -mx-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
                      <Icon size={14} className={color} />
                    </div>
                    <span className="text-gray-400 text-sm">{label}</span>
                  </div>
                  <span className="font-semibold text-white text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.025] border border-white/7 rounded-2xl p-6 sticky top-6 backdrop-blur">
              <h3 className="text-base font-bold text-white mb-5">Actions</h3>

              <div className="space-y-3">
                {/* View Paper */}
                <button
                  onClick={handleViewPaper}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
                >
                  <Eye size={16} /> View Paper
                </button>

                {/* View Solution */}
                <button
                  onClick={handlesolution}
                  disabled={!hasSolution}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-opacity shadow-lg
                    ${hasSolution
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-green-500/25'
                      : 'bg-white/5 border border-white/8 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <FileText size={16} />
                  {hasSolution ? 'View Solution' : 'No Solution Available'}
                </button>
              </div>

              {/* Paper info chips */}
              <div className="mt-6 pt-5 border-t border-white/6 flex flex-wrap gap-2">
                {[
                  { label: `Sem ${paper.semester}`, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                  { label: paper.year, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
                  { label: paper.branch?.name, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                ].filter(c => c.label).map((chip, i) => (
                  <span key={i} className={`text-[11px] font-600 px-3 py-1 rounded-full border ${chip.color}`}>
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Solution Modal ── */}
      {showSolutionModal && hasSolution && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md"
          onClick={e => { if (e.target === e.currentTarget) setShowSolutionModal(false); }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#0f1420] border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                <FileText size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Solution Paper</p>
                <p className="text-gray-500 text-xs truncate max-w-[200px]">{paper.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSolutionModal(false)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/80 border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto flex items-start justify-center p-6">
            <img
              src={solutionUrl}
              alt="Solution"
              className="w-full max-w-3xl rounded-2xl shadow-2xl border border-white/8"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex-shrink-0 px-5 py-3 bg-[#0f1420] border-t border-white/8 text-center">
            <p className="text-gray-500 text-xs">
              Press <kbd className="bg-white/10 text-white px-2 py-0.5 rounded text-xs mx-1">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetail;