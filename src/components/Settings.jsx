import React, { useState, useEffect } from 'react';
import { Key, Volume2, Globe, Server, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function Settings({ backendStatus, onRefreshBackend }) {
  const [apiKey, setApiKey] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [backendUrl, setBackendUrl] = useState('http://127.0.0.1:5000');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedKey = localStorage.getItem('infi_gemini_key') || 'AQ.Ab8RN6JkEvbYYV-Mp0_iwCQIsgHTKmg4Cvs3UCMwsUIHK3_QVw';
    setApiKey(savedKey);

    const savedVoice = localStorage.getItem('infi_selected_voice') || '';
    setSelectedVoice(savedVoice);

    const savedLanguage = localStorage.getItem('infi_selected_language') || 'en-US';
    setSelectedLanguage(savedLanguage);

    const savedUrl = localStorage.getItem('infi_backend_url') || 'http://127.0.0.1:5000';
    setBackendUrl(savedUrl);

    // Get TTS Voices
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      }
    };
    
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('infi_gemini_key', apiKey);
    localStorage.setItem('infi_selected_voice', selectedVoice);
    localStorage.setItem('infi_selected_language', selectedLanguage);
    localStorage.setItem('infi_backend_url', backendUrl);

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history? This cannot be undone.')) {
      localStorage.removeItem('infi_chat_history');
      alert('Conversation history cleared!');
      window.location.reload();
    }
  };

  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all app settings? Your API key and custom accounts will be cleared.')) {
      localStorage.clear();
      alert('App successfully reset.');
      window.location.reload();
    }
  };

  return (
    <div className="animate-slide-in" style={{
      maxWidth: '650px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>System Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Configure the AI engine, speech recognition, and desktop integrations.
        </p>
      </div>

      {saveSuccess && (
        <div className="glass animate-slide-in" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          borderRadius: 'var(--radius-md)'
        }}>
          <CheckCircle size={18} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Gemini API Key */}
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Key size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Gemini AI Credentials</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Enter your Google Gemini API Key. If none is set, INFI will run in offline mode (only basic pre-defined local functions and calculations will work).
          </p>
          <input
            type="password"
            className="input-field"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {/* Speech Settings */}
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Volume2 size={18} style={{ color: 'var(--secondary)' }} />
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Speech & TTS Config</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Text-to-Speech Voice Selection
              </label>
              <select
                className="input-field"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
              >
                <option value="">Default System Voice</option>
                {voices.map((v, idx) => (
                  <option key={idx} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Recognition & Input Language
              </label>
              <select
                className="input-field"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
              >
                <option value="en-US">English (United States)</option>
                <option value="hi-IN">Hindi (India)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="fr-FR">French (France)</option>
                <option value="de-DE">German (Germany)</option>
                <option value="ja-JP">Japanese (Japan)</option>
                <option value="ru-RU">Russian (Russia)</option>
                <option value="zh-CN">Chinese (Simplified)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Helper URL */}
        <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyURI: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Server size={18} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: '600', fontSize: '16px' }}>Desktop Assistant Agent</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {backendStatus ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  Connected
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  Disconnected
                </span>
              )}
              <button
                type="button"
                onClick={onRefreshBackend}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Desktop operations (opening Word, locking PC, volume commands) require the Python local helper to be running on your machine.
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://127.0.0.1:5000"
            />
          </div>
          
          {!backendStatus && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>To connect, run <code>python server.py</code> in the assistant folder on your computer. When run on mobile, this will say Disconnected and fallback to web redirections.</span>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '15px' }}
        >
          Save Configuration
        </button>

      </form>

      {/* Advanced Maintenance */}
      <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Trash2 size={18} style={{ color: 'var(--error)' }} />
          <span style={{ fontWeight: '600', fontSize: '16px', color: '#f87171' }}>Maintenance</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Reset your browser workspace. This clears cache data stored locally.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleClearHistory} className="btn-danger" style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            Clear Search History
          </button>
          <button onClick={handleResetApp} className="btn-danger" style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            Reset All Application Settings
          </button>
        </div>
      </div>
    </div>
  );
}
