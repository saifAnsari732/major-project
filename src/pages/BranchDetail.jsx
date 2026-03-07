import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, FileText, Search, Filter,
  Eye, Download, Calendar, Hash, Sparkles, X
} from 'lucide-react';

const BranchDetail = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ paperCode: '', name: '' });

  useEffect(() => { fetchBranchDetails(); fetchPapers(); }, [branchId]);
  useEffect(() => { filterPapers(); }, [filters, papers]);

  const fetchBranchDetails = async () => {
    try { const { data } = await api.get(`/branches/${branchId}`); setBranch(data.data); }
    catch { toast.error('Failed to fetch branch details'); }
  };

  const fetchPapers = async () => {
    try {
      const { data } = await api.get(`/branches/${branchId}/papers`);
      setPapers(data.data); setFilteredPapers(data.data);
    } catch { toast.error('Failed to fetch papers'); }
    finally { setLoading(false); }
  };

  const filterPapers = () => {
    let f = papers;
    if (filters.paperCode) f = f.filter(p => p.paperCode?.toLowerCase().includes(filters.paperCode.toLowerCase()));
    if (filters.name) f = f.filter(p => p.name?.toLowerCase().includes(filters.name.toLowerCase()));
    setFilteredPapers(f);
  };

  const hasFilters = filters.paperCode || filters.name;

  if (loading) return (
    <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-full border-[3px] border-purple-500/20 border-t-purple-500 animate-spin" />
      <p className="text-gray-500 text-sm">Loading branch...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b14] font-sans relative overflow-x-hidden">

      {/* Blobs */}
      <div className="fixed top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed top-[35%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-[25%] w-[400px] h-[400px] rounded-full bg-pink-500/6 blur-3xl pointer-events-none" />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-b from-[#0d1030] to-[#080b14] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(102,126,234,0.13),transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">

          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl px-4 py-2 w-fit"
          >
            <ArrowLeft size={15} /> Back to Branches
          </button>

          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <Hash size={28} color="#fff" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-3">
                <Sparkles size={11} className="text-purple-400" />
                <span className="text-purple-400 text-[11px] font-bold tracking-wider">BRANCH</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{branch?.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-400 font-mono bg-white/5 border border-white/8 px-3 py-1 rounded-lg">
                  {branch?.code}
                </span>
                <span className="text-sm text-gray-400">{branch?.totalPapers || papers.length} Papers Available</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-8">
            {[
              { val: papers.length, label: 'Total Papers', color: 'text-purple-400' },
              { val: [...new Set(papers.map(p => p.semester))].length, label: 'Semesters', color: 'text-blue-400' },
              { val: [...new Set(papers.map(p => p.year))].length, label: 'Years', color: 'text-green-400' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10 relative z-10 space-y-6">

        {/* Branch description */}
        {branch?.description && (
          <div className="bg-white/[0.025] border border-white/7 rounded-2xl p-6 backdrop-blur">
            <h2 className="text-base font-bold text-white mb-3">About this Branch</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{branch.description}</p>
            {branch.image && (
              <img src={branch.image} alt={branch.name} className="mt-4 rounded-xl w-full h-56 object-cover border border-white/8" />
            )}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-white/[0.025] border border-white/7 rounded-2xl p-6 backdrop-blur">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Filter size={15} className="text-purple-400" /> Filter Papers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'paperCode', placeholder: 'Search by paper code...' },
              { name: 'name', placeholder: 'Search by paper name...' },
            ].map(({ name, placeholder }) => (
              <div key={name} className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name={name}
                  value={filters[name]}
                  onChange={e => setFilters({ ...filters, [e.target.name]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
            ))}
            <button
              onClick={() => setFilters({ paperCode: '', name: '' })}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold border transition-all
                ${hasFilters
                  ? 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
                  : 'bg-white/5 border-white/8 text-gray-500 cursor-default'}`}
            >
              <X size={14} /> Clear Filters
              {hasFilters && <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {[filters.paperCode, filters.name].filter(Boolean).length}
              </span>}
            </button>
          </div>
        </div>

        {/* ── Papers List ── */}
        <div className="bg-white/[0.025] border border-white/7 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white">Available Papers</h2>
            <span className="text-xs text-gray-500 bg-white/5 border border-white/8 px-3 py-1 rounded-full">
              {filteredPapers.length} of {papers.length}
            </span>
          </div>

          {filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <FileText size={28} className="text-purple-400" />
              </div>
              <p className="text-white font-semibold">No papers found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPapers.map((paper, i) => (
                <div
                  key={paper._id}
                  className="group flex flex-col md:flex-row md:items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/6 hover:border-purple-500/30 rounded-xl p-4 transition-all duration-200"
                >
                  {/* Left accent + icon */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
                      <FileText size={18} className="text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-bold text-sm truncate">{paper.name}</h3>
                      <p className="text-purple-400 text-xs font-mono mt-0.5">{paper.paperCode}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-gray-500 text-xs">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {paper.year}</span>
                        <span className="flex items-center gap-1"><Hash size={11} /> Sem {paper.semester}</span>
                        <span className="flex items-center gap-1"><Eye size={11} /> {paper.views ?? 0}</span>
                        <span className="flex items-center gap-1"><Download size={11} /> {paper.downloads ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/paper/${paper._id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-purple-500/20"
                    >
                      <Eye size={13} /> View
                    </Link>
                    <Link
                      to={`/solvepaper/`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-bold hover:bg-green-500/25 transition-all"
                    >
                      <FileText size={13} /> Solution
                    </Link>
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

export default BranchDetail;