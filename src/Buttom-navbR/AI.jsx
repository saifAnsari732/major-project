import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatWidget.css';
import api from '../utils/api';
/* ─────────────────────────────────────────────────────────────────────────────
   GoogleFontsLoader — injects <link> tags into <head> at mount.
   More reliable than @import inside a stylesheet loaded dynamically.
   Alternatively, paste these into your public/index.html <head> directly:
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
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
    link.href =
      'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap';
    link.setAttribute('data-cw-fonts', '1');

    document.head.append(pc1, pc2, link);
  }, []);

  return null;
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatTime = (iso) => {
  if (!iso) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const addLineNumbers = (text) =>
  text.split('\n').map((line, i) => ({ number: i + 1, text: line }));

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
      <div className="cw-dot r" />
      <div className="cw-dot y" />
      <div className="cw-dot g" />
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
    { id: 1, text: 'Hi there! 👋', sender: 'bot' },
    { id: 2, text: "Start a chat. We're here to help you 24/7.", sender: 'bot' },
    { id: 3, text: 'My name is Saif Bot. How can I assist you today?', sender: 'bot' },
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
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: userMessage || (selectedFile ? `📎 ${selectedFile.name}` : 'Question...'),
        sender: 'user',
      },
    ]);
    setInputText('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', userMessage);
      if (selectedFile) formData.append('file', selectedFile);

      const response = await api.post(`/gemini`, formData, {
        headers: { 'Content-Type': selectedFile ? 'multipart/form-data' : 'application/json' },
      });

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: response.data.answer || 'I received your message!',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
      setSelectedFile(null);
      setFilePreview(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
          sender: 'bot',
          timestamp: new Date().toISOString(),
        },
      ]);
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
      <GoogleFontsLoader />

      <div className="cw-root">
        {/* ── Popup ── */}
        {isOpen && (
          <div className="cw-popup">
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
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="cw-body">
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
                  <button className="cw-remove-file" onClick={removeFile} title="Remove">
                    ✕
                  </button>
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
                    placeholder={selectedFile ? 'Ask about your file…' : 'Type a message…'}
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
                        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
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
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
              <div className="cw-powered">Powered by Gemini AI</div>
            </div>
          </div>
        )}

        {/* ── FAB ── */}
        <button
          className={`cw-fab ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle chat"
        >
          <div className="cw-fab-icon">
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            ) : (
              <span className="cw-fab-label">Ai</span>
            )}
          </div>
        </button>
      </div>
    </>
  );
};

export default ChatWidget;