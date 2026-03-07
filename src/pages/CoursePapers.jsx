import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FileText, Download, Eye, Search, Filter,
  ArrowLeft, Upload, BookOpen, Calendar,
  ChevronDown, X, Layers, Sparkles, GraduationCap
} from 'lucide-react';

const SEMESTER_OPTIONS = [1,2,3,4,5,6,7,8];
const isImage = (url='') => /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url);

// ── Paper Card ─────────────────────────────────────────────────────────────────
const PaperCard = ({ paper, onDownload, index }) => {
  const frontUrl = paper?.paperFile?.url;
  const hasBack = !!paper?.backSideFile?.url;
  const semColors = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#fee140','#a18cd1','#f5576c'];
  const accent = semColors[(paper.semester - 1) % semColors.length];

  return (
    <div style={{
      ...C.paperCard,
      animationDelay: `${index * 0.06}s`,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow=`0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${accent}44`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=C.paperCard.boxShadow; }}
    >
      {/* Thumbnail */}
      <div style={C.thumb}>
        {frontUrl && isImage(frontUrl) ? (
          <img src={frontUrl} alt={paper.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
        ) : (
          <div style={C.thumbPlaceholder}>
            <div style={{...C.thumbIcon, background: `linear-gradient(135deg, ${accent}33, ${accent}11)`}}>
              <FileText size={28} color={accent} />
            </div>
            <span style={{fontSize:'11px',color:'#6b7280',marginTop:'8px'}}>PDF / Document</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div style={C.thumbOverlay} />
        {/* Badges */}
        <div style={C.badges}>
          <span style={{...C.badge, background: accent, boxShadow:`0 2px 8px ${accent}66`}}>
            Sem {paper.semester}
          </span>
          {hasBack && (
            <span style={{...C.badge, background:'rgba(67,233,123,0.9)'}}>
              <Layers size={9}/> 2-sided
            </span>
          )}
        </div>
        <span style={C.yearBadge}>{paper.year}</span>
      </div>

      {/* Body */}
      <div style={C.cardBody}>
        <div style={{...C.accentLine, background: accent}} />
        <h3 style={C.cardTitle}>{paper.name}</h3>
        {paper.subject && <p style={C.cardSub}>{paper.subject}</p>}
        {paper.paperCode && <p style={{...C.cardCode, color: accent}}>{paper.paperCode}</p>}

        <div style={C.cardStats}>
          <span style={C.statItem}><Eye size={12}/>{paper.views ?? 0} views</span>
          <span style={C.statItem}><Download size={12}/>{paper.downloads ?? 0} dl</span>
        </div>

        <Link to={`/paper/${paper._id}`} style={{...C.viewBtn, background:`linear-gradient(135deg, ${accent}, ${accent}bb)`}}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}
        >
          <Eye size={13}/> View Paper
        </Link>
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────────
const CoursePapers = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [papers, setPapers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const availableYears = [...new Set(papers.map(p=>p.year))].sort((a,b)=>b-a);

  useEffect(() => { fetchCourseAndPapers(); }, [courseId]);

  const fetchCourseAndPapers = async () => {
    setLoading(true);
    try {
      const [courseRes, papersRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get('/papers', { params: { course: courseId, status: 'approved' } }),
      ]);
      setCourse(courseRes.data);
      setPapers(papersRes.data.data);
      setFiltered(papersRes.data.data);
    } catch { toast.error('Failed to load papers'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let r = papers;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p => p.name?.toLowerCase().includes(q) || p.subject?.toLowerCase().includes(q) || p.paperCode?.toLowerCase().includes(q));
    }
    if (semFilter) r = r.filter(p => String(p.semester) === semFilter);
    if (yearFilter) r = r.filter(p => String(p.year) === yearFilter);
    setFiltered(r);
  }, [search, semFilter, yearFilter, papers]);

  const clearFilters = () => { setSearch(''); setSemFilter(''); setYearFilter(''); };
  const activeCount = [semFilter, yearFilter].filter(Boolean).length;

  const handleDownload = async (paper) => {
    try { await api.put(`/papers/${paper._id}/download`); } catch {}
    window.open(paper.paperFile?.url, '_blank');
  };

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#080b14',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px'}}>
      <div style={{width:'52px',height:'52px',borderRadius:'50%',border:'3px solid rgba(102,126,234,0.2)',borderTop:'3px solid #667eea',animation:'spin 1s linear infinite'}} />
      <p style={{color:'#6b7280',fontSize:'14px'}}>Loading papers...</p>
    </div>
  );

  const uniqueSems = [...new Set(papers.map(p=>p.semester))].length;
  const uniqueYears = [...new Set(papers.map(p=>p.year))].length;

  return (
    <div style={C.root}>
      {/* Blobs */}
      <div style={C.blob1}/><div style={C.blob2}/><div style={C.blob3}/>

      {/* ── Hero ── */}
      <div style={C.hero}>
        <div style={C.heroBgGlow}/>
        <div style={C.heroInner}>
          <button style={C.backBtn}
            onClick={()=>navigate('/')}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#9ca3af';}}
          >
            <ArrowLeft size={15}/> Back to Home
          </button>

          <div style={C.heroContent}>
            <div style={C.heroLeft}>
              <div style={C.heroBadge}>
                <Sparkles size={12} color="#a78bfa"/>
                <span style={{fontSize:'11px',color:'#a78bfa',fontWeight:'700',letterSpacing:'0.5px'}}>COURSE PAPERS</span>
              </div>
              <h1 style={C.heroTitle}>{course?.name ?? 'Course'}</h1>
              <p style={C.heroSub}>Browse and download previous year question papers</p>
            </div>

            {/* Stats */}
            <div style={C.heroStats}>
              {[
                {val: papers.length, label:'Total Papers', color:'#667eea'},
                {val: uniqueSems, label:'Semesters', color:'#f093fb'},
                {val: uniqueYears, label:'Years', color:'#43e97b'},
              ].map((s,i)=>(
                <div key={i} style={C.heroStat}>
                  <span style={{...C.heroStatVal, color: s.color}}>{s.val}</span>
                  <span style={C.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div style={C.filterBar}>
        <div style={C.filterInner}>
          <div style={C.searchWrap}>
            <Search size={15} color="#6b7280"/>
            <input
              style={C.searchInput}
              placeholder="Search by name, subject or paper code..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
            {search && <button style={C.clearX} onClick={()=>setSearch('')}><X size={13}/></button>}
          </div>

          <button style={{...C.filterBtn, ...(showFilters||activeCount>0 ? C.filterBtnActive : {})}}
            onClick={()=>setShowFilters(p=>!p)}
          >
            <Filter size={14}/>
            Filters
            {activeCount > 0 && <span style={C.filterCount}>{activeCount}</span>}
            <ChevronDown size={13} style={{transform: showFilters?'rotate(180deg)':'rotate(0deg)', transition:'0.2s'}}/>
          </button>
        </div>

        {/* Expanded */}
        {showFilters && (
          <div style={C.expandedFilters}>
            <select style={C.select} value={semFilter} onChange={e=>setSemFilter(e.target.value)}>
              <option value="">All Semesters</option>
              {SEMESTER_OPTIONS.map(s=><option key={s} value={s}>Semester {s}</option>)}
            </select>
            <select style={C.select} value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>
              <option value="">All Years</option>
              {availableYears.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            {activeCount > 0 && (
              <button style={C.clearBtn} onClick={clearFilters}><X size={12}/> Clear all</button>
            )}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={C.gridWrap}>
        <p style={C.resultCount}>
          Showing <strong style={{color:'#e5e7eb'}}>{filtered.length}</strong> of <strong style={{color:'#e5e7eb'}}>{papers.length}</strong> papers
          {(search || activeCount > 0) && (
            <button style={C.clearLink} onClick={clearFilters}>Clear all</button>
          )}
        </p>

        {filtered.length === 0 ? (
          <div style={C.emptyState}>
            <div style={C.emptyIcon}><FileText size={32} color="#667eea"/></div>
            <h3 style={C.emptyTitle}>{papers.length === 0 ? 'No papers yet' : 'No papers found'}</h3>
            <p style={C.emptySub}>
              {papers.length === 0 ? 'Be the first to upload a paper for this course!' : 'Try adjusting your search or filters.'}
            </p>
            {papers.length === 0 && (
              <Link to="/upload" style={C.uploadBtn}>
                <Upload size={14}/> Upload First Paper
              </Link>
            )}
          </div>
        ) : (
          <div style={C.grid}>
            {filtered.map((paper,i)=>(
              <PaperCard key={paper._id} paper={paper} onDownload={handleDownload} index={i}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const C = {
  root: { minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", position:'relative', overflowX:'hidden' },
  blob1: { position:'fixed', top:'-150px', left:'-150px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(102,126,234,0.1) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob2: { position:'fixed', top:'35%', right:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(240,147,251,0.07) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob3: { position:'fixed', bottom:'-80px', left:'30%', width:'450px', height:'450px', borderRadius:'50%', background:'radial-gradient(circle,rgba(67,233,123,0.06) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },

  // Hero
  hero: { position:'relative', background:'linear-gradient(180deg,#0d1030 0%,#080b14 100%)', borderBottom:'1px solid rgba(255,255,255,0.06)', overflow:'hidden', zIndex:1 },
  heroBgGlow: { position:'absolute', top:'-60px', right:'-60px', width:'500px', height:'400px', background:'radial-gradient(ellipse,rgba(102,126,234,0.15) 0%,transparent 70%)', pointerEvents:'none' },
  heroInner: { maxWidth:'1200px', margin:'0 auto', padding:'32px 20px 36px', position:'relative', zIndex:1 },
  backBtn: { display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'7px 14px', color:'#9ca3af', fontSize:'13px', cursor:'pointer', marginBottom:'24px', transition:'background 0.15s,color 0.15s' },
  heroContent: { display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'24px' },
  heroLeft: { display:'flex', flexDirection:'column', gap:'10px' },
  heroBadge: { display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'20px', padding:'4px 12px', width:'fit-content' },
  heroTitle: { fontSize:'36px', fontWeight:'800', color:'#fff', margin:0, letterSpacing:'-1px', background:'linear-gradient(135deg,#fff 0%,#a78bfa 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  heroSub: { margin:0, fontSize:'14px', color:'#6b7280' },
  heroStats: { display:'flex', gap:'32px', flexWrap:'wrap' },
  heroStat: { display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' },
  heroStatVal: { fontSize:'30px', fontWeight:'800', lineHeight:1 },
  heroStatLabel: { fontSize:'11px', color:'#6b7280', fontWeight:'500' },

  // Filter bar
  filterBar: { position:'sticky', top:0, zIndex:50, background:'rgba(8,11,20,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  filterInner: { maxWidth:'1200px', margin:'0 auto', padding:'12px 20px', display:'flex', gap:'12px', alignItems:'center' },
  searchWrap: { flex:1, display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'10px 14px' },
  searchInput: { flex:1, background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:'13px' },
  clearX: { background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:'2px', display:'flex', alignItems:'center' },
  filterBtn: { display:'flex', alignItems:'center', gap:'7px', padding:'10px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#9ca3af', fontSize:'13px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s' },
  filterBtnActive: { background:'rgba(102,126,234,0.12)', border:'1px solid rgba(102,126,234,0.3)', color:'#a78bfa' },
  filterCount: { background:'#667eea', color:'#fff', fontSize:'10px', fontWeight:'800', borderRadius:'50%', width:'17px', height:'17px', display:'flex', alignItems:'center', justifyContent:'center' },
  expandedFilters: { maxWidth:'1200px', margin:'0 auto', padding:'12px 20px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.06)' },
  select: { padding:'8px 12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#d1d5db', fontSize:'13px', outline:'none', cursor:'pointer' },
  clearBtn: { display:'flex', alignItems:'center', gap:'5px', background:'rgba(245,87,108,0.1)', border:'1px solid rgba(245,87,108,0.2)', color:'#f5576c', fontSize:'12px', fontWeight:'600', padding:'7px 12px', borderRadius:'8px', cursor:'pointer' },

  // Grid
  gridWrap: { maxWidth:'1200px', margin:'0 auto', padding:'32px 20px 60px', position:'relative', zIndex:1 },
  resultCount: { fontSize:'13px', color:'#6b7280', marginBottom:'24px' },
  clearLink: { background:'none', border:'none', color:'#667eea', fontSize:'12px', cursor:'pointer', marginLeft:'8px', fontWeight:'600' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'20px' },

  // Paper card
  paperCard: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', display:'flex', flexDirection:'column', transition:'transform 0.25s ease,box-shadow 0.25s ease', boxShadow:'0 4px 24px rgba(0,0,0,0.3)', cursor:'default' },
  thumb: { position:'relative', height:'150px', background:'#111827', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  thumbPlaceholder: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' },
  thumbIcon: { width:'56px', height:'56px', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center' },
  thumbOverlay: { position:'absolute', inset:0, background:'linear-gradient(to top,rgba(8,11,20,0.7) 0%,transparent 60%)', pointerEvents:'none' },
  badges: { position:'absolute', top:'10px', left:'10px', display:'flex', gap:'5px', flexWrap:'wrap' },
  badge: { fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'20px', color:'#fff', display:'flex', alignItems:'center', gap:'3px' },
  yearBadge: { position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)', color:'#fff', fontSize:'10px', fontWeight:'600', padding:'3px 8px', borderRadius:'8px' },

  cardBody: { padding:'16px', display:'flex', flexDirection:'column', flex:1, gap:'4px' },
  accentLine: { height:'2px', borderRadius:'2px', marginBottom:'10px' },
  cardTitle: { fontSize:'14px', fontWeight:'700', color:'#e5e7eb', margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  cardSub: { fontSize:'12px', color:'#6b7280', margin:0 },
  cardCode: { fontSize:'11px', fontFamily:'monospace', fontWeight:'600', margin:0 },
  cardStats: { display:'flex', gap:'14px', marginTop:'auto', paddingTop:'8px' },
  statItem: { display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#6b7280' },
  viewBtn: { display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'12px', padding:'9px', borderRadius:'10px', color:'#fff', fontSize:'12px', fontWeight:'700', textDecoration:'none', transition:'opacity 0.15s', border:'none', cursor:'pointer' },

  // Empty
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', gap:'12px' },
  emptyIcon: { width:'80px', height:'80px', borderRadius:'24px', background:'rgba(102,126,234,0.1)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'8px' },
  emptyTitle: { fontSize:'20px', fontWeight:'700', color:'#fff', margin:0 },
  emptySub: { fontSize:'14px', color:'#6b7280', margin:0, textAlign:'center' },
  uploadBtn: { display:'flex', alignItems:'center', gap:'8px', marginTop:'8px', padding:'12px 24px', borderRadius:'14px', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontSize:'13px', fontWeight:'700', textDecoration:'none', boxShadow:'0 8px 24px rgba(102,126,234,0.4)' },
};

export default CoursePapers;