import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Key, Eye, EyeOff, LogIn, UserPlus, HelpCircle, ArrowLeft } from 'lucide-react';

const GoogleIcon = ({ size = 18, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={style}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function Auth({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // login, signup, forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password flow
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timer, setTimer] = useState(0);

  // Simulated Google Sign-In popup state
  const [showGoogleMock, setShowGoogleMock] = useState(false);

  // Timer countdown for simulated OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    clearMessages();
    // Reset forgot flow
    setForgotStep(1);
    setOtp('');
    setNewPassword('');
  };

  // Simulated validation
  const validateEmail = (val) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Get users database
      const users = JSON.parse(localStorage.getItem('infi_users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || user.password !== password) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Successful login
      localStorage.setItem('infi_current_user', JSON.stringify({
        email: user.email,
        name: user.name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`,
        loginType: 'email'
      }));

      onLoginSuccess();
      setLoading(false);
    }, 1200);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    clearMessages();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('infi_users') || '[]');
      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      // Add user to simulated db
      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('infi_users', JSON.stringify(users));

      setSuccess('Account created successfully! You can now log in.');
      setLoading(false);
      setTimeout(() => {
        changeMode('login');
      }, 1500);
    }, 1500);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('infi_users') || '[]');
      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      // If database is empty, simulate user exists just for demo convenience,
      // but otherwise verify existence.
      if (!userExists && users.length > 0) {
        setError('No account found with this email address.');
        setLoading(false);
        return;
      }

      setSuccess('Verification OTP sent to ' + email + ' (Use 123456 to verify!)');
      setTimer(60);
      setForgotStep(2);
      setLoading(false);
    }, 1200);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    clearMessages();

    if (otp !== '123456') {
      setError('Invalid OTP code. Please enter 123456.');
      return;
    }

    setForgotStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    clearMessages();

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('infi_users') || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('infi_users', JSON.stringify(users));
      } else {
        // If they bypass, create account
        users.push({ name: 'Guest User', email, password: newPassword });
        localStorage.setItem('infi_users', JSON.stringify(users));
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      setLoading(false);
      setTimeout(() => {
        changeMode('login');
      }, 1500);
    }, 1500);
  };

  const handleGoogleMockSelect = (emailVal, nameVal) => {
    setLoading(true);
    setShowGoogleMock(false);

    setTimeout(() => {
      // Mock log in
      localStorage.setItem('infi_current_user', JSON.stringify({
        email: emailVal,
        name: nameVal,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nameVal)}`,
        loginType: 'google'
      }));

      // Make sure the user is in local db too
      const users = JSON.parse(localStorage.getItem('infi_users') || '[]');
      const userExists = users.some(u => u.email.toLowerCase() === emailVal.toLowerCase());
      if (!userExists) {
        users.push({ name: nameVal, email: emailVal, password: 'google-oauth-simulated' });
        localStorage.setItem('infi_users', JSON.stringify(users));
      }

      onLoginSuccess();
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="auth-container">
      {/* Background glowing blobs */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(99, 102, 241, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        top: '20%',
        left: '20%',
        zIndex: -1
      }}></div>
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(168, 85, 247, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        bottom: '20%',
        right: '20%',
        zIndex: -1
      }}></div>

      <div className="glass" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* INFI branding header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="animate-float animate-pulse-glow" style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <span style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-1px', color: '#fff' }}>IN</span>
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(to right, #ffffff, #c084fc, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            margin: 0
          }}>INFI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Next-Gen Multiplatform AI Voice Assistant
          </p>
        </div>

        {error && (
          <div className="animate-slide-in" style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="animate-slide-in" style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => changeMode('forgot')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '14px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                fontSize: '15px'
              }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            {/* Google Login Trigger */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowGoogleMock(true)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px'
              }}
              disabled={loading}
            >
              <GoogleIcon size={18} />
              Continue with Google
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => changeMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* SIGNUP MODE */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                fontSize: '15px'
              }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '16px' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => changeMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD FLOW */}
        {mode === 'forgot' && (
          <div>
            <button
              type="button"
              onClick={() => changeMode('login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                marginBottom: '20px',
                fontSize: '14px'
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>

            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Enter your registered email address and we'll send a 6-digit OTP code to verify your identity.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="input-field"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '44px' }}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '15px'
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    <>
                      <Key size={18} />
                      Send Verification Code
                    </>
                  )}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  A verification code has been sent. Please enter the OTP to confirm.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    6-Digit OTP
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input-field"
                      maxLength={6}
                      placeholder="Enter 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{ paddingLeft: '44px', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '15px'
                  }}
                >
                  Verify OTP
                </button>

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  {timer > 0 ? (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Resend code in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Verification complete! Enter your new password below.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ paddingLeft: '44px' }}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '15px'
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* MOCK GOOGLE SELECTOR MODAL */}
      {showGoogleMock && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="glass animated-slide-in" style={{
            width: '100%',
            maxWidth: '380px',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <GoogleIcon size={20} />
              <span style={{ fontSize: '15px', fontWeight: 'bold' }}>Sign in with Google</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Choose a Google account to continue to INFI Assistant:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn-secondary"
                onClick={() => handleGoogleMockSelect('jane.doe@gmail.com', 'Jane Doe')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  justifyContent: 'flex-start'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', paddingLeft: '8px' }}>JD</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>Jane Doe</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>jane.doe@gmail.com</div>
                </div>
              </button>

              <button
                className="btn-secondary"
                onClick={() => handleGoogleMockSelect('alex.developer@gmail.com', 'Alex Developer')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  justifyContent: 'flex-start'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#a855f7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', paddingLeft: '8px' }}>AD</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>Alex Developer</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>alex.developer@gmail.com</div>
                </div>
              </button>
            </div>
            
            <button
              className="btn-secondary"
              onClick={() => setShowGoogleMock(false)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '16px',
                fontSize: '13px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
