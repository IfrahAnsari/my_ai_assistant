import React, { useState, useEffect } from 'react';
import { Search, Trash2, Play, Calendar, MessageSquare, Mic, Copy, Check } from 'lucide-react';

export default function History({ onRerunPrompt }) {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem('infi_chat_history') || '[]');
    // Sort reverse chronological
    setHistory(chatHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }, []);

  const handleDeleteItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('infi_chat_history', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all search and talk history?')) {
      setHistory([]);
      localStorage.removeItem('infi_chat_history');
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.query.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.response.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'voice') return matchesSearch && item.isVoice;
    if (filterType === 'text') return matchesSearch && !item.isVoice;
    if (filterType === 'math') return matchesSearch && item.type === 'math';
    if (filterType === 'code') return matchesSearch && item.type === 'code';
    
    return matchesSearch;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="animate-slide-in" style={{
      maxWidth: '850px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Search & Voice History</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Browse and review your past queries, code answers, and voice commands.
          </p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={handleClearAll} 
            className="btn-danger" 
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search queries or responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>

        <select
          className="input-field"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ width: '160px', background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
        >
          <option value="all">All Logs</option>
          <option value="voice">Voice Commands</option>
          <option value="text">Text Queries</option>
          <option value="math">Calculations</option>
          <option value="code">Code Output</option>
        </select>
      </div>

      {/* History Items Container */}
      <div className="glass" style={{
        flex: 1,
        borderRadius: 'var(--radius-md)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 240px)',
        padding: '8px'
      }}>
        {filteredHistory.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            gap: '12px'
          }}>
            <MessageSquare size={48} style={{ color: 'var(--text-muted)' }} />
            <div>
              <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>No History Found</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                {history.length === 0 ? 'Your voice assistant log will appear here after you ask a question.' : 'Try adjusting your search terms or filter settings.'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="glass-interactive"
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {/* Meta details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.isVoice ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                        <Mic size={14} /> Voice Request
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cyan)' }}>
                        <MessageSquare size={14} /> Text Request
                      </span>
                    )}
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatDate(item.timestamp)}
                    </span>
                    {item.type && (
                      <>
                        <span>•</span>
                        <span style={{
                          background: 'rgba(255,255,255,0.05)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          textTransform: 'uppercase'
                        }}>{item.type}</span>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => onRerunPrompt(item.query)}
                      title="Run query again"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Play size={15} />
                    </button>
                    <button
                      onClick={() => handleCopyText(item.response, item.id)}
                      title="Copy response"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cyan)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {copiedId === item.id ? <Check size={15} style={{ color: 'var(--success)' }} /> : <Copy size={15} />}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete log"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>
                  {item.query}
                </div>

                {/* Reply */}
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  paddingLeft: '12px',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {item.response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
