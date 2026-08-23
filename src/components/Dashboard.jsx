import React, { useState, useEffect } from 'react';
import { Mic, History, Code, Settings, LogOut, Cpu, HardDrive, Layout, Menu, X } from 'lucide-react';
import Assistant from './Assistant';
import HistoryLog from './History';
import Coding from './Coding';
import SystemSettings from './Settings';

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('assistant');
  const [currentUser, setCurrentUser] = useState({ name: 'Guest User', email: '', avatar: '' });
  const [backendStatus, setBackendStatus] = useState(false);
  const [backendMetrics, setBackendMetrics] = useState({ cpu: 0, memory: 0, disk: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const backendUrl = localStorage.getItem('infi_backend_url') || 'http://127.0.0.1:5000';

  // Fetch current user and check backend connection
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('infi_current_user') || '{}');
    if (user.name) {
      setCurrentUser(user);
    }

    checkBackend();
    // Set interval to poll backend metrics
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkBackend = async () => {
    const url = localStorage.getItem('infi_backend_url') || 'http://127.0.0.1:5000';
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setBackendStatus(true);
        if (data.metrics) {
          setBackendMetrics(data.metrics);
        }
      } else {
        setBackendStatus(false);
      }
    } catch (e) {
      setBackendStatus(false);
    }
  };

  const handleRerunPrompt = (query) => {
    setActiveTab('assistant');
    // We can dispatch an event or use a ref, but simple localstorage trigger is neat, 
    // or we can reload the page with query parameters, or pass it via context.
    // For react flow, let's store the rerun query in localStorage and have Assistant component read it!
    localStorage.setItem('infi_pending_rerun', query);
    // Reload trigger logic in Assistant happens in its useEffect
    window.location.reload();
  };

  const menuItems = [
    { id: 'assistant', label: 'INFI Assistant', icon: <Mic size={20} /> },
    { id: 'history', label: 'Search History', icon: <History size={20} /> },
    { id: 'coding', label: 'Code Solver', icon: <Code size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'assistant':
        return <Assistant backendStatus={backendStatus} backendUrl={backendUrl} />;
      case 'history':
        return <HistoryLog onRerunPrompt={handleRerunPrompt} />;
      case 'coding':
        return <Coding />;
      case 'settings':
        return <SystemSettings backendStatus={backendStatus} onRefreshBackend={checkBackend} />;
      default:
        return <Assistant backendStatus={backendStatus} backendUrl={backendUrl} />;
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="glass desktop-sidebar" style={{
        width: '260px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        borderRight: '1px solid var(--border-color)',
        zIndex: 10,
        background: 'var(--bg-sidebar)'
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px var(--primary-glow)'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>IN</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(to right, white, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              INFI AI
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="glass-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: activeTab === item.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                  background: activeTab === item.id ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: activeTab === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontWeight: activeTab === item.id ? '600' : '500'
                }}
              >
                <span style={{ color: activeTab === item.id ? 'var(--primary)' : 'inherit' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User profile & metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* System status if backend connected */}
          {backendStatus && (
            <div className="glass" style={{ padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cyan)', fontWeight: '600' }}>
                <Cpu size={14} /> Agent Core Metrics
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>CPU Load:</span>
                <span>{backendMetrics.cpu}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Memory:</span>
                <span>{backendMetrics.memory}%</span>
              </div>
            </div>
          )}

          {/* User profile card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <img
                src={currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest'}
                alt="Avatar"
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email || 'Google User'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER / MENU */}
      <div className="mobile-header" style={{
        display: 'none',
        width: '100%',
        height: '60px',
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'var(--bg-sidebar)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'white' }}>IN</span>
          </div>
          <span style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>INFI AI</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="animate-slide-in" style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 60px)',
          background: 'var(--bg-dark)',
          zIndex: 15,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className="glass-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: activeTab === item.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                  background: activeTab === item.id ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: activeTab === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  fontSize: '15px'
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={currentUser.avatar}
                alt="Avatar"
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{currentUser.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser.email}</div>
              </div>
            </div>
            <button onClick={onLogout} className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        paddingTop: '0',
        display: 'flex',
        flexDirection: 'column'
      }} className="main-content">
        <div style={{ flex: 1, height: '100%' }}>
          {renderContent()}
        </div>
      </main>

      {/* Inline styles for responsive layout styling rules */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .main-content {
            padding-top: 60px !important;
          }
        }
      `}</style>
    </div>
  );
}
