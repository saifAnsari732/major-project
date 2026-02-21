import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/* ─── Injected Styles ─────────────────────────────────────────────────────── */
const styles = `
  /* ✅ NOTE: Google Fonts are now loaded via <GoogleFontsLoader /> component
     (injected <link> tags) instead of @import — much more reliable in React. */

  :root {
    --ink: #0d0d12;
    --surface: #ffffff;
    --glass: rgba(255,255,255,0.72);
    --border: rgba(0,0,0,0.08);
    --muted: #8a8fa8;
    --accent: #5b4bff;
    --accent2: #ff4b91;
    --accent-soft: rgba(91,75,255,0.12);
    --green: #00c98d;
    --code-bg: #0f1117;
    --code-text: #c9d1d9;
    --code-num: #5b4bff;
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
    --shadow-md: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    --shadow-lg: 0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1);
    --radius: 20px;
    --radius-sm: 12px;
  }

  /* ── Container ── */
  .cw-root {
    position: fixed;
    bottom: 70px;
    right: 28px;
    z-index: 9999;
    /* ✅ Reliable font fallback stack */
    font-family: 'DM Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  }
@media (max-width: 480px) {
    .cw-root {
  top: 560px;
      right: 16px;
      bottom: auto;
      background: teal;
      border: none;
      border-radius: 10px 10px 0px  !important;
    }
}

  /* ── Popup ── */
  .cw-popup {
    position: absolute;
    bottom: 76px;
    right: 0;
    width: 420px;
    max-width: calc(100vw - 48px);
    height: 620px;
    // background: red;
    // background: linear-gradient(160deg, #1a0533 0%, #0d0d1a 45%, #1a0520 10%);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transform-origin: bottom right;
    animation: popIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.88) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ── Header ── */
  .cw-header {
    padding: 18px 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .cw-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 120% at 110% -20%, rgba(91,75,255,0.45) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at -10% 110%, rgba(255,75,145,0.3) 0%, transparent 55%);
    pointer-events: none;
  }

  .cw-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .cw-avatar {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', 'Georgia', serif;
    font-weight: 800;
    font-size: 16px;
    color: #fff;
    position: relative;
    box-shadow: 0 4px 16px rgba(91,75,255,0.4);
    flex-shrink: 0;
  }

  .cw-avatar-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 13px;
    height: 13px;
    background: var(--green);
    border: 2.5px solid var(--ink);
    border-radius: 50%;
    animation: breathe 2.5s ease-in-out infinite;
  }

  @keyframes breathe {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,201,141,0.4); }
    50%       { box-shadow: 0 0 0 5px rgba(0,201,141,0); }
  }

  .cw-header-info { display: flex; flex-direction: column; gap: 2px; }

  .cw-header-name {
    font-family: 'Syne', 'Georgia', serif;
    font-weight: 700;
    font-size: 15px;
    color: #fff;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .cw-header-status {
    font-size: 11.5px;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.2px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .cw-status-dot {
    width: 6px; height: 6px;
    background: var(--green);
    border-radius: 50%;
    display: inline-block;
  }

  .cw-close {
    position: relative;
    z-index: 1;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.8);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .cw-close:hover {
    background: rgba(255,255,255,0.2);
    color: #fff;
    transform: rotate(90deg);
  }

  .cw-close svg { width: 16px; height: 16px; }

  /* ────────────────────────────────────────────────────────
     ✅ CHANGED: Chat Body Background
     Old → plain #f5f5f9 grey
     New → soft blue-purple-pink gradient mesh
           + frosted-glass bot bubbles to match
  ──────────────────────────────────────────────────────── */
  .cw-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    position: relative;

    background:
      radial-gradient(ellipse 70% 55% at 10% 15%,  rgba(99,179,237,0.30)  0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 88% 82%,  rgba(183,148,246,0.32) 0%, transparent 55%),
      radial-gradient(ellipse 50% 65% at 52% 48%,  rgba(248,180,217,0.20) 0%, transparent 65%),
      linear-gradient(155deg, #dbeafe 0%, #ede9fe 52%, #fce7f3 100%);

    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* subtle grain overlay for depth */
  .cw-body::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
  }

  /* keep message rows above the grain */
  .cw-row { position: relative; z-index: 1; }

  .cw-body::-webkit-scrollbar { width: 4px; }
  .cw-body::-webkit-scrollbar-track { background: transparent; }
  .cw-body::-webkit-scrollbar-thumb { background: rgba(91,75,255,0.22); border-radius: 4px; }

  /* ── Message Rows ── */
  .cw-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    max-width: 94%;
  }

  .cw-row.bot  { align-self: flex-start; }
  .cw-row.user { align-self: flex-end; flex-direction: row-reverse; }

  .cw-msg-avatar {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', 'Georgia', serif;
    font-weight: 800;
    font-size: 12px;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(91,75,255,0.25);
  }

  /* ── Bubbles ── */
  .cw-bubble {
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 13.5px;
    line-height: 1.55;
    max-width: 100%;
    word-break: break-word;
    position: relative;
  }

  /* ✅ Bot bubble: frosted-glass to complement the gradient bg */
  .cw-bubble.bot {
    background: rgba(255, 255, 255, 0.80);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: var(--ink);
    border: 1px solid rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 12px rgba(99, 102, 241, 0.10), var(--shadow-sm);
    border-bottom-left-radius: 5px;
  }

  .cw-bubble.user {
    background-image: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
    color: #fff;
    border-bottom-right-radius: 5px;
  }

  .cw-bubble p { margin: 0 0 4px 0; }

  .cw-time {
    font-size: 10px;
    opacity: 0.45;
    display: block;
    text-align: right;
    margin-top: 3px;
  }

  /* ── Code Block ── */
  .cw-code-block {
    background: var(--code-bg);
    border-radius: 12px;
    overflow: hidden;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
    font-size: 12.5px;
    line-height: 1.7;
    border: 1px solid rgba(255,255,255,0.06);
    max-height: 380px;
    overflow-y: auto;
  }

  .cw-code-block::-webkit-scrollbar { width: 6px; }
  .cw-code-block::-webkit-scrollbar-track { background: #0a0d14; }
  .cw-code-block::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 4px; }

  .cw-code-topbar {
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .cw-dot { width: 10px; height: 10px; border-radius: 50%; }
  .cw-dot.r { background: #ff5f57; }
  .cw-dot.y { background: #febc2e; }
  .cw-dot.g { background: #28c840; }

  .cw-code-inner { padding: 12px 0; }

  .cw-line {
    display: flex;
    gap: 0;
    padding: 0 14px;
    transition: background 0.15s;
  }

  .cw-line:hover { background: rgba(255,255,255,0.03); }

  .cw-ln {
    min-width: 38px;
    color: var(--code-num);
    font-weight: 600;
    opacity: 0.7;
    text-align: right;
    padding-right: 16px;
    user-select: none;
    flex-shrink: 0;
    font-size: 11.5px;
    padding-top: 1px;
  }

  .cw-lt { color: var(--code-text); flex: 1; white-space: pre-wrap; word-break: break-all; }

  /* ── Typing ── */
  .cw-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 4px;
  }

  .cw-typing span {
    width: 7px; height: 7px;
    background: var(--muted);
    border-radius: 50%;
    display: inline-block;
    animation: typingBounce 1.2s infinite ease-in-out;
  }

  .cw-typing span:nth-child(2) { animation-delay: 0.15s; }
  .cw-typing span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes typingBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40%           { transform: translateY(-6px); opacity: 1; }
  }

  /* ── Input Area ── */
  .cw-footer {
    background: #fff;
    border-top: 1px solid var(--border);
    padding: 12px 14px;
    flex-shrink: 0;
  }

  .cw-file-preview {
    margin-bottom: 10px;
    padding: 10px 12px;
    background: var(--accent-soft);
    border: 1px solid rgba(91,75,255,0.2);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cw-file-preview-img {
    width: 52px; height: 52px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid rgba(91,75,255,0.2);
  }

  .cw-file-icon { font-size: 22px; flex-shrink: 0; }

  .cw-file-meta { flex: 1; min-width: 0; }
  .cw-file-name {
    margin: 0;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cw-file-size { margin: 2px 0 0; font-size: 11px; color: var(--muted); }

  .cw-remove-file {
    background: rgba(255,75,145,0.15);
    color: var(--accent2);
    border: none;
    width: 24px; height: 24px;
    border-radius: 50%;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    transition: all 0.2s;
    flex-shrink: 0;
    font-weight: 700;
  }

  .cw-remove-file:hover { background: var(--accent2); color: #fff; }

  .cw-input-row { display: flex; gap: 10px; align-items: center; }

  .cw-input-wrap {
    flex: 1;
    position: relative;
    background: #f5f5f9;
    border: 1.5px solid var(--border);
    border-radius: 50px;
    display: flex;
    align-items: center;
    transition: border-color 0.2s, box-shadow 0.2s;
    overflow: hidden;
  }

  .cw-input-wrap:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(91,75,255,0.1);
    background: #fff;
  }

  .cw-text-input {
    flex: 1;
    padding: 10px 8px 10px 16px;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif;
    font-size: 13.5px;
    color: var(--ink);
  }

  .cw-text-input::placeholder { color: #b0b5c8; }
  .cw-text-input:disabled { opacity: 0.5; }

  .cw-input-icons {
    display: flex;
    gap: 2px;
    padding-right: 8px;
    align-items: center;
  }

  .cw-icon-btn {
    width: 30px; height: 30px;
    background: none;
    border: none;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: var(--muted);
    transition: all 0.2s;
    font-size: 16px;
  }

  .cw-icon-btn:hover { background: var(--accent-soft); color: var(--accent); }
  .cw-icon-btn svg { width: 16px; height: 16px; }
  .cw-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .cw-send {
    width: 42px; height: 42px;
    background: var(--ink);
    border: none;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: #fff;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: var(--shadow-sm);
  }

  .cw-send.active {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    box-shadow: 0 4px 16px rgba(91,75,255,0.35);
  }

  .cw-send:hover:not(:disabled) { transform: scale(1.1) rotate(8deg); }
  .cw-send:disabled { background: #d1d5db; cursor: not-allowed; }
  .cw-send svg { width: 17px; height: 17px; }

  .cw-powered {
    text-align: center;
    margin-top: 8px;
    font-size: 10.5px;
    color: #c0c4d6;
    letter-spacing: 0.3px;
  }

  /* ── FAB ── */
  .cw-fab {
    width: 58px; height: 58px;
    background: var(--ink);
    border: none;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: #fff;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 8px 28px rgba(0,0,0,0.28), 0 3px 10px rgba(0,0,0,0.18);
  }

  .cw-fab::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
  }

  .cw-fab:hover::after { opacity: 1; }
  .cw-fab:hover { transform: scale(1.1) translateY(-2px); }
  .cw-fab.open::after { opacity: 1; }
  .cw-fab.open { transform: rotate(135deg); box-shadow: 0 8px 28px rgba(91,75,255,0.4); }
  .cw-fab.open:hover { transform: rotate(135deg) scale(1.1); }

  .cw-fab-icon {
    position: relative;
    z-index: 1;
    display: flex; align-items: center; justify-content: center;
  }

  .cw-fab svg { width: 24px; height: 24px; }

  .cw-badge {
    position: absolute;
    top: 1px; right: 1px;
    width: 20px; height: 20px;
    background: var(--accent2);
    border: 2px solid #fff;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    z-index: 2;
    animation: badgePulse 2s infinite;
  }

  @keyframes badgePulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.2); }
  }

  @media (max-width: 480px) {
    .cw-root { bottom: 20px; right: 14px; }
    .cw-popup { width: calc(100vw - 28px); height: 520px; bottom: 70px; }
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatTime = (iso) => {
  if (!iso) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const addLineNumbers = (text) =>
  text.split('\n').map((line, i) => ({ number: i + 1, text: line }));

/* ─────────────────────────────────────────────────────────────────────────────
   ✅ GoogleFontsLoader
   Injects <link> tags into <head> — far more reliable than @import inside
   a JS-injected <style> tag, which browsers often block or delay.
───────────────────────────────────────────────────────────────────────────── */
const GoogleFontsLoader = () => {
  useEffect(() => {
    if (document.querySelector('[data-cw-fonts]')) return;

    const pc1 = document.createElement('link');
    pc1.rel = 'preconnect';
    pc1.href = 'https://fonts.googleapis.com';

    const pc2 = document.createElement('link');
    pc2.rel = 'preconnect';
    pc2.href = 'https://fonts.gstatic.com';
    pc2.crossOrigin = 'anonymous';

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap';
    link.setAttribute('data-cw-fonts', '1');

    document.head.append(pc1, pc2, link);
  }, []);

  return null;
};

/* ─── Sub-Components ──────────────────────────────────────────────────────── */
const TypingBubble = () => (
  <div className="cw-row bot">
    <div className="cw-msg-avatar">S</div>
    <div className="cw-bubble bot">
      <div className="cw-typing">
        <span /><span /><span />
      </div>
    </div>
  </div>
);

const CodeBlock = ({ text }) => (
  <div className="cw-code-block">
    <div className="cw-code-topbar">
      <div className="cw-dot r" /><div className="cw-dot y" /><div className="cw-dot g" />
    </div>
    <div className="cw-code-inner">
      {addLineNumbers(text).map((line, idx) => (
        <div key={idx} className="cw-line">
          <span className="cw-ln">{line.number}</span>
          <span className="cw-lt">{line.text || '\u00A0'}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! 👋", sender: "bot" },
    { id: 2, text: "Start a chat. We're here to help you 24/7.", sender: "bot" },
    { id: 3, text: "My name is Code Bot. How can I assist you today?", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text: userMessage || (selectedFile ? `📎 ${selectedFile.name}` : 'Question...'),
      sender: 'user',
    }]);
    setInputText('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', userMessage);
      if (selectedFile) formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:5000/api/gemini', formData, {
        headers: { 'Content-Type': selectedFile ? 'multipart/form-data' : 'application/json' },
      });

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: response.data.answer || "I received your message!",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      }]);
      setSelectedFile(null);
      setFilePreview(null);
    } catch {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e);
  };

  const isLong = (text) => text && text.length > 100;

  return (
    <>
      <style>{styles}</style>
      <GoogleFontsLoader />

      <div className="cw-root bg-green-400 rounded-2xl">
        {isOpen && (
          <div className="cw-popup border-blue-300 shadow-lg">
            {/* Header */}
            <div className="cw-header">
              <div className="cw-header-left">
                <div className="cw-avatar">
                  S
                  <div className="cw-avatar-dot" />
                </div>
                <div className="cw-header-info">
                  <div className="cw-header-name">Saif Bot</div>
                  <div className="cw-header-status">
                    <span className="cw-status-dot" />
                    Online · 24/7 Support
                  </div>
                </div>
              </div>
              <button className="cw-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Body — new gradient background */}
            <div className="cw-body bg-lime-300">
              {messages.map((msg) => (
                <div key={msg.id} className={`cw-row ${msg.sender}`}>
                  {msg.sender === 'bot' && <div className="cw-msg-avatar">S</div>}
                  <div className={`cw-bubble ${msg.sender}`}>
                    {msg.sender === 'bot' && isLong(msg.text) ? (
                      <CodeBlock text={msg.text} />
                    ) : (
                      <>
                        <p className="cw-msg-text">{msg.text}</p>
                        <span className="cw-time">{formatTime(msg.timestamp)}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && <TypingBubble />}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="cw-footer">
              {selectedFile && (
                <div className="cw-file-preview">
                  {filePreview ? (
                    <img src={filePreview} alt="preview" className="cw-file-preview-img" />
                  ) : (
                    <span className="cw-file-icon">📎</span>
                  )}
                  <div className="cw-file-meta">
                    <p className="cw-file-name">{selectedFile.name}</p>
                    <p className="cw-file-size">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button className="cw-remove-file" onClick={removeFile} title="Remove">✕</button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="cw-input-row">
                <div className="cw-input-wrap">
                  <input
                    type="text"
                    className="cw-text-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedFile ? "Ask about your file…" : "Type a message…"}
                    autoFocus
                    disabled={isLoading}
                  />
                  <div className="cw-input-icons">
                    <button type="button" className="cw-icon-btn" disabled={isLoading}>
                      <span>😊</span>
                    </button>
                    <button
                      type="button"
                      className="cw-icon-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      title="Attach file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                      </svg>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                    style={{ display: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={(!inputText.trim() && !selectedFile) || isLoading}
                  className={`cw-send ${(inputText.trim() || selectedFile) && !isLoading ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
              <div className="cw-powered">Powered by Gemini AI</div>
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          className={`cw-fab !bg-gradient-to-r from-blue-500 to-purple-500 ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle chat"
        >
          <div className="cw-fab-icon">
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            ) : (
              <h1 className='text-3xl font-serif  font-semibold'>Ai</h1>
            )}
          </div>
          {/* {!isOpen && <span className="cw-badge">1</span>} */}
        </button>
      </div>
    </>
  );
};

export default ChatWidget;