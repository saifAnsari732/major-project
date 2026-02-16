/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Play, Copy, Trash2, Code2, Download, Terminal, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import '../Buttom-navbR/CodeCompiler.css';
import axios from 'axios';
import ButtomNav from './Buttom-nav';
import api from '../utils/api';


const CodeCompiler = () => {

  const languageTemplates = {
    python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
print("Welcome to Code Compiler!")`,
    java: `// Java Example
public class Main {
    public static void main(String[] args) {
        String message = "Hello, World!";
        System.out.println(message);
        System.out.println("Welcome to Code Compiler!");
    }
}`,
    c: `// C Example
#include <stdio.h>

int main() {
    char name[] = "World";
    printf("Hello, %s!\\n", name);
    printf("Welcome to Code Compiler!\\n");
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
}
    `
  };



  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(languageTemplates['python']);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lineNumbers, setLineNumbers] = useState([1]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const languageColors = {
    python: { bg: 'python-bg', glow: 'python-glow', icon: '🐍' },
    Cpp: { bg: 'Cpp-bg', glow: 'Cpp-glow', icon: '🍁' },
    java: { bg: 'java-bg', glow: 'java-glow', icon: '☕' },
    c: { bg: 'c-bg', glow: 'c-glow', icon: '⚡' }
  };

  // Update line numbers when code changes
  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(languageTemplates[lang]);
    setOutput('');
    setError('');
    setInput('');
  };
  console.log(languageTemplates);

  const executeCode = async () => {
    if (!code.trim()) {
      setError('Please write some code first!');
      return;
    }

    setLoading(true);
    setOutput('');
    setError('');
    
    try {
      console.log('Sending request:', { code, language, input });
      
      const response = await axios.post('http://localhost:5000/api/compiler', { 
        code, 
        language, 
        input 
      });
      
      console.log('Response received:', response.data);
      
      if (response.data.error) {
        setError(response.data.error);
      } else if (response.data.output) {
        setOutput(response.data.output);
      } else {
        setOutput('Code executed successfully with no output.');
      }
    } catch (err) {
      console.error('Error details:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Error running code: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const extensions = { python: 'py', java: 'java', c: 'c', Cpp: 'cpp' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
    setError('');
    setInput('');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="code-compiler-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
      </div>

      {/* Main Container */}
      <div className="main-wrapper">
        {/* Header */}
        <div className="header-section">
          <div className="header-container">
            <div className="header-content">
              <Code2 className="header-icon" />
              <h1 className="main-title">SAVS Code Compiler</h1>
              <Sparkles className="header-icon" />
            </div>
            <p className="subtitle">Write, compile, and execute code in real-time</p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="language-section">
          <div className="language-container">
            <div className="language-grid">
              {Object.keys(languageTemplates).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`language-card ${language === lang ? `${languageColors[lang].bg} active-language ${languageColors[lang].glow}` : ''}`}
                >
                  <div className="language-icon">{languageColors[lang].icon}</div>
                  <h3 className="language-name">{lang.toUpperCase()}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Section */}
        <div className="editor-section">
          <div className="editor-container">
            <div className={`main-editor ${isFullscreen ? 'fullscreen' : ''}`}>
              
              {/* Toolbar */}
              <div className="editor-toolbar">
                <div className="toolbar-content">
                  
                  {/* Left Side - Action Buttons */}
                  <div className="action-buttons">
                    <button
                      onClick={copyCode}
                      className="action-button"
                      title="Copy code"
                    >
                      <Copy className="button-icon" />
                      <span className="button-text">Copy</span>
                    </button>
                    <button
                      onClick={downloadCode}
                      className="action-button"
                      title="Download code"
                    >
                      <Download className="button-icon" />
                      <span className="button-text">Download</span>
                    </button>
                    <button
                      onClick={clearCode}
                      className="action-button"
                      title="Clear all"
                    >
                      <Trash2 className="button-icon" />
                      <span className="button-text">Clear</span>
                    </button>
                  </div>

                  {/* Right Side - Run Button */}
                  <div className="run-button-container">
                    <button
                      onClick={executeCode}
                      disabled={loading || !code.trim()}
                      className={`run-button ${languageColors[language].bg} ${loading ? 'loading' : ''}`}
                    >
                      {loading ? (
                        <>
                          <div className="loading-spinner"></div>
                          <span className="run-text">Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="play-icon" />
                          <span className="run-text">Run Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor and Output Grid */}
              <div className="editor-output-grid">
                
                {/* Left Panel - Code Editor */}
                <div className="code-editor-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <Code2 className="panel-icon" />
                      <span>Code Editor</span>
                    </div>
                    <div className="language-badge">{language.toUpperCase()}</div>
                  </div>

                  <div className="editor-content">
                    {/* Code Editor with Line Numbers */}
                    <div className="code-editor-wrapper">
                      {/* Line Numbers */}
                      <div 
                        className="line-numbers" 
                        ref={lineNumbersRef}
                      >
                        {lineNumbers.map((num) => (
                          <div key={num} className="line-number">
                            {num}
                          </div>
                        ))}
                      </div>
                      
                      {/* Code Textarea */}
                      <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onScroll={handleScroll}
                        className="code-textarea-with-lines"
                        placeholder="Write your code here..."
                        spellCheck="false"
                      />
                    </div>
                  </div>
                   {/* Input Section */}
                  <div className="input-section-wrapper">
                    <label className="input-label">
                      <Terminal className="input-icon" />
                      Program Input (stdin)
                    </label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter input for your program here (each line = one input)..."
                      className="input-textarea"
                    />
                  </div>
                
                </div>

                {/* Right Panel - Output */}
                <div className="output-panel">
                  <div className="output-header">
                    <div className="output-title-section">
                      <Terminal className="output-icon" />
                      <span className="output-title">Console Output</span>
                    </div>
                    <div className="status-indicators">
                      <div className="status-dot"></div>
                      <div className="status-dot dot-delay-1"></div>
                      <div className="status-dot dot-delay-2"></div>
                    </div>
                  </div>
                  <div className="output-content">
                    <div className="output-display">
                      <pre className="output-text">
                        {error ? (
                          <div className="error-message">
                            <span className="error-icon">❌</span>
                            <span className="error-title">Error:</span>
                            <div className="error-content">{error}</div>
                          </div>
                        ) : output ? (
                          <div className="success-message">
                            <span className="success-icon">✅</span>
                            <span className="success-title">Output:</span>
                            <div className="output-content-text">{output}</div>
                          </div>
                        ) : (
                          <div className="placeholder-message">
                            <Terminal className="placeholder-icon" />
                            <div className="placeholder-title">Ready to run</div>
                            <div className="placeholder-subtitle">
                              Click 'Run Code' to see output here
                            </div>
                          </div>
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ButtomNav/>
    </div>
  );
};

export default CodeCompiler;