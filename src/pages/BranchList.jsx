import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Monitor, Cog, Zap, Building, Radio,
  Code, FileText, ArrowLeft, Sparkles, GraduationCap
} from 'lucide-react';

const branchIcons = {
  'Computer Science': Monitor,
  'Mechanical Engineering': Cog,
  'Electrical Engineering': Zap,
  'Civil Engineering': Building,
  'Electronics & Communication': Radio,
  'Information Technology': Code,
};

const branchGradients = {
  'Computer Science':            ['#667eea', '#764ba2'],
  'Mechanical Engineering':      ['#f5576c', '#f093fb'],
  'Electrical Engineering':      ['#f6d365', '#fda085'],
  'Civil Engineering':           ['#43e97b', '#38f9d7'],
  'Electronics & Communication': ['#a18cd1', '#fbc2eb'],
  'Information Technology':      ['#4facfe', '#00f2fe'],
};

const getGradient = (name) => branchGradients[name] || ['#667eea', '#764ba2'];

const BranchList = () => {
  const { courseId } = useParams();
  const [branches, setBranches] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBranches: 0, totalPapers: 0 });

  useEffect(() => { fetchBranches(); fetchCourse(); }, [courseId]);

  const fetchCourse = async () => {
    try { const { data } = await api.get(`/courses/${courseId}`); setCourse(data.data); }
    catch { toast.error('Failed to fetch course details'); }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}/branches`);
      setBranches(data.data);
      const totalPapers = data.data.reduce((sum, b) => sum + (b.totalPapers || 0), 0);
      setStats({ totalBranches: data.data.length, totalPapers });
    } catch { toast.error('Failed to fetch branches'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-full border-[3px] border-purple-500/20 border-t-purple-500 animate-spin" />
      <p className="text-gray-500 text-sm">Loading branches...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b14] font-sans relative overflow-x-hidden">

      {/* Blobs */}
      <div className="fixed top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed top-[35%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-[30%] w-[400px] h-[400px] rounded-full bg-pink-500/6 blur-3xl pointer-events-none" />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-b from-[#0d1030] to-[#080b14] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(102,126,234,0.13),transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">

          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl px-4 py-2 w-fit">
            <ArrowLeft size={15} /> Back to Courses
          </Link>

          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
              <GraduationCap size={28} color="#fff" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-3">
                <Sparkles size={11} className="text-purple-400" />
                <span className="text-purple-400 text-[11px] font-bold tracking-wider">BRANCHES</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                {course ? `${course.name} — Branches` : 'Branch by Course'}
              </h1>
              <p className="text-gray-400 text-sm">Manage and access all course papers by branch</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-8">
            <div>
              <p className="text-2xl font-extrabold text-purple-400">{stats.totalBranches}</p>
              <p className="text-gray-500 text-xs">Total Branches</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-400">{stats.totalPapers}</p>
              <p className="text-gray-500 text-xs">Total Papers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Branches Grid ── */}
      <div className="max-w-6xl mx-auto px-5 py-10 relative z-10">
        {branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white/[0.025] border border-white/7 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <FileText size={28} className="text-purple-400" />
            </div>
            <p className="text-white font-semibold">No branches available</p>
            <p className="text-gray-500 text-sm">No branches found for this course yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((branch) => {
              const Icon = branchIcons[branch.name] || Monitor;
              const [c1, c2] = getGradient(branch.name);

              return (
                <Link key={branch._id} to={`/branch/${branch._id}`} className="group block">
                  <div className="h-full bg-white/[0.03] border border-white/7 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-white/15 hover:shadow-2xl"
                    style={{ '--c1': c1, '--c2': c2 }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 50px ${c1}25`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                  >
                    {/* Top accent bar */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />

                    <div className="p-6">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 8px 24px ${c1}44` }}>
                        <Icon size={24} color="#fff" />
                      </div>

                      {/* Name + code */}
                      <h3 className="text-lg font-bold text-white mb-1">{branch.name}</h3>
                      <p className="text-xs font-mono mb-3 px-2 py-0.5 rounded-md w-fit border"
                        style={{ color: c1, background: `${c1}15`, borderColor: `${c1}30` }}>
                        {branch.code}
                      </p>

                      {branch.description && (
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{branch.description}</p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/6">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FileText size={12} />
                          {branch.totalPapers || 0} Papers
                        </span>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-200 group-hover:opacity-90"
                          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, color: '#fff', boxShadow: `0 4px 12px ${c1}40` }}>
                          View Papers →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchList;