/* eslint-disable no-unused-vars */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Copy, Trash2, Download, Terminal, Sparkles, CheckCircle, X, ChevronRight } from 'lucide-react';
import './CodeCompiler.css';
import ButtomNav from './Buttom-nav';
import api from '../utils/api';

// ─── Input detector — scans code for stdin patterns per language ──────────────
const INPUT_PATTERNS = {
  python: [/\binput\s*\(/],
  java:   [/\.nextLine\s*\(/, /\.nextInt\s*\(/, /\.nextDouble\s*\(/, /\.next\s*\(/, /Scanner\s*\(/],
  c:      [/\bscanf\s*\(/, /\bgets\s*\(/, /\bfgets\s*\(/, /\bgetchar\s*\(/],
  Cpp:    [/\bcin\s*>>/, /\bgetline\s*\(/],
};

const codeNeedsInput = (code, language) => {
  const patterns = INPUT_PATTERNS[language] || [];
  return patterns.some((re) => re.test(code));
};

// ─── Extract prompt strings from code ────────────────────────────────────────
const extractPrompts = (code, language) => {
  const prompts = [];
  const printPatterns = {
    python: /print\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
    java:   /System\.out\.print(?:ln)?\s*\(\s*"([^"]+)"\s*\)/g,
    c:      /printf\s*\(\s*"([^"\\]+(?:\\.[^"\\]*)*)"/g,
    Cpp:    /cout\s*<<\s*"([^"]+)"/g,
  };
  const re = printPatterns[language];
  if (!re) return prompts;
  let m;
  while ((m = re.exec(code)) !== null) {
    const txt = m[1].replace(/\\n/g, '').replace(/\\t/g, ' ').trim();
    if (txt) prompts.push(txt);
  }
  return prompts;
};

// ─── Terminal Input Modal ─────────────────────────────────────────────────────
const InputModal = ({ language, code, onSubmit, onCancel, accentColor }) => {
  const [lines, setLines]   = useState(['']);
  const [active, setActive] = useState(0);
  const inputRefs           = useRef([]);
  const prompts             = extractPrompts(code, language);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleKey = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idx === lines.length - 1) {
        setLines((prev) => [...prev, '']);
        setActive(idx + 1);
        setTimeout(() => inputRefs.current[idx + 1]?.focus(), 30);
      } else {
        inputRefs.current[idx + 1]?.focus();
        setActive(idx + 1);
      }
    }
    if (e.key === 'Backspace' && lines[idx] === '' && idx > 0) {
      e.preventDefault();
      setLines((prev) => prev.filter((_, i) => i !== idx));
      setActive(idx - 1);
      setTimeout(() => inputRefs.current[idx - 1]?.focus(), 30);
    }
  };

  const handleChange = (val, idx) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? val : l)));
  };

  const handleSubmit = () => {
    onSubmit(lines.join('\n'));
  };

  return (
    <div className="rim-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="rim-box" style={{ '--rim-accent': accentColor }}>
        {/* Top bar */}
        <div className="rim-topbar">
          <div className="rim-dots">
            <span className="rim-dot" style={{ background: '#ff5f57' }} />
            <span className="rim-dot" style={{ background: '#febc2e' }} />
            <span className="rim-dot" style={{ background: '#28c840' }} />
          </div>
          <span className="rim-title">
            <Terminal size={12} /> stdin — program input
          </span>
          <button className="rim-close" onClick={onCancel}><X size={14} /></button>
        </div>

        {/* Info banner */}
        <div className="rim-banner">
          <span className="rim-banner-icon">⚡</span>
          <span>Your program needs <strong>input</strong>. Type each value on a new line, then click <strong>Run</strong>.</span>
        </div>

        {/* Detected prompts */}
        {prompts.length > 0 && (
          <div className="rim-prompts">
            <p className="rim-prompts-title">Detected input prompts in your code:</p>
            {prompts.map((p, i) => (
              <div key={i} className="rim-prompt-chip">
                <ChevronRight size={11} />
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* Terminal input area */}
        <div className="rim-terminal">
          <div className="rim-term-header">
            <span className="rim-term-label">$ input stream</span>
            <span className="rim-term-hint">Enter ↵ = new line &nbsp;·&nbsp; Backspace on empty = remove line</span>
          </div>
          <div className="rim-term-body">
            {lines.map((val, idx) => (
              <div key={idx} className={`rim-line ${active === idx ? 'rim-line-active' : ''}`}>
                <span className="rim-line-num">{idx + 1}</span>
                <span className="rim-cursor-wrap">
                  <ChevronRight size={12} className="rim-prompt-arrow" />
                </span>
                <input
                  ref={(el) => (inputRefs.current[idx] = el)}
                  className="rim-input"
                  value={val}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKey(e, idx)}
                  onFocus={() => setActive(idx)}
                  placeholder={prompts[idx] ? prompts[idx] : `value ${idx + 1}…`}
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
          <div className="rim-term-preview">
            <span className="rim-preview-label">stdin preview:</span>
            <code>{lines.join('\\n') || '—'}</code>
          </div>
        </div>

        {/* Actions */}
        <div className="rim-actions">
          <button className="rim-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="rim-btn-run" onClick={handleSubmit} style={{ background: accentColor }}>
            <Play size={13} fill="currentColor" /> Run with this input
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Syntax highlighter ───────────────────────────────────────────────────────
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LANG_RULES = {
  python: [
    ['hl-comment', /#[^\n]*/],
    ['hl-string',  /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/],
    ['hl-keyword', /\b(?:def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|try|except|finally|with|as|pass|break|continue|lambda|yield|global|nonlocal|del|raise|assert|async|await)\b/],
    ['hl-builtin', /\b(?:print|len|range|int|str|float|list|dict|set|tuple|bool|type|input|open|super|self|enumerate|zip|map|filter|sorted|reversed|isinstance|hasattr|getattr|setattr)\b/],
    ['hl-number',  /\b\d+\.?\d*\b/],
    ['hl-func',    /\b[a-zA-Z_]\w*(?=\s*\()/],
  ],
  java: [
    ['hl-comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ['hl-string',  /"(?:[^"\\]|\\.)*"/],
    ['hl-keyword', /\b(?:public|private|protected|class|interface|extends|implements|import|package|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|void|static|final|abstract|super|this|null|true|false|instanceof)\b/],
    ['hl-type',    /\b(?:int|long|double|float|char|boolean|byte|short|String|Integer|Long|Double|Float|Boolean|Object|List|Map|Set|Array)\b/],
    ['hl-number',  /\b\d+\.?\d*[fFlL]?\b/],
    ['hl-func',    /\b[a-zA-Z_]\w*(?=\s*\()/],
  ],
  c: [
    ['hl-comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ['hl-preproc', /#\s*(?:include|define|ifdef|ifndef|endif|pragma)[^\n]*/],
    ['hl-string',  /"(?:[^"\\]|\\.)*"/],
    ['hl-keyword', /\b(?:int|char|float|double|void|long|short|unsigned|signed|struct|union|enum|typedef|return|if|else|for|while|do|switch|case|break|continue|goto|sizeof|static|extern|const|volatile|register|auto|inline)\b/],
    ['hl-number',  /\b\d+\.?\d*[uUlLfF]?\b/],
    ['hl-func',    /\b[a-zA-Z_]\w*(?=\s*\()/],
  ],
  Cpp: [
    ['hl-comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ['hl-preproc', /#\s*(?:include|define|ifdef|ifndef|endif|pragma)[^\n]*/],
    ['hl-string',  /"(?:[^"\\]|\\.)*"/],
    ['hl-keyword', /\b(?:int|char|float|double|void|long|short|unsigned|signed|struct|class|union|enum|typedef|namespace|using|template|typename|return|if|else|for|while|do|switch|case|break|continue|goto|sizeof|static|extern|const|volatile|register|auto|inline|new|delete|try|catch|throw|public|private|protected|virtual|override|nullptr|true|false)\b/],
    ['hl-type',    /\b(?:string|vector|map|set|pair|queue|stack|array|cout|cin|endl)\b/],
    ['hl-number',  /\b\d+\.?\d*[uUlLfF]?\b/],
    ['hl-func',    /\b[a-zA-Z_]\w*(?=\s*\()/],
  ],
};

const highlightCode = (code, lang) => {
  const rules = LANG_RULES[lang] || LANG_RULES.python;
  let html = '', src = code;
  while (src.length > 0) {
    let bestIndex = Infinity, bestMatch = null, bestCls = null;
    for (const [cls, re] of rules) {
      const m = re.exec(src);
      if (m && m.index < bestIndex) { bestIndex = m.index; bestMatch = m[0]; bestCls = cls; }
    }
    if (!bestMatch) { html += escapeHtml(src); break; }
    if (bestIndex > 0) html += escapeHtml(src.slice(0, bestIndex));
    html += `<span class="${bestCls}">${escapeHtml(bestMatch)}</span>`;
    src = src.slice(bestIndex + bestMatch.length);
  }
  return html;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CodeCompiler = () => {
  const languageTemplates = {
    python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

result = greet("World")
print(result)
print("Welcome to SAVS Compiler!")`,
    java: `// Java Example
public class Main {
    public static void main(String[] args) {
        String message = "Hello, World!";
        System.out.println(message);
        System.out.println("Welcome to SAVS Compiler!");
    }
}`,
    c: `// C Example
#include <stdio.h>

int main() {
    char name[] = "World";
    printf("Hello, %s!\\n", name);
    printf("Welcome to SAVS Compiler!\\n");
    return 0;
}`,
    Cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cout << "Enter two numbers: ";
    cin >> a >> b;
    cout << "Sum = " << a + b << endl;
    return 0;
}`,
  };

  const [language, setLanguage]     = useState('python');
  const [code, setCode]             = useState(languageTemplates['python']);
  const [input, setInput]           = useState('');
  const [output, setOutput]         = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);

  const textareaRef  = useRef(null);
  const highlightRef = useRef(null);
  const lineNumRef   = useRef(null);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (highlightRef.current) {
      highlightRef.current.scrollTop  = ta.scrollTop;
      highlightRef.current.scrollLeft = ta.scrollLeft;
    }
    if (lineNumRef.current) lineNumRef.current.scrollTop = ta.scrollTop;
  }, []);

  const lineCount = code.split('\n').length;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(languageTemplates[lang]);
    setOutput(''); setError(''); setInput('');
  };

  // ─── Core run logic (called after input is confirmed) ─────────────────────
  const runCode = async (stdinValue) => {
    setLoading(true); setOutput(''); setError('');
    try {
      const response = await api.post('/compiler', { code, language, input: stdinValue });
      const { output: out = '', error: err = '' } = response.data;
      console.log(response.data);
      if (err && err.trim()) {
        setError(err);
      } else {
        setOutput(out.trim() !== '' ? out : '(no output)');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('⏱️ Request timed out. Check for infinite loops.');
      } else if (!err.response) {
        setError('🌐 Cannot reach server. Check your connection.');
      } else {
        setError(`❌ Server error: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Run button handler — shows modal if input needed & stdin empty ────────
  const handleRunClick = () => {
    if (!code.trim()) { setError('Please write some code first!'); return; }

    const needsInput = codeNeedsInput(code, language);
    const hasInput   = input.trim() !== '';

    if (needsInput && !hasInput) {
      // Show the modal so user can provide input interactively
      setShowInputModal(true);
    } else {
      // Stdin already filled or not needed — run directly
      runCode(input);
    }
  };

  // ─── Modal callbacks ───────────────────────────────────────────────────────
  const handleModalSubmit = (stdinValue) => {
    setInput(stdinValue);           // also update the stdin box for visibility
    setShowInputModal(false);
    runCode(stdinValue);
  };

  const handleModalCancel = () => setShowInputModal(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const ext = { python: 'py', java: 'java', c: 'c', Cpp: 'cpp' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `code.${ext[language]}`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearCode = () => { setCode(''); setOutput(''); setError(''); setInput(''); };

  const langMeta = {
    python: { icon: '🐍', label: 'Python', accent: '#4facfe' },
    java:   { icon: '☕', label: 'Java',   accent: '#f97316' },
    c:      { icon: '⚡', label: 'C',      accent: '#a78bfa' },
    Cpp:    { icon: '🍁', label: 'C++',    accent: '#34d399' },
  };

  const highlighted = highlightCode(code, language);
  const needsInputBadge = codeNeedsInput(code, language);

  return (
    <div className="cc-root">
      <div className="cc-blob cc-blob-a" />
      <div className="cc-blob cc-blob-b" />
      <div className="cc-blob cc-blob-c" />

      {/* ── Runtime Input Modal ── */}
      {showInputModal && (
        <InputModal
          language={language}
          code={code}
          accentColor={langMeta[language].accent}
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
        />
      )}

      <div className="cc-wrap">
        <header className="cc-header">
          <h1 className="cc-title">Code Compiler</h1>
          <p className="cc-sub">Write · Compile · Execute in real-time</p>
        </header>

        <nav className="cc-lang-bar">
          {Object.entries(langMeta).map(([lang, meta]) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`cc-lang-btn ${language === lang ? 'cc-lang-active' : ''}`}
              style={language === lang ? { '--accent': meta.accent } : {}}
            >
              <span className="cc-lang-icon">{meta.icon}</span>
              <span className="cc-lang-label">{meta.label}</span>
              {language === lang && <span className="cc-lang-dot" style={{ background: meta.accent }} />}
            </button>
          ))}
        </nav>

        <div className="cc-panel">
          {/* Toolbar */}
          <div className="cc-toolbar">
            <div className="cc-toolbar-left">
              <div className="cc-file-chip">
                <span style={{ color: langMeta[language].accent }}>{langMeta[language].icon}</span>
                <span>main.{language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'Cpp' ? 'cpp' : 'c'}</span>
              </div>
              {/* Input required badge */}
              {needsInputBadge && (
                <div className="cc-input-badge" style={{ '--badge-color': langMeta[language].accent }}>
                  <Terminal size={11} /> stdin required
                </div>
              )}
            </div>
            <div className="cc-toolbar-right">
              <button className="cc-icon-btn" onClick={copyCode}>
                {copied ? <CheckCircle size={15} color="#34d399" /> : <Copy size={15} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button className="cc-icon-btn" onClick={downloadCode}>
                <Download size={15} /><span>Save</span>
              </button>
              <button className="cc-icon-btn cc-icon-btn--danger" onClick={clearCode}>
                <Trash2 size={15} /><span>Clear</span>
              </button>
              <button
                className="cc-run-btn"
                onClick={handleRunClick}
                disabled={loading || !code.trim()}
                style={{ '--accent': langMeta[language].accent }}
              >
                {loading
                  ? <><div className="cc-spinner" /><span>Running…</span></>
                  : <><Play size={15} fill="currentColor" /><span>Run Code</span></>
                }
              </button>
            </div>
          </div>

          {/* Editor + Output */}
          <div className="cc-grid">
            {/* Left: Editor */}
            <div className="cc-editor-col">
              <div className="cc-editor-header">
                <Terminal size={13} style={{ color: langMeta[language].accent }} />
                <span>Editor</span>
                <span className="cc-line-count">{lineCount} lines</span>
              </div>
              <div className="cc-editor-body">
                <div className="cc-linenos" ref={lineNumRef}>
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="cc-lineno">{i + 1}</div>
                  ))}
                </div>
                <pre
                  className="cc-highlight"
                  ref={highlightRef}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
                />
                <textarea
                  ref={textareaRef}
                  className="cc-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={syncScroll}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  placeholder="// Write your code here…"
                />
              </div>
              <div className="cc-stdin">
                <label className="cc-stdin-label">
                  <Terminal size={12} />
                  <span>stdin / Input</span>
                  {needsInputBadge && input.trim() === '' && (
                    <span className="cc-stdin-hint" style={{ color: langMeta[language].accent }}>
                      — leave empty to enter interactively when you click Run
                    </span>
                  )}
                </label>
                <textarea
                  className="cc-stdin-area"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter program input here, or leave empty to fill interactively…"
                />
              </div>
            </div>

            {/* Right: Output */}
            <div className="cc-output-col">
              <div className="cc-editor-header">
                <Sparkles size={13} style={{ color: '#f472b6' }} />
                <span>Output</span>
                <span className={`cc-status-pill ${error ? 'cc-status-err' : output ? 'cc-status-ok' : 'cc-status-idle'}`}>
                  {error ? 'Error' : output ? 'Success' : 'Idle'}
                </span>
              </div>
              <div className="cc-output-body">
                {error ? (
                  <div className="cc-out-error">
                    <div className="cc-out-icon-row">❌ <strong>Error</strong></div>
                    <pre>{error}</pre>
                  </div>
                ) : output ? (
                  <div className="cc-out-success">
                    <div className="cc-out-icon-row">✅ <strong>Output</strong></div>
                    <pre>{output}</pre>
                  </div>
                ) : (
                  <div className="cc-out-idle">
                    <Terminal size={40} opacity={0.18} />
                    <p>Press <kbd>Run Code</kbd> to see output</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ButtomNav />
    </div>
  );
};

export default CodeCompiler;