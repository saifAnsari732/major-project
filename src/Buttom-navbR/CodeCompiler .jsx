/* eslint-disable no-unused-vars */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Copy, Trash2, Download, Terminal, Sparkles, CheckCircle, X, ChevronRight, Zap } from 'lucide-react';
import './CodeCompiler.css';
import ButtomNav from './Buttom-nav';
import api from '../utils/api';

// ─── Input detector ───────────────────────────────────────────────────────────
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

// ─── Keyword Snippets per language ───────────────────────────────────────────
const KEYWORD_SNIPPETS = {
  python: [
    { label: 'print("")',      snippet: 'print("")',                          cursorBack: 2  },
    { label: 'input("")',      snippet: 'input("")',                          cursorBack: 2  },
    { label: 'def func',       snippet: 'def function_name():\n    pass',     cursorBack: 0  },
    { label: 'if / else',      snippet: 'if condition:\n    pass\nelse:\n    pass', cursorBack: 0 },
    { label: 'for loop',       snippet: 'for i in range(10):\n    ',          cursorBack: 0  },
    { label: 'while loop',     snippet: 'while condition:\n    ',             cursorBack: 0  },
    { label: 'class',          snippet: 'class MyClass:\n    def __init__(self):\n        pass', cursorBack: 0 },
    { label: 'try / except',   snippet: 'try:\n    pass\nexcept Exception as e:\n    print(e)', cursorBack: 0 },
    { label: 'list comp',      snippet: '[x for x in iterable]',             cursorBack: 0  },
    { label: 'lambda',         snippet: 'lambda x: x',                       cursorBack: 0  },
    { label: 'f-string',       snippet: 'f""',                               cursorBack: 1  },
    { label: 'import',         snippet: 'import ',                           cursorBack: 0  },
    { label: 'from import',    snippet: 'from module import name',           cursorBack: 0  },
    { label: 'len()',          snippet: 'len()',                             cursorBack: 1  },
    { label: 'range()',        snippet: 'range()',                           cursorBack: 1  },
    { label: 'enumerate()',    snippet: 'enumerate()',                       cursorBack: 1  },
    { label: 'zip()',          snippet: 'zip()',                             cursorBack: 1  },
    { label: 'return',         snippet: 'return ',                          cursorBack: 0  },
    { label: 'None',           snippet: 'None',                             cursorBack: 0  },
    { label: '[]  list',       snippet: '[]',                               cursorBack: 1  },
    { label: '{}  dict',       snippet: '{}',                               cursorBack: 1  },
  ],
  java: [
    { label: 'sysout',         snippet: 'System.out.println("");',           cursorBack: 3  },
    { label: 'main()',         snippet: 'public static void main(String[] args) {\n    \n}', cursorBack: 0 },
    { label: 'for loop',       snippet: 'for (int i = 0; i < n; i++) {\n    \n}', cursorBack: 0 },
    { label: 'while',          snippet: 'while (condition) {\n    \n}',      cursorBack: 0  },
    { label: 'if / else',      snippet: 'if (condition) {\n    \n} else {\n    \n}', cursorBack: 0 },
    { label: 'class',          snippet: 'public class ClassName {\n    \n}', cursorBack: 0  },
    { label: 'Scanner',        snippet: 'Scanner sc = new Scanner(System.in);\n', cursorBack: 0 },
    { label: 'nextLine()',     snippet: 'sc.nextLine()',                     cursorBack: 0  },
    { label: 'nextInt()',      snippet: 'sc.nextInt()',                      cursorBack: 0  },
    { label: 'ArrayList',      snippet: 'ArrayList<Integer> list = new ArrayList<>();', cursorBack: 0 },
    { label: 'try / catch',    snippet: 'try {\n    \n} catch (Exception e) {\n    e.printStackTrace();\n}', cursorBack: 0 },
    { label: 'import util',    snippet: 'import java.util.*;',              cursorBack: 0  },
    { label: 'String.format',  snippet: 'String.format("", )',              cursorBack: 0  },
    { label: 'int[]',          snippet: 'int[] arr = new int[n];',          cursorBack: 0  },
    { label: 'return',         snippet: 'return ',                          cursorBack: 0  },
  ],
  c: [
    { label: 'printf()',       snippet: 'printf("");\n',                    cursorBack: 4  },
    { label: 'scanf()',        snippet: 'scanf("", &);',                    cursorBack: 0  },
    { label: '#include stdio', snippet: '#include <stdio.h>\n',             cursorBack: 0  },
    { label: '#include stdlib',snippet: '#include <stdlib.h>\n',            cursorBack: 0  },
    { label: '#include string',snippet: '#include <string.h>\n',            cursorBack: 0  },
    { label: 'main()',         snippet: 'int main() {\n    \n    return 0;\n}', cursorBack: 0 },
    { label: 'for loop',       snippet: 'for (int i = 0; i < n; i++) {\n    \n}', cursorBack: 0 },
    { label: 'while',          snippet: 'while (condition) {\n    \n}',     cursorBack: 0  },
    { label: 'if / else',      snippet: 'if (condition) {\n    \n} else {\n    \n}', cursorBack: 0 },
    { label: 'struct',         snippet: 'struct Name {\n    int x;\n};',    cursorBack: 0  },
    { label: 'malloc()',       snippet: 'malloc(sizeof())',                  cursorBack: 0  },
    { label: 'free()',         snippet: 'free();',                           cursorBack: 0  },
    { label: 'int arr[]',      snippet: 'int arr[100];',                    cursorBack: 0  },
    { label: 'void func',      snippet: 'void function_name() {\n    \n}',  cursorBack: 0  },
    { label: 'return 0',       snippet: 'return 0;',                        cursorBack: 0  },
    { label: 'NULL',           snippet: 'NULL',                             cursorBack: 0  },
    { label: 'sizeof()',       snippet: 'sizeof()',                         cursorBack: 1  },
  ],
  Cpp: [
    { label: 'cout <<',        snippet: 'cout << "" << endl;',              cursorBack: 9  },
    { label: 'cin >>',         snippet: 'cin >> ;',                         cursorBack: 1  },
    { label: '#include iostream', snippet: '#include <iostream>\nusing namespace std;\n', cursorBack: 0 },
    { label: '#include vector', snippet: '#include <vector>\n',             cursorBack: 0  },
    { label: 'main()',         snippet: 'int main() {\n    \n    return 0;\n}', cursorBack: 0 },
    { label: 'for loop',       snippet: 'for (int i = 0; i < n; i++) {\n    \n}', cursorBack: 0 },
    { label: 'while',          snippet: 'while (condition) {\n    \n}',     cursorBack: 0  },
    { label: 'if / else',      snippet: 'if (condition) {\n    \n} else {\n    \n}', cursorBack: 0 },
    { label: 'class',          snippet: 'class MyClass {\npublic:\n    MyClass() {}\n};', cursorBack: 0 },
    { label: 'vector<int>',    snippet: 'vector<int> v;',                   cursorBack: 0  },
    { label: 'auto',           snippet: 'auto ',                            cursorBack: 0  },
    { label: 'try / catch',    snippet: 'try {\n    \n} catch (exception& e) {\n    cerr << e.what();\n}', cursorBack: 0 },
    { label: 'nullptr',        snippet: 'nullptr',                          cursorBack: 0  },
    { label: 'string',         snippet: 'string ',                          cursorBack: 0  },
    { label: 'return 0',       snippet: 'return 0;',                        cursorBack: 0  },
    { label: 'endl',           snippet: 'endl',                             cursorBack: 0  },
  ],
};

// ─── Keyword Carousel Component ───────────────────────────────────────────────
const KeywordCarousel = ({ language, accentColor, onInsert }) => {
  const keywords = KEYWORD_SNIPPETS[language] || [];
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [flashIdx, setFlashIdx] = useState(null);

  const handleClick = (kw, idx) => {
    setFlashIdx(idx);
    setTimeout(() => setFlashIdx(null), 500);
    onInsert(kw.snippet, kw.cursorBack);
  };

  return (
    <div
      className="kc-wrapper"
      style={{ '--kc-accent': accentColor }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left label */}
      <div className="kc-label">
        <Zap size={11} />
        <span>Quick Insert</span>
      </div>

      {/* Scrolling track */}
      <div className="kc-scroll-area">
        <div
          className={`kc-track ${isPaused ? 'kc-track--paused' : ''}`}
          ref={trackRef}
          style={{ '--kc-count': keywords.length }}
        >
          {/* Duplicate for seamless loop */}
          {[...keywords, ...keywords].map((kw, idx) => (
            <button
              key={idx}
              className={`kc-chip ${flashIdx === idx % keywords.length ? 'kc-chip--flash' : ''}`}
              onClick={() => handleClick(kw, idx % keywords.length)}
              title={`Insert: ${kw.snippet}`}
            >
              <span className="kc-chip-dot" />
              <span className="kc-chip-label">{kw.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right fade + icon */}
      <div className="kc-fade-right" />
    </div>
  );
};

// ─── Terminal Input Modal ─────────────────────────────────────────────────────
const InputModal = ({ language, code, onSubmit, onCancel, accentColor }) => {
  const [lines, setLines]   = useState(['']);
  const [active, setActive] = useState(0);
  const inputRefs           = useRef([]);
  const prompts             = extractPrompts(code, language);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

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

  const handleChange = (val, idx) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? val : l)));

  return (
    <div className="rim-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="rim-box" style={{ '--rim-accent': accentColor }}>
        <div className="rim-topbar">
          <div className="rim-dots">
            <span className="rim-dot" style={{ background: '#ff5f57' }} />
            <span className="rim-dot" style={{ background: '#febc2e' }} />
            <span className="rim-dot" style={{ background: '#28c840' }} />
          </div>
          <span className="rim-title"><Terminal size={12} /> stdin — program input</span>
          <button className="rim-close" onClick={onCancel}><X size={14} /></button>
        </div>
        <div className="rim-banner">
          <span className="rim-banner-icon">⚡</span>
          <span>Your program needs <strong>input</strong>. Type each value on a new line, then click <strong>Run</strong>.</span>
        </div>
        {prompts.length > 0 && (
          <div className="rim-prompts">
            <p className="rim-prompts-title">Detected input prompts in your code:</p>
            {prompts.map((p, i) => (
              <div key={i} className="rim-prompt-chip">
                <ChevronRight size={11} /><span>{p}</span>
              </div>
            ))}
          </div>
        )}
        <div className="rim-terminal">
          <div className="rim-term-header">
            <span className="rim-term-label">$ input stream</span>
            <span className="rim-term-hint">Enter ↵ = new line · Backspace on empty = remove line</span>
          </div>
          <div className="rim-term-body">
            {lines.map((val, idx) => (
              <div key={idx} className={`rim-line ${active === idx ? 'rim-line-active' : ''}`}>
                <span className="rim-line-num">{idx + 1}</span>
                <span className="rim-cursor-wrap"><ChevronRight size={12} className="rim-prompt-arrow" /></span>
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
        <div className="rim-actions">
          <button className="rim-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="rim-btn-run" onClick={() => onSubmit(lines.join('\n'))} style={{ background: accentColor }}>
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
    python: `# Python Example\ndef greet(name):\n    return f"Hello, {name}!"\n\nresult = greet("World")\nprint(result)\nprint("Welcome to SAVS Compiler!")`,
    java: `// Java Example\npublic class Main {\n    public static void main(String[] args) {\n        String message = "Hello, World!";\n        System.out.println(message);\n        System.out.println("Welcome to SAVS Compiler!");\n    }\n}`,
    c: `// C Example\n#include <stdio.h>\n\nint main() {\n    char name[] = "World";\n    printf("Hello, %s!\\n", name);\n    printf("Welcome to SAVS Compiler!\\n");\n    return 0;\n}`,
    Cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cout << "Enter two numbers: ";\n    cin >> a >> b;\n    cout << "Sum = " << a + b << endl;\n    return 0;\n}`,
  };

  const [language, setLanguage]           = useState('python');
  const [code, setCode]                   = useState(languageTemplates['python']);
  const [input, setInput]                 = useState('');
  const [output, setOutput]               = useState('');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [copied, setCopied]               = useState(false);
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

  // ─── Insert keyword snippet at cursor position ─────────────────────────────
  const handleInsertSnippet = useCallback((snippet, cursorBack) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const before = code.slice(0, start);
    const after  = code.slice(end);

    // Auto-indent: match current line's leading spaces
    const currentLineStart = before.lastIndexOf('\n') + 1;
    const indent = before.slice(currentLineStart).match(/^(\s*)/)[1];
    const indentedSnippet = snippet.replace(/\n/g, '\n' + indent);

    const newCode     = before + indentedSnippet + after;
    const newCursorPos = start + indentedSnippet.length - cursorBack;

    setCode(newCode);

    // Restore focus + move cursor
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursorPos, newCursorPos);
      syncScroll();
    });
  }, [code, syncScroll]);

  const runCode = async (stdinValue) => {
    setLoading(true); setOutput(''); setError('');
    try {
      const response = await api.post('/compiler', { code, language, input: stdinValue });
      const { output: out = '', error: err = '' } = response.data;
      if (err && err.trim()) setError(err);
      else setOutput(out.trim() !== '' ? out : '(no output)');
    } catch (err) {
      if (err.code === 'ECONNABORTED')   setError('⏱️ Request timed out. Check for infinite loops.');
      else if (!err.response)            setError('🌐 Cannot reach server. Check your connection.');
      else setError(`❌ Server error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunClick = () => {
    if (!code.trim()) { setError('Please write some code first!'); return; }
    const needsInput = codeNeedsInput(code, language);
    const hasInput   = input.trim() !== '';
    if (needsInput && !hasInput) setShowInputModal(true);
    else runCode(input);
  };

  const handleModalSubmit = (stdinValue) => {
    setInput(stdinValue);
    setShowInputModal(false);
    runCode(stdinValue);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const ext  = { python: 'py', java: 'java', c: 'c', Cpp: 'cpp' };
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

  const highlighted     = highlightCode(code, language);
  const needsInputBadge = codeNeedsInput(code, language);
  const fileExt         = language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'Cpp' ? 'cpp' : 'c';

  return (
    <div className="cc-root">
      <div className="cc-blob cc-blob-a" />
      <div className="cc-blob cc-blob-b" />
      <div className="cc-blob cc-blob-c" />

      {showInputModal && (
        <InputModal
          language={language}
          code={code}
          accentColor={langMeta[language].accent}
          onSubmit={handleModalSubmit}
          onCancel={() => setShowInputModal(false)}
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
              {/* <div className="cc-file-chip">
                <span style={{ color: langMeta[language].accent }}>{langMeta[language].icon}</span>
                <span>main.{fileExt}</span>
              </div> */}
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
                  : <><Play size={15} fill="currentColor" /><span>Run Code</span></>}
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

              {/* ── KEYWORD CAROUSEL ── */}
              <KeywordCarousel
                language={language}
                accentColor={langMeta[language].accent}
                onInsert={handleInsertSnippet}
              />

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