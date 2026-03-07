import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, MapPin, Phone, Edit2, Save, X,
  FileText, Coins, Calendar, TrendingUp, MessageSquare,
  Search, Loader, CheckCircle, Clock, XCircle, Star
} from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const S = {
  root: {
    minHeight: '100vh',
    background: '#080b14',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob: (top, left, color, size = 400) => ({
    position: 'fixed', top, left,
    width: size, height: size, borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    pointerEvents: 'none', zIndex: 0,
  }),
  wrap: {
    position: 'relative', zIndex: 1,
    maxWidth: '1200px', margin: '0 auto',
    padding: '32px 16px 80px',
  },

  // Hero banner
  hero: {
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #1a1040 0%, #0f1a35 50%, #0a1628 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '40px 36px',
    marginBottom: '28px',
    display: 'flex', alignItems: 'center', gap: '28px',
    flexWrap: 'wrap', position: 'relative', overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 80% 50%, rgba(102,126,234,0.12) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  avatarRing: {
    width: '100px', height: '100px', borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #667eea, #f093fb)',
    padding: '3px', position: 'relative',
  },
  avatarInner: {
    width: '100%', height: '100%', borderRadius: '50%',
    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '36px', fontWeight: '800', color: '#fff',
  },
  onlineDot: {
    position: 'absolute', bottom: '4px', right: '4px',
    width: '18px', height: '18px', borderRadius: '50%',
    background: '#43e97b', border: '3px solid #080b14',
    boxShadow: '0 0 10px #43e97b',
  },
  heroInfo: { flex: 1, minWidth: '200px' },
  heroName: {
    fontSize: '28px', fontWeight: '800', color: '#fff',
    margin: '0 0 4px', letterSpacing: '-0.5px',
  },
  heroBio: { fontSize: '14px', color: '#6b7280', margin: '0 0 12px' },
  heroMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  heroMetaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' },
  heroBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  heroBtn: (gradient) => ({
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '10px 20px', borderRadius: '12px', border: 'none',
    background: gradient, color: '#fff', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  }),

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px', marginBottom: '24px',
  },

  // Card base
  card: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '24px',
    backdropFilter: 'blur(10px)',
  },

  // Stat mini cards
  statGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px',
  },
  statCard: (gradient, glow) => ({
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '10px',
    position: 'relative', overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  }),
  statIcon: (gradient, glow) => ({
    width: '42px', height: '42px', borderRadius: '12px',
    background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 6px 20px ${glow}`,
  }),
  statVal: { fontSize: '26px', fontWeight: '800', color: '#fff', lineHeight: 1 },
  statLbl: { fontSize: '11px', color: '#6b7280', fontWeight: '500' },

  // Section title
  secTitle: { fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 16px' },

  // Info rows
  infoRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '13px', color: '#9ca3af',
  },
  infoVal: { color: '#d1d5db', fontWeight: '500' },

  // Edit form
  input: {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '9px 14px', color: '#fff', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '9px 14px', color: '#fff', fontSize: '13px',
    outline: 'none', resize: 'vertical', minHeight: '70px', boxSizing: 'border-box',
  },
  formRow: { marginBottom: '12px' },
  formLabel: { fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '5px', display: 'block' },
  formBtns: { display: 'flex', gap: '8px', marginTop: '16px' },
  saveBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent', color: '#9ca3af', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },

  // Papers
  paperCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px', padding: '16px 18px',
    marginBottom: '10px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between', gap: '12px',
    transition: 'border-color 0.2s',
  },
  paperName: { fontSize: '14px', fontWeight: '600', color: '#e5e7eb', margin: '0 0 4px' },
  paperSub: { fontSize: '12px', color: '#6b7280', margin: 0 },

  statusChip: (status) => {
    const map = {
      approved: { bg: 'rgba(67,233,123,0.1)', color: '#43e97b', border: 'rgba(67,233,123,0.2)' },
      pending:  { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
      rejected: { bg: 'rgba(245,87,108,0.1)', color: '#f5576c', border: 'rgba(245,87,108,0.2)' },
    };
    const c = map[status] || map.pending;
    return {
      fontSize: '11px', fontWeight: '700', padding: '4px 12px',
      borderRadius: '20px', background: c.bg, color: c.color,
      border: `1px solid ${c.border}`, whiteSpace: 'nowrap',
    };
  },

  // Empty
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', gap: '10px',
    color: '#6b7280', fontSize: '13px',
  },
  emptyIcon: {
    width: '56px', height: '56px', borderRadius: '16px',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px',
  },

  // Modal overlay
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', backdropFilter: 'blur(6px)',
  },
  modal: {
    background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px', width: '100%', maxWidth: '440px',
    maxHeight: '85vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
  },
  modalHeader: {
    padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
    background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(240,147,251,0.1))',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 },
  modalSub: { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  modalClose: {
    background: 'rgba(255,255,255,0.08)', border: 'none',
    borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#9ca3af',
    display: 'flex', alignItems: 'center',
  },
  searchWrap: {
    padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  searchInner: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '10px 14px',
  },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none',
    outline: 'none', color: '#fff', fontSize: '13px',
  },
  usersList: { flex: 1, overflowY: 'auto', padding: '8px' },
  userRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', borderRadius: '12px', cursor: 'pointer',
    transition: 'background 0.15s',
    marginBottom: '4px',
  },
  userAvatar: (name) => {
    const colors = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#fee140'];
    const ci = name ? name.charCodeAt(0) % colors.length : 0;
    return {
      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
      background: `linear-gradient(135deg, ${colors[ci]}, ${colors[(ci+1)%colors.length]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '16px', fontWeight: '700', color: '#fff',
    };
  },
  userName: { fontSize: '14px', fontWeight: '600', color: '#e5e7eb', margin: '0 0 2px' },
  userEmail: { fontSize: '12px', color: '#6b7280', margin: 0 },
};

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [myPapers, setMyPapers] = useState([]);
  const [showChatModal, setShowChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '', bio: user?.bio || '',
    location: user?.location || '', phone: user?.phone || '',
    profileImage: user?.profileImage || ''
  });
  const { fetchChatHistory } = useChatContext();

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name||'', bio: user.bio||'', location: user.location||'', phone: user.phone||'', profileImage: user.profileImage||'' });
      fetchMyPapers();
    }
  }, [user]);

  const fetchMyPapers = async () => {
    try { const { data } = await api.get('/papers/my-papers'); setMyPapers(data.data); }
    catch (e) { console.error(e); }
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const { data } = await api.get('/chat/search/users', { params: { query: searchQuery } });
        setSearchResults(data.users || []);
      } catch { toast.error('Search failed'); }
      finally { setSearchLoading(false); }
    };
    const t = setTimeout(searchUsers, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleStartChat = (selectedUser) => {
    setShowChatModal(false); setSearchQuery(''); setSearchResults([]);
    const ids = [user._id, selectedUser._id].sort();
    const conversationId = `${ids[0]}-${ids[1]}`;
    navigate('/chat');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openChat', { detail: { conversationId, userId: selectedUser._id } }));
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await updateProfile(formData); setEditing(false); }
    catch (e) { console.error(e); }
  };

  const handleCancel = () => {
    setFormData({ name: user.name, bio: user.bio, location: user.location, phone: user.phone, profileImage: user.profileImage });
    setEditing(false);
  };

  const initial = (formData.name || user?.name || '?').charAt(0).toUpperCase();

  const statCards = [
    { label: 'Papers Uploaded', value: user?.papersUploaded || 0, icon: FileText, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', glow: 'rgba(102,126,234,0.4)' },
    { label: 'Coins Earned', value: `${user?.coins||0}/2`, icon: Coins, gradient: 'linear-gradient(135deg,#f6d365,#fda085)', glow: 'rgba(246,211,101,0.4)' },
    { label: 'Rank', value: `#${Math.floor(Math.random()*100)+1}`, icon: TrendingUp, gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', glow: 'rgba(67,233,123,0.4)' },
  ];

  const statusIcon = { approved: <CheckCircle size={12}/>, pending: <Clock size={12}/>, rejected: <XCircle size={12}/> };

  return (
    <div style={S.root}>
      {/* Blobs */}
      <div style={S.blob('-100px','-100px','rgba(102,126,234,0.1)',500)} />
      <div style={S.blob('40%','70%','rgba(240,147,251,0.08)',400)} />
      <div style={S.blob('70%','-50px','rgba(67,233,123,0.06)',350)} />

      <div style={S.wrap}>

        {/* ── Hero Banner ── */}
        <div style={S.hero}>
          <div style={S.heroBg} />
          <div style={S.avatarRing}>
            <div style={S.avatarInner}>{initial}</div>
            {user?.isOnline && <div style={S.onlineDot} />}
          </div>

          <div style={S.heroInfo}>
            {!editing ? (
              <>
                <h1 style={S.heroName}>{user?.name}</h1>
                <p style={S.heroBio}>{user?.bio || 'No bio yet'}</p>
                <div style={S.heroMeta}>
                  {user?.email && <span style={S.heroMetaItem}><Mail size={13} color="#667eea" />{user.email}</span>}
                  {user?.location && <span style={S.heroMetaItem}><MapPin size={13} color="#f093fb" />{user.location}</span>}
                  {user?.phone && <span style={S.heroMetaItem}><Phone size={13} color="#43e97b" />{user.phone}</span>}
                  {user?.joinedDate && <span style={S.heroMetaItem}><Calendar size={13} color="#fbbf24" />Joined {new Date(user.joinedDate).toLocaleDateString('en-US',{month:'short',year:'numeric'})}</span>}
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} style={{maxWidth:'480px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  <div style={S.formRow}>
                    <label style={S.formLabel}>NAME</label>
                    <input style={S.input} name="name" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="Your name" />
                  </div>
                  <div style={S.formRow}>
                    <label style={S.formLabel}>PHONE</label>
                    <input style={S.input} name="phone" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} placeholder="Phone" />
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  <div style={S.formRow}>
                    <label style={S.formLabel}>LOCATION</label>
                    <input style={S.input} name="location" value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} placeholder="City, Country" />
                  </div>
                  <div style={S.formRow}>
                    <label style={S.formLabel}>BIO</label>
                    <input style={S.input} name="bio" value={formData.bio} onChange={e=>setFormData({...formData,bio:e.target.value})} placeholder="Short bio" />
                  </div>
                </div>
                <div style={S.formBtns}>
                  <button type="submit" style={S.saveBtn}><Save size={14}/>Save Changes</button>
                  <button type="button" onClick={handleCancel} style={S.cancelBtn}><X size={14}/>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {!editing && (
            <div style={S.heroBtns}>
              <button style={S.heroBtn('linear-gradient(135deg,#667eea,#764ba2)')} onClick={()=>setEditing(true)}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
              ><Edit2 size={14}/>Edit Profile</button>
              <button style={S.heroBtn('linear-gradient(135deg,#f093fb,#f5576c)')} onClick={()=>setShowChatModal(true)}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
              ><MessageSquare size={14}/>Start Chat</button>
            </div>
          )}
        </div>

        {/* ── Stat Cards ── */}
        <div style={S.statGrid}>
          {statCards.map((c,i) => {
            const Icon = c.icon;
            return (
              <div key={i} style={S.statCard(c.gradient, c.glow)}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 16px 40px ${c.glow}`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}
              >
                <div style={S.statIcon(c.gradient, c.glow)}><Icon size={18} color="#fff"/></div>
                <div style={S.statVal}>{c.value}</div>
                <div style={S.statLbl}>{c.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── My Papers ── */}
        <div style={S.card}>
          <h2 style={S.secTitle}>📄 My Uploaded Papers</h2>
          {myPapers.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIcon}><FileText size={24} color="#667eea"/></div>
              <strong style={{color:'#e5e7eb'}}>No papers yet</strong>
              <span>Upload your first paper to get started</span>
            </div>
          ) : (
            myPapers.map(paper => (
              <div key={paper._id} style={S.paperCard}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(102,126,234,0.35)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
              >
                <div style={{display:'flex',alignItems:'center',gap:'12px',flex:1}}>
                  <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(102,126,234,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <FileText size={16} color="#667eea"/>
                  </div>
                  <div>
                    <p style={S.paperName}>{paper.name}</p>
                    <p style={S.paperSub}>{paper.branch?.name} · {paper.paperCode}</p>
                  </div>
                </div>
                <span style={S.statusChip(paper.status)}>
                  {statusIcon[paper.status]} {paper.status.charAt(0).toUpperCase()+paper.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ── Chat Modal ── */}
      {showChatModal && (
        <div style={S.overlay} onClick={e=>{if(e.target===e.currentTarget){setShowChatModal(false);setSearchQuery('');setSearchResults([]);}}}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <div>
                <p style={S.modalTitle}>Start a Conversation</p>
                <p style={S.modalSub}>Search and message any user</p>
              </div>
              <button style={S.modalClose} onClick={()=>{setShowChatModal(false);setSearchQuery('');setSearchResults([]);}}>
                <X size={16}/>
              </button>
            </div>

            <div style={S.searchWrap}>
              <div style={S.searchInner}>
                <Search size={15} color="#6b7280"/>
                <input
                  autoFocus
                  style={S.searchInput}
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e=>setSearchQuery(e.target.value)}
                />
                {searchLoading && <Loader size={14} color="#667eea" style={{animation:'spin 1s linear infinite'}}/>}
              </div>
            </div>

            <div style={S.usersList}>
              {!searchLoading && searchQuery.trim().length === 0 && (
                <div style={{...S.empty, padding:'32px'}}>
                  <div style={S.emptyIcon}><Search size={22} color="#667eea"/></div>
                  <span>Type a name or email to find users</span>
                </div>
              )}
              {!searchLoading && searchQuery.trim().length > 0 && searchResults.length === 0 && (
                <div style={{...S.empty, padding:'32px'}}>
                  <div style={S.emptyIcon}><User size={22} color="#9ca3af"/></div>
                  <span>No users found for "{searchQuery}"</span>
                </div>
              )}
              {searchResults.map(u => (
                <div key={u._id} style={S.userRow}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(102,126,234,0.08)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  onClick={()=>handleStartChat(u)}
                >
                  <div style={S.userAvatar(u.name)}>{u.name?.charAt(0).toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <p style={S.userName}>{u.name}</p>
                    <p style={S.userEmail}>{u.email}</p>
                  </div>
                  <MessageSquare size={15} color="#667eea" style={{opacity:0.6}}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}