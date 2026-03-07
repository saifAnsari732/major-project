import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Users, FileText, GraduationCap, Building,
  Check, X, Eye, TrendingUp, Plus, Shield,
  ChevronRight, Sparkles, BookOpen, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingPapers, setPendingPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, papersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/papers/pending')
      ]);
      setStats(statsRes.data.data.stats);
      setPendingPapers(papersRes.data.data);
    } catch {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePaper = async (paperId) => {
    try {
      await api.put(`/papers/${paperId}/approve`);
      toast.success('Paper approved!');
      fetchDashboardData();
    } catch { toast.error('Failed to approve paper'); }
  };

  const handleRejectPaper = async (paperId) => {
    try {
      await api.put(`/papers/${paperId}/reject`);
      toast.success('Paper rejected');
      fetchDashboardData();
    } catch { toast.error('Failed to reject paper'); }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingOrb} />
        <p style={styles.loadingText}>Loading Dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      glow: 'rgba(102,126,234,0.35)',
      bg: 'rgba(102,126,234,0.08)',
    },
    {
      label: 'Total Papers',
      value: stats?.totalPapers || 0,
      icon: FileText,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      glow: 'rgba(240,147,251,0.35)',
      bg: 'rgba(240,147,251,0.08)',
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: GraduationCap,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      glow: 'rgba(79,172,254,0.35)',
      bg: 'rgba(79,172,254,0.08)',
    },
    {
      label: 'Total Branches',
      value: stats?.totalBranches || 0,
      icon: Building,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      glow: 'rgba(67,233,123,0.35)',
      bg: 'rgba(67,233,123,0.08)',
    },
  ];

  return (
    <div style={styles.root}>
      {/* Ambient background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerBadge}>
              <Shield size={14} color="#a78bfa" />
              <span style={styles.headerBadgeText}>Admin Panel</span>
            </div>
            <h1 style={styles.headerTitle}>Dashboard</h1>
            <p style={styles.headerSub}>Monitor, manage and control platform activity</p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => navigate('/CreateCourse')}
              style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <BookOpen size={16} />
              <span>Add Course</span>
            </button>
            <button
              onClick={() => navigate('/CreateBranch')}
              style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Layers size={16} />
              <span>Add Branch</span>
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={styles.statsGrid}>
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                style={{ ...styles.statCard, animationDelay: `${i * 0.1}s` }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 60px ${card.glow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
                }}
              >
                <div style={{ ...styles.statIconWrap, background: card.bg }}>
                  <div style={{ ...styles.statIconInner, background: card.gradient, boxShadow: `0 8px 24px ${card.glow}` }}>
                    <Icon size={22} color="#fff" />
                  </div>
                </div>
                <div style={styles.statInfo}>
                  <span style={styles.statValue}>{card.value.toLocaleString()}</span>
                  <span style={styles.statLabel}>{card.label}</span>
                </div>
                <div style={{ ...styles.statAccent, background: card.gradient }} />
              </div>
            );
          })}
        </div>

        {/* ── Pending Papers ── */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleWrap}>
              <Sparkles size={18} color="#f093fb" />
              <h2 style={styles.sectionTitle}>Pending Papers</h2>
            </div>
            <div style={styles.pendingBadge}>
              <span style={styles.pendingDot} />
              <span style={styles.pendingCount}>{pendingPapers.length} awaiting review</span>
            </div>
          </div>

          {pendingPapers.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <TrendingUp size={32} color="#667eea" />
              </div>
              <p style={styles.emptyTitle}>All caught up!</p>
              <p style={styles.emptySub}>No pending papers to review right now.</p>
            </div>
          ) : (
            <div style={styles.papersList}>
              {pendingPapers.map((paper, i) => (
                <div
                  key={paper._id}
                  style={{ ...styles.paperCard, animationDelay: `${i * 0.07}s` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(102,126,234,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                >
                  {/* Left accent bar */}
                  <div style={styles.paperAccentBar} />

                  <div style={styles.paperBody}>
                    <div style={styles.paperInfo}>
                      <h3 style={styles.paperName}>{paper.name}</h3>
                      <div style={styles.paperMeta}>
                        <span style={styles.metaChip}>📄 {paper.paperCode}</span>
                        <span style={styles.metaChip}>🏛️ {paper.branch?.name}</span>
                        <span style={styles.metaChip}>📅 Year {paper.year}</span>
                        <span style={styles.metaChip}>📚 Sem {paper.semester}</span>
                      </div>
                      <p style={styles.paperUploader}>
                        Uploaded by <strong style={{ color: '#a78bfa' }}>{paper.uploadedBy?.name}</strong>
                        <span style={{ color: '#6b7280' }}> · {paper.uploadedBy?.email}</span>
                      </p>
                      {paper.backSideFile?.url && (
                        <span
                          onClick={() => window.open(paper.backSideFile.url, '_blank')}
                          style={styles.backLink}
                        >
                          View Back Side →
                        </span>
                      )}
                    </div>

                    <div style={styles.paperActions}>
                      <button
                        onClick={() => window.open(paper.paperFile.url, '_blank')}
                        style={{ ...styles.paperBtn, ...styles.btnView }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => navigate(`/admin/papers/${paper._id}/edit`)}
                        style={{ ...styles.paperBtn, ...styles.btnEdit }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <FileText size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleApprovePaper(paper._id)}
                        style={{ ...styles.paperBtn, ...styles.btnApprove }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectPaper(paper._id)}
                        style={{ ...styles.paperBtn, ...styles.btnReject }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
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

const styles = {
  root: {
    minHeight: '100vh',
    background: '#0a0a0f',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  blob1: {
    position: 'fixed', top: '-120px', left: '-120px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  blob2: {
    position: 'fixed', top: '30%', right: '-100px',
    width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(240,147,251,0.1) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  blob3: {
    position: 'fixed', bottom: '-80px', left: '30%',
    width: '450px', height: '450px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(67,233,123,0.07) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  loadingScreen: {
    minHeight: '100vh', background: '#0a0a0f',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '20px',
  },
  loadingOrb: {
    width: '60px', height: '60px', borderRadius: '50%',
    border: '3px solid rgba(102,126,234,0.2)',
    borderTop: '3px solid #667eea',
    animation: 'spin 1s linear infinite',
  },
  loadingText: { color: '#6b7280', fontSize: '14px' },

  container: {
    position: 'relative', zIndex: 1,
    maxWidth: '1280px', margin: '0 auto',
    padding: '32px 20px 60px',
  },

  // Header
  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', flexWrap: 'wrap',
    gap: '20px', marginBottom: '40px',
  },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '8px' },
  headerBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: '20px', padding: '4px 12px', width: 'fit-content',
  },
  headerBadgeText: { fontSize: '12px', color: '#a78bfa', fontWeight: '600', letterSpacing: '0.5px' },
  headerTitle: {
    fontSize: '38px', fontWeight: '800', margin: '0',
    background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px',
  },
  headerSub: { margin: '0', fontSize: '14px', color: '#6b7280' },
  headerActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '12px', border: 'none',
    color: '#fff', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', transition: 'transform 0.2s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px', marginBottom: '32px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px', padding: '24px',
    display: 'flex', alignItems: 'center', gap: '16px',
    position: 'relative', overflow: 'hidden',
    cursor: 'default', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  statIconWrap: {
    width: '56px', height: '56px', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statIconInner: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#fff', lineHeight: 1 },
  statLabel: { fontSize: '12px', color: '#6b7280', fontWeight: '500', marginTop: '4px' },
  statAccent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '2px', opacity: 0.6,
  },

  // Section
  section: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '24px', padding: '28px',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  sectionTitleWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  sectionTitle: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#fff' },
  pendingBadge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(245,87,108,0.1)', border: '1px solid rgba(245,87,108,0.2)',
    borderRadius: '20px', padding: '6px 14px',
  },
  pendingDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: '#f5576c',
    boxShadow: '0 0 6px #f5576c',
    animation: 'pulse 1.5s infinite',
  },
  pendingCount: { fontSize: '12px', color: '#f5576c', fontWeight: '600' },

  // Empty
  emptyState: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px 20px', gap: '12px',
  },
  emptyIcon: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: 'rgba(102,126,234,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '8px',
  },
  emptyTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' },
  emptySub: { margin: 0, fontSize: '14px', color: '#6b7280' },

  // Papers list
  papersList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  paperCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', overflow: 'hidden',
    display: 'flex', transition: 'border-color 0.2s ease',
    position: 'relative',
  },
  paperAccentBar: {
    width: '4px', flexShrink: 0,
    background: 'linear-gradient(180deg, #667eea, #f093fb)',
  },
  paperBody: {
    flex: 1, padding: '20px 20px 20px 20px',
    display: 'flex', flexWrap: 'wrap',
    alignItems: 'center', justifyContent: 'space-between', gap: '16px',
  },
  paperInfo: { flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' },
  paperName: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' },
  paperMeta: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  metaChip: {
    fontSize: '11px', color: '#9ca3af',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', padding: '3px 10px',
  },
  paperUploader: { margin: 0, fontSize: '12px', color: '#6b7280' },
  backLink: {
    fontSize: '12px', color: '#667eea',
    cursor: 'pointer', fontWeight: '600',
    textDecoration: 'none',
  },

  // Buttons
  paperActions: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' },
  paperBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '10px', border: 'none',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    transition: 'opacity 0.15s ease',
    color: '#fff',
  },
  btnView: { background: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  btnEdit: { background: 'linear-gradient(135deg, #f6d365, #fda085)' },
  btnApprove: { background: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  btnReject: { background: 'linear-gradient(135deg, #f5576c, #f093fb)' },
};

export default AdminDashboard;