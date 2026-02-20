import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// ─── Inline Styles ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@400;500;600;700&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f1117; --surface: #1a1d27; --surface2: #22263a; --border: #2e3350;
    --accent: #4f8ef7; --accent2: #7c3aed; --green: #10b981;
    --text: #e2e8f0; --text-muted: #8892a4;
    --radius: 18px; --font-ui: 'Outfit', sans-serif; --font-mono: 'IBM Plex Mono', monospace;
  }

  .cw-root { position: fixed; bottom: 28px; right: 28px; z-index: 9999; font-family: var(--font-ui); }

  .cw-toggle {
    width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
    background: linear-gradient(135deg, #4f8ef7, #7c3aed);
    box-shadow: 0 8px 32px rgba(79,142,247,.45);
    display: flex; align-items: center; justify-content: center;
    transition: transform .2s, box-shadow .2s; position: relative;
  }
  .cw-toggle:hover { transform: scale(1.08); }
  .cw-toggle svg { width: 26px; height: 26px; fill: #fff; }
  .cw-badge {
    position: absolute; top: -4px; right: -4px;
    width: 20px; height: 20px; border-radius: 50%;
    background: #4f8ef7; color: #fff; font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; border: 2px solid #0f1117;
  }

  .cw-panel {
    position: absolute; bottom: 76px; right: 0; width: 430px; height: 650px;
    background: var(--bg); border: 1px solid var(--border); border-radius: 24px;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,.6);
    animation: panelIn .25s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes panelIn { from { opacity:0; transform:scale(.93) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .cw-header {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 14px 18px; display: flex; align-items: center; gap: 12px; flex-shrink: 0;
  }
  .cw-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, #4f8ef7, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 16px; color: #fff; position: relative; flex-shrink: 0;
  }
  .cw-dot {
    position: absolute; bottom: 1px; right: 1px; width: 10px; height: 10px;
    border-radius: 50%; background: #10b981; border: 2px solid var(--surface);
  }
  .cw-hname { font-size: 15px; font-weight: 700; color: var(--text); }
  .cw-hsub { font-size: 11px; color: var(--green); margin-top: 1px; }
  .cw-hright { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .cw-mtoggle {
    background: rgba(79,142,247,.12); border: 1px solid rgba(79,142,247,.25);
    border-radius: 100px; padding: 4px 10px; font-size: 11px; font-family: var(--font-mono);
    color: var(--accent); cursor: pointer; transition: background .15s; white-space: nowrap;
  }
  .cw-mtoggle.on { background: rgba(79,142,247,.25); border-color: var(--accent); }
  .cw-closebtn {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    background: var(--surface2); color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .cw-closebtn:hover { background: var(--border); color: var(--text); }
  .cw-closebtn svg { width: 16px; height: 16px; fill: currentColor; }

  .cw-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .cw-body::-webkit-scrollbar { width: 4px; }
  .cw-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .cw-row { display: flex; gap: 8px; }
  .cw-row.user { flex-direction: row-reverse; }
  .cw-mavatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; align-self: flex-end;
    background: linear-gradient(135deg, #4f8ef7, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff;
  }
  .cw-bubble {
    max-width: 80%; padding: 11px 14px; border-radius: var(--radius);
    font-size: 13.5px; line-height: 1.65; color: var(--text); word-break: break-word;
  }
  .cw-bubble.bot { background: #1e2235; border: 1px solid var(--border); border-bottom-left-radius: 4px; }
  .cw-bubble.user { background: linear-gradient(135deg, #4f8ef7, #7c3aed); border-bottom-right-radius: 4px; }
  .cw-time { font-size: 10px; color: rgba(255,255,255,.4); margin-top: 5px; display: block; }

  /* Math */
  .cw-math-block {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px; margin: 8px 0; overflow-x: auto; text-align: center;
  }
  .cw-math-err { color: #f87171; font-size: 12px; font-family: var(--font-mono); }

  /* Code */
  .cw-code { background: #0d1117; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin: 8px 0; }
  .cw-code-hdr {
    background: var(--surface2); padding: 5px 12px;
    font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);
    display: flex; justify-content: space-between; align-items: center;
  }
  .cw-cpybtn { background: none; border: none; color: var(--accent); cursor: pointer; font-size: 11px; font-family: var(--font-mono); }
  .cw-code-body { padding: 12px; overflow-x: auto; }
  .cw-code-body code { font-family: var(--font-mono); font-size: 12.5px; color: #a9b1d6; white-space: pre; }
  .cw-inline-code {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 4px;
    padding: 1px 5px; font-family: var(--font-mono); font-size: 12px; color: #7ee787;
  }

  /* Typing */
  .cw-typing { display: flex; gap: 5px; padding: 4px 0; }
  .cw-typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: bounce 1.2s infinite; }
  .cw-typing span:nth-child(2) { animation-delay:.2s; } .cw-typing span:nth-child(3) { animation-delay:.4s; }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4;} 40%{transform:translateY(-6px);opacity:1;} }

  /* Input */
  .cw-foot { background: var(--surface); border-top: 1px solid var(--border); padding: 12px 14px; flex-shrink: 0; }
  .cw-mathkeys { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; }
  .cw-mkey {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 7px;
    padding: 3px 9px; font-size: 11px; font-family: var(--font-mono);
    color: var(--text-muted); cursor: pointer; transition: all .12s;
  }
  .cw-mkey:hover { border-color: var(--accent); color: var(--accent); }
  .cw-fpreview {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 7px 10px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted);
  }
  .cw-fpreview img { width: 36px; height: 36px; object-fit: cover; border-radius: 5px; }
  .cw-fremove { margin-left: auto; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 15px; }
  .cw-form { display: flex; gap: 8px; align-items: flex-end; }
  .cw-inwrap {
    flex: 1; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 12px; display: flex; align-items: flex-end; gap: 2px; padding: 4px 4px 4px 12px;
    transition: border-color .2s;
  }
  .cw-inwrap:focus-within { border-color: var(--accent); }
  .cw-input {
    flex: 1; background: none; border: none; outline: none; color: var(--text);
    font-size: 13.5px; font-family: var(--font-ui); padding: 7px 0;
    resize: none; max-height: 100px; line-height: 1.5; min-height: 34px;
  }
  .cw-input::placeholder { color: var(--text-muted); }
  .cw-attachbtn {
    width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer;
    background: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center;
  }
  .cw-attachbtn:hover { color: var(--accent); }
  .cw-attachbtn svg { width: 17px; height: 17px; fill: currentColor; }
  .cw-sendbtn {
    width: 42px; height: 42px; border-radius: 11px; border: none; cursor: pointer;
    background: linear-gradient(135deg, #4f8ef7, #7c3aed);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    transition: opacity .2s, transform .15s;
  }
  .cw-sendbtn:disabled { opacity: .35; cursor: not-allowed; }
  .cw-sendbtn:not(:disabled):hover { transform: scale(1.06); }
  .cw-sendbtn svg { width: 17px; height: 17px; fill: #fff; }
  .cw-credits { text-align: center; font-size: 10.5px; color: var(--text-muted); margin-top: 8px; }

  /* Markdown */
  .cw-md h1 { font-size: 16px; color: #fff; margin: 6px 0 3px; }
  .cw-md h2 { font-size: 14px; color: #fff; margin: 5px 0 2px; }
  .cw-md h3 { font-size: 13px; color: #cbd5e1; margin: 4px 0 2px; }
  .cw-md p { margin: 3px 0; }
  .cw-md ul, .cw-md ol { padding-left: 16px; margin: 4px 0; }
  .cw-md li { margin: 2px 0; }
  .cw-md strong { color: #fff; font-weight: 600; }
  .cw-md em { color: #a9b1d6; }
  .cw-md hr { border: none; border-top: 1px solid var(--border); margin: 7px 0; }
  .cw-md table { border-collapse: collapse; width: 100%; margin: 6px 0; font-size: 12px; }
  .cw-md th { background: var(--surface2); padding: 5px 9px; border: 1px solid var(--border); text-align: left; }
  .cw-md td { padding: 4px 9px; border: 1px solid var(--border); }
`;

// ─── External library loaders ─────────────────────────────────────────────────
let _katexP = null;
const loadKaTeX = () => {
  if (_katexP) return _katexP;
  _katexP = new Promise(res => {
    if (window.katex) return res(window.katex);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css';
    document.head.appendChild(link);
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js';
    s.onload = () => res(window.katex);
    document.head.appendChild(s);
  });
  return _katexP;
};

let _mathP = null;
const loadMathJS = () => {
  if (_mathP) return _mathP;
  _mathP = new Promise(res => {
    if (window.math) return res(window.math);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.2/math.min.js';
    s.onload = () => res(window.math);
    document.head.appendChild(s);
  });
  return _mathP;
};

// ─── Render LaTeX safely ──────────────────────────────────────────────────────
const tex = (latex, display = false) => {
  if (!window.katex) return { __html: latex };
  try {
    return { __html: window.katex.renderToString(latex.trim(), { displayMode: display, throwOnError: false }) };
  } catch {
    return { __html: `<span class="cw-math-err">[LaTeX error: ${latex}]</span>` };
  }
};

// ─── Code Block ───────────────────────────────────────────────────────────────
const CodeBlock = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="cw-code">
      <div className="cw-code-hdr">
        <span>{lang || 'code'}</span>
        <button className="cw-cpybtn" onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true); setTimeout(() => setCopied(false), 1800);
        }}>{copied ? '✓ copied' : 'copy'}</button>
      </div>
      <div className="cw-code-body"><code>{code.trim()}</code></div>
    </div>
  );
};

// ─── Markdown + Math Renderer ─────────────────────────────────────────────────
const MathMessage = ({ text }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { loadKaTeX().then(() => setReady(true)); }, []);

  if (!ready) return <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>;

  // tokenise the whole text
  const tokens = [];
  const regex = /(\$\$[\s\S]*?\$\$|```[\w]*\n[\s\S]*?```|`[^`\n]+`|\$[^$\n]+?\$)/g;
  let last = 0, m, k = 0;

  const renderTextSegment = (seg, key) => {
    // Convert markdown → HTML
    const html = seg
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) tokens.push(renderTextSegment(text.slice(last, m.index), k++));
    const t = m[0];
    if (t.startsWith('$$')) {
      tokens.push(<div key={k++} className="cw-math-block" dangerouslySetInnerHTML={tex(t.slice(2, -2), true)} />);
    } else if (t.startsWith('```')) {
      const cm = t.match(/```(\w*)\n?([\s\S]*?)```/);
      tokens.push(<CodeBlock key={k++} lang={cm?.[1]} code={cm?.[2] || ''} />);
    } else if (t.startsWith('`')) {
      tokens.push(<code key={k++} className="cw-inline-code">{t.slice(1, -1)}</code>);
    } else if (t.startsWith('$')) {
      tokens.push(<span key={k++} dangerouslySetInnerHTML={tex(t.slice(1, -1), false)} />);
    }
    last = m.index + t.length;
  }
  if (last < text.length) tokens.push(renderTextSegment(text.slice(last), k++));

  return <div className="cw-md">{tokens}</div>;
};

// ─── Math quick-insert keys ───────────────────────────────────────────────────
const KEYS = [
  { l: 'x²', v: '^2' }, { l: '√', v: 'sqrt(' }, { l: '∫', v: '\\int_a^b f(x)\\,dx' },
  { l: '∑', v: '\\sum_{n=1}^{N}' }, { l: 'lim', v: '\\lim_{x\\to 0}' },
  { l: 'd/dx', v: '\\frac{d}{dx}' }, { l: 'Matrix', v: '\\begin{bmatrix}a & b \\\\ c & d\\end{bmatrix}' },
  { l: 'π', v: '\\pi' }, { l: 'e^x', v: 'e^{x}' }, { l: '∞', v: '\\infty' },
];

// ─── Format mathjs result ─────────────────────────────────────────────────────
const fmtResult = (res) => {
  if (!res && res !== 0) return null;
  if (typeof res === 'object' && res?.isMatrix) {
    const arr = res.toArray();
    if (!Array.isArray(arr[0])) {
      return `**Answer:**\n$$\\begin{bmatrix}${arr.join(' \\\\ ')}\\end{bmatrix}$$`;
    }
    const rows = arr.map(r => r.join(' & ')).join(' \\\\ ');
    return `**Answer (Matrix):**\n$$\\begin{bmatrix}${rows}\\end{bmatrix}$$`;
  }
  const s = typeof res === 'number'
    ? (Number.isInteger(res) ? res.toString() : +res.toPrecision(10) + '')
    : String(res);
  return `**Answer:** \`${s}\``;
};

// ═══════════════════════════════════════════════════════════════════════════════
const ChatWidget = () => {
  const INIT = [
    { id: 1, text: "Hi! 👋 I'm **SAVS Bot** — your B.Tech Math & AI assistant.", sender: 'bot', ts: null },
    { id: 2, text: "I can handle:\n- **Algebra:** `solve(x^2 - 5x + 6, x)`\n- **Matrices:** `[1,2;3,4] * [5,6;7,8]`\n- **Calculus:** `derivative('x^3', 'x')`\n- **Arithmetic:** `2^10`, `sqrt(144)`, `factorial(10)`\n- **LaTeX:** wrap in `$...$` or `$$...$$`\n\nAsk anything — I evaluate locally *and* via Gemini AI.", sender: 'bot', ts: null },
  ];

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState(INIT);
  const [inp, setInp] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mathMode, setMathMode] = useState(true);
  const [mathLib, setMathLib] = useState(null);

  const endRef = useRef(null);
  const fileRef = useRef(null);
  const inpRef = useRef(null);

  useEffect(() => { loadKaTeX(); loadMathJS().then(setMathLib); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

  const push = (text, sender) =>
    setMsgs(p => [...p, { id: Date.now() + Math.random(), text, sender, ts: new Date().toISOString() }]);

  // ── Local math evaluation ──────────────────────────────────────────────────
  const evalLocal = useCallback((expr) => {
    if (!mathLib || !mathMode) return null;
    try {
      const clean = expr.replace(/×/g, '*').replace(/÷/g, '/');
      const res = mathLib.evaluate(clean);
      const fmtd = fmtResult(res);
      if (fmtd) {
        const steps = `**Input:** \`${clean}\`\n\n${fmtd}`;
        return steps;
      }
    } catch { /* not a local math expr */ }
    return null;
  }, [mathLib, mathMode]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inp.trim();
    if (!text && !file) return;

    push(text || `📎 ${file.name}`, 'user');
    setInp('');
    setLoading(true);

    // Try local eval first
    if (!file) {
      const local = evalLocal(text);
      if (local) {
        setTimeout(() => { push(local, 'bot'); setLoading(false); }, 300);
        return;
      }
    }

    // API call
    try {
      const fd = new FormData();
      const prefix = mathMode
        ? `You are a mathematics tutor for B.Tech students. Always:
1. Show step-by-step working.
2. Use LaTeX: $...$ inline, $$...$$ display.
3. For matrices use $$\\begin{bmatrix}...\\end{bmatrix}$$.
4. For code use triple backtick fences.
5. Be concise but thorough.\n\nQuestion: `
        : '';
      fd.append('message', prefix + text);
      if (file) fd.append('file', file);

      const res = await axios.post('http://localhost:5000/api/gemini', fd, {
        headers: { 'Content-Type': file ? 'multipart/form-data' : 'application/json' }
      });
      push(res.data.answer || 'Received your message!', 'bot');
      setFile(null); setPreview(null);
    } catch {
      push("⚠️ Cannot reach the server. Make sure your backend is running at `http://localhost:5000`.\n\nFor quick math, toggle **Math Mode** ON — I'll compute locally!", 'bot');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f);
    } else setPreview(null);
  };

  const insertKey = (v) => {
    setInp(p => p + (v.startsWith('\\') ? `$${v}$` : v));
    inpRef.current?.focus();
  };

  const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <>
      <style>{STYLES}</style>
      <div className="cw-root">
        {open && (
          <div className="cw-panel">
            {/* Header */}
            <div className="cw-header">
              <div className="cw-avatar">S<div className="cw-dot"/></div>
              <div>
                <div className="cw-hname">SAVS Bot</div>
                <div className="cw-hsub">🟢 Online • {mathMode ? 'Math Mode ON' : 'Chat Mode'}</div>
              </div>
              <div className="cw-hright">
                <button className={`cw-mtoggle ${mathMode ? 'on' : ''}`} onClick={() => setMathMode(m => !m)}>
                  ∑ Math {mathMode ? 'ON' : 'OFF'}
                </button>
                <button className="cw-closebtn" onClick={() => setOpen(false)}>
                  <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="cw-body">
              {msgs.map(msg => (
                <div key={msg.id} className={`cw-row ${msg.sender}`}>
                  {msg.sender === 'bot' && <div className="cw-mavatar">S</div>}
                  <div className={`cw-bubble ${msg.sender}`}>
                    <MathMessage text={msg.text} />
                    {msg.ts && <span className="cw-time">{fmt(msg.ts)}</span>}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="cw-row bot">
                  <div className="cw-mavatar">S</div>
                  <div className="cw-bubble bot"><div className="cw-typing"><span/><span/><span/></div></div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            {/* Footer / Input */}
            <div className="cw-foot">
              {mathMode && (
                <div className="cw-mathkeys">
                  {KEYS.map(k => <button key={k.l} className="cw-mkey" onClick={() => insertKey(k.v)}>{k.l}</button>)}
                </div>
              )}
              {file && (
                <div className="cw-fpreview">
                  {preview ? <img src={preview} alt=""/> : <span>📎</span>}
                  <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:12 }}>{file.name}</span>
                  <button className="cw-fremove" onClick={() => { setFile(null); setPreview(null); }}>✕</button>
                </div>
              )}
              <form className="cw-form" onSubmit={handleSend}>
                <div className="cw-inwrap">
                  <textarea
                    ref={inpRef} className="cw-input" rows={1} value={inp}
                    onChange={e => setInp(e.target.value)} onKeyDown={handleKey}
                    placeholder={mathMode ? "Try: 2^10, sqrt(144), det([1,2;3,4])…" : "Type your message…"}
                    disabled={loading}
                    onInput={e => { e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'; }}
                  />
                  <button type="button" className="cw-attachbtn" onClick={() => fileRef.current?.click()} disabled={loading}>
                    <svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                  </button>
                  <input ref={fileRef} type="file" style={{display:'none'}} accept=".pdf,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx" onChange={handleFile}/>
                </div>
                <button className="cw-sendbtn" type="submit" disabled={(!inp.trim() && !file) || loading}>
                  <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </form>
              <div className="cw-credits">Powered by Gemini AI • Math by KaTeX + math.js</div>
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button className="cw-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle chat">
          {open
            ? <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            : <>
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                <div className="cw-badge">∑</div>
              </>
          }
        </button>
      </div>
    </>
  );
};

export default ChatWidget;