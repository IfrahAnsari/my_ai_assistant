
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, AlertCircle, Play, Square, Code, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';

const YoutubeIcon = ({ size = 24, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={style} fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Assistant({ backendStatus, backendUrl }) {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Audio playback controls
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentSong, setCurrentSong] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  
  // Refs
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize Speech Synth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      if (status === 'listening') {
        // High frequency active purple/cyan wave
        phase += 0.15;
        ctx.lineWidth = 3;
        
        // Outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        
        // Draw Cyan Wave
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.03 + phase) * 35 * Math.sin(x * Math.PI / width);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Violet Wave
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.02 - phase + Math.PI/4) * 25 * Math.sin(x * Math.PI / width);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } 
      else if (status === 'speaking') {
        // Smooth undulating Indigo wave
        phase += 0.05;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
        ctx.strokeStyle = '#6366f1';
        
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.015 + phase) * 20 * Math.sin(x * Math.PI / width);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } 
      else if (status === 'processing') {
        // Rapid small pulsing waves
        phase += 0.25;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.strokeStyle = '#f8fafc';
        
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.05 + phase) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      else {
        // Idle pulsing rings in the center
        phase += 0.02;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 2;
        
        const pulseRadius = 40 + Math.sin(phase) * 5;
        ctx.beginPath();
        ctx.arc(width / 2, centerY, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.beginPath();
        ctx.arc(width / 2, centerY, pulseRadius - 15, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Reset shadow
      ctx.shadowBlur = 0;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [status]);

  // Handle Speech Recognition Trigger
  const toggleListening = () => {
    if (status === 'listening') {
      stopListening();
      return;
    }

    // Initialize Web Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported on this browser/device. Try Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Load setting details
    const selectedLang = localStorage.getItem('infi_selected_language') || 'en-US';
    recognition.lang = selectedLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('listening');
      setTranscript('');
      setResponse('');
      setErrorMsg('');
      if (synthRef.current) synthRef.current.cancel(); // Stop talking if assistant was speaking
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      processQuery(resultText, true);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      if (event.error !== 'no-speech') {
        setErrorMsg(`Speech recognition error: ${event.error}`);
        setStatus('idle');
      } else {
        setStatus('idle');
      }
    };

    recognition.onend = () => {
      if (status === 'listening') {
        setStatus('idle');
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus('idle');
  };

  // Safe Math Evaluator
  const evaluateMath = (expr) => {
    // Clean string from letters unless they are math terms
    const cleanExpr = expr.replace(/[^\d+\-*/%().\s^]/g, '').trim();
    if (!cleanExpr) return null;
    
    try {
      // Evaluate basic arithmetic safely (no arbitrary JS code execution)
      // Since eval is dangerous, we can use a safe evaluator logic.
      // Replacing ^ with Math.pow equivalent
      let mathSafe = cleanExpr.replace(/\^/g, '**');
      
      // Strict character check to prevent code injection
      if (/^[\d+\-*/%().\s*]+$/.test(mathSafe)) {
        // Safe evaluation without using eval keyword directly
        const result = Function("return " + mathSafe)();
        return { expr: cleanExpr, result };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Main Command Routing Engine
  const processQuery = async (queryStr, isVoiceInput = false) => {
    if (!queryStr.trim()) return;
    
    setStatus('processing');
    setErrorMsg('');
    
    const queryLower = queryStr.toLowerCase().trim();

    // 1. MATH CORNER
    // Check if query is simple math, e.g., "89*89", "879*76"
    // Also captures words like "what is 89 times 89" -> converts to "89*89"
    let mathExpr = queryLower
      .replace(/what is|calculate|solve/g, '')
      .replace(/times|multiplied by/g, '*')
      .replace(/divided by/g, '/')
      .replace(/plus/g, '+')
      .replace(/minus/g, '-')
      .replace(/x/g, '*'); // common voice typo for multiplication
    
    const mathResult = evaluateMath(mathExpr);
    if (mathResult !== null) {
      const ansText = `Calculating ${mathResult.expr}: The answer is ${mathResult.result}.`;
      setResponse(ansText);
      saveToHistory(queryStr, ansText, isVoiceInput, 'math');
      speak(ansText);
      return;
    }

    // 2. PLAY SONG INTERCEPTION
    // Matches "play song SongName", "play SongName", "play track SongName"
    const playMatch = queryLower.match(/^(?:play song|play music|play track|play)\s+(.+)$/);
    if (playMatch) {
      let rawSongName = playMatch[1].trim();
      let songName = rawSongName;
      let platform = 'youtube'; // default
      
      // Parse platform from query
      if (rawSongName.endsWith(' in spotify') || rawSongName.endsWith(' on spotify')) {
        platform = 'spotify';
        songName = rawSongName.replace(/\s+(?:in|on)\s+spotify$/, '').trim();
      } else if (rawSongName.endsWith(' in youtube') || rawSongName.endsWith(' on youtube')) {
        platform = 'youtube';
        songName = rawSongName.replace(/\s+(?:in|on)\s+youtube$/, '').trim();
      }
      
      setCurrentSong(songName);
      
      const platformDisplay = platform === 'spotify' ? 'Spotify' : 'YouTube';
      const songResponseText = `Sure! I'm starting to play "${songName}" on ${platformDisplay} for you.`;
      setResponse(songResponseText);
      saveToHistory(queryStr, songResponseText, isVoiceInput, 'media');
      speak(songResponseText);

      if (backendStatus) {
        try {
          await fetch(`${backendUrl}/api/play-song`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: songName, platform: platform })
          });
        } catch (e) {
          console.error("Backend play-song error: ", e);
        }
      } else {
        // Fallback: Web search in new tab
        if (platform === 'spotify') {
          window.open(`https://open.spotify.com/search/${encodeURIComponent(songName)}`, '_blank');
        } else {
          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(songName + ' song')}`, '_blank');
        }
      }
      return;
    }

    // 3. OPEN WEBSITE/APPLICATION INTERCEPTION
    // Matches "open instagram", "open chrome", "open excel", "open microsoft word", etc.
    const openMatch = queryLower.match(/^(?:open app|open website|open)\s+(.+)$/);
    if (openMatch) {
      const appName = openMatch[1].trim();
      let destinationUrl = '';
      
      // Identify target web URLs for fallback (mobile/web)
      if (appName.includes('instagram')) destinationUrl = 'https://instagram.com';
      else if (appName.includes('chrome') || appName.includes('google search')) destinationUrl = 'https://google.com';
      else if (appName.includes('microsoft') || appName.includes('word') || appName.includes('excel') || appName.includes('powerpoint')) destinationUrl = 'https://office.com';
      else if (appName.includes('youtube')) destinationUrl = 'https://youtube.com';
      else if (appName.includes('facebook')) destinationUrl = 'https://facebook.com';
      else if (appName.includes('github')) destinationUrl = 'https://github.com';
      else if (appName.includes('spotify')) destinationUrl = 'https://spotify.com';
      else if (appName.includes('netflix')) destinationUrl = 'https://netflix.com';
      else if (appName.includes('chatgpt') || appName.includes('openai')) destinationUrl = 'https://chatgpt.com';
      else if (appName.includes('twitter') || appName.includes(' x ')) destinationUrl = 'https://x.com';
      else if (appName.includes('linkedin')) destinationUrl = 'https://linkedin.com';
      else if (appName.includes('gmail')) destinationUrl = 'https://mail.google.com';
      else if (appName.includes('amazon')) destinationUrl = 'https://amazon.com';
      else if (appName.includes('reddit')) destinationUrl = 'https://reddit.com';
      else destinationUrl = `https://www.google.com/search?q=${encodeURIComponent(appName)}`;

      const openResponseText = `Opening ${appName} as requested.`;
      setResponse(openResponseText);
      saveToHistory(queryStr, openResponseText, isVoiceInput, 'system');
      speak(openResponseText);

      if (backendStatus) {
        // Desktop Mode: Call Python backend to launch native application
        try {
          let endpoint = '/api/open-app';
          let bodyData = { name: appName };

          // If it contains a dot, or was clearly a website domain, open as website
          if (appName.includes('.') || appName.startsWith('http')) {
            endpoint = '/api/open-website';
            bodyData = { url: appName };
          }

          const res = await fetch(`${backendUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
          });
          const data = await res.json();
          if (!data.success) {
            // Fallback to web link if desktop command fails
            window.open(destinationUrl, '_blank');
          }
        } catch (e) {
          window.open(destinationUrl, '_blank');
        }
      } else {
        // Web/Mobile Mode: Fallback to opening web application
        window.open(destinationUrl, '_blank');
      }
      return;
    }

    // 4. SYSTEM UTILITIES INTERCEPTION
    // Screenshot, Lock screen, volume up/down/mute
    if (queryLower.includes('screenshot') || queryLower.includes('take a photo') || queryLower.includes('capture screen')) {
      const text = "Taking a screenshot now.";
      setResponse(text);
      speak(text);
      if (backendStatus) {
        try {
          await fetch(`${backendUrl}/api/screenshot`, { method: 'POST' });
        } catch (e) {
          setErrorMsg("Could not execute screenshot command.");
        }
      } else {
        setErrorMsg("Screenshots require the desktop backend to be active.");
      }
      return;
    }

    if (queryLower.includes('lock screen') || queryLower.includes('lock my pc') || queryLower.includes('lock pc')) {
      const text = "Locking workstation.";
      setResponse(text);
      speak(text);
      if (backendStatus) {
        try {
          await fetch(`${backendUrl}/api/lock`, { method: 'POST' });
        } catch (e) {
          setErrorMsg("Could not lock pc.");
        }
      } else {
        setErrorMsg("Workstation locking requires the desktop backend to be active.");
      }
      return;
    }

    if (queryLower.includes('volume')) {
      let action = '';
      if (queryLower.includes('up') || queryLower.includes('increase')) action = 'up';
      else if (queryLower.includes('down') || queryLower.includes('decrease')) action = 'down';
      else if (queryLower.includes('mute') || queryLower.includes('silence')) action = 'mute';

      if (action) {
        const text = `Adjusting system volume: ${action}.`;
        setResponse(text);
        speak(text);
        if (backendStatus) {
          try {
            await fetch(`${backendUrl}/api/volume`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action })
            });
          } catch (e) {
            setErrorMsg("Could not execute volume adjust.");
          }
        } else {
          setErrorMsg("Volume adjustment requires the desktop backend to be active.");
        }
        return;
      }
    }

    // 5. GEMINI AI GENERAL QUERY
    // Queries Gemini API using saved key (or user fallback)
    const apiKey = localStorage.getItem('infi_gemini_key') || 'AQ.Ab8RN6JkEvbYYV-Mp0_iwCQIsgHTKmg4Cvs3UCMwsUIHK3_QVw';
    if (!apiKey) {
      // Local fallback responses for basic greetings/about
      let localReply = '';
      if (queryLower.includes('hello') || queryLower.includes('hi')) {
        localReply = "Hello! I am INFI, your personal AI voice assistant. How can I help you today?";
      } else if (queryLower.includes('who are you') || queryLower.includes('your name')) {
        localReply = "I am INFI, a high-performance voice assistant compatible with desktop and mobile devices. Set up a Gemini API Key in Settings to enable my full intelligence!";
      } else {
        localReply = "I'm running in local mode. Please configure a Gemini API Key in the Settings panel to ask complex questions, solve coding problems, or talk about arbitrary topics.";
      }
      
      setResponse(localReply);
      saveToHistory(queryStr, localReply, isVoiceInput, 'chat');
      speak(localReply);
      return;
    }

    try {
      const selectedLang = localStorage.getItem('infi_selected_language') || 'en-US';
      
      // Request content from Gemini API with fallback
      let res;
      let data;
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are "INFI", a premium, responsive, highly capable voice assistant for mobile and desktop.
The user is speaking or typing to you in: ${selectedLang}.
Please answer the query concisely (ideal for text-to-speech) and in the same language the user is using.
Query: "${queryStr}"`
              }]
            }]
          })
        });
        data = await res.json();
      } catch (err) {
        console.warn("Primary model call failed, trying fallback...", err);
      }

      // If primary model failed, was unavailable, or exceeded quota, fall back to gemini-3.1-flash-lite
      if (!data || data.error) {
        console.log("Primary model error:", data?.error?.message || "fetch failed", "Trying fallback gemini-3.1-flash-lite...");
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are "INFI", a premium, responsive, highly capable voice assistant for mobile and desktop.
The user is speaking or typing to you in: ${selectedLang}.
Please answer the query concisely (ideal for text-to-speech) and in the same language the user is using.
Query: "${queryStr}"`
              }]
            }]
          })
        });
        data = await res.json();
      }
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const replyText = data.candidates[0].content.parts[0].text;
        setResponse(replyText);
        saveToHistory(queryStr, replyText, isVoiceInput, 'chat');
        speak(replyText);
      } else {
        const errText = "Sorry, I received an invalid response structure from the AI engine.";
        setResponse(errText);
        speak(errText);
      }
    } catch (err) {
      console.error(err);
      const errMsg = "Connection error. Please check your internet or API key.";
      setResponse(errMsg);
      speak(errMsg);
    }
  };

  const saveToHistory = (queryStr, responseStr, isVoice, type) => {
    const history = JSON.parse(localStorage.getItem('infi_chat_history') || '[]');
    history.push({
      id: Date.now(),
      query: queryStr,
      response: responseStr,
      timestamp: new Date().toISOString(),
      isVoice: isVoice,
      type: type
    });
    localStorage.setItem('infi_chat_history', JSON.stringify(history));
  };

  // Text-to-Speech Output
  const speak = (text) => {
    if (!ttsEnabled || !synthRef.current) {
      setStatus('idle');
      return;
    }

    // Cancel existing talking
    synthRef.current.cancel();

    // Clean markdown characters from speaking text for cleaner speech
    const cleanSpeech = text
      .replace(/[*_`#]/g, '')
      .replace(/\[|\]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'website link');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utteranceRef.current = utterance;

    // Apply voice settings
    const selectedVoiceName = localStorage.getItem('infi_selected_voice') || '';
    const voices = synthRef.current.getVoices();
    if (selectedVoiceName) {
      const match = voices.find(v => v.name === selectedVoiceName);
      if (match) utterance.voice = match;
    }
    
    const selectedLang = localStorage.getItem('infi_selected_language') || 'en-US';
    utterance.lang = selectedLang;

    utterance.onstart = () => {
      setStatus('speaking');
    };

    utterance.onend = () => {
      setStatus('idle');
    };

    utterance.onerror = (e) => {
      console.error("TTS speech error: ", e);
      setStatus('idle');
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setStatus('idle');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const query = inputText;
    setInputText('');
    setTranscript(query);
    processQuery(query, false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between',
      padding: '20px 16px',
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
      position: 'relative'
    }}>
      
      {/* Top Banner Status */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={24} style={{ color: 'var(--primary)' }} />
          INFI Assistant
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          {status === 'idle' && 'Say "open chrome", "play song shape of you", or ask questions...'}
          {status === 'listening' && 'Listening closely to your voice...'}
          {status === 'processing' && 'INFI is thinking...'}
          {status === 'speaking' && 'INFI is speaking response...'}
        </p>
      </div>

      {/* Visualizer and Conversation Display */}
      <div className="glass" style={{
        flex: 1,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px',
        minHeight: '260px'
      }}>
        
        {/* Canvas Visualizer */}
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={120} 
          style={{ 
            maxWidth: '100%',
            height: '100px',
            borderRadius: 'var(--radius-md)'
          }} 
        />

        {/* Audio feedback actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={toggleListening}
            className={`btn-primary animate-pulse-glow`}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: status === 'listening' ? 'var(--error)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)'
            }}
          >
            {status === 'listening' ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          {status === 'speaking' && (
            <button
              onClick={stopSpeaking}
              className="btn-secondary"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.08)'
              }}
              title="Stop speaking"
            >
              <Square size={20} />
            </button>
          )}

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="btn-secondary"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              color: ttsEnabled ? 'var(--cyan)' : 'var(--text-muted)'
            }}
            title={ttsEnabled ? 'Mute Assistant Voice' : 'Unmute Assistant Voice'}
          >
            {ttsEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        {/* Transcription and Response Bubbles */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transcript && (
            <div className="animate-slide-in" style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginBottom: '2px' }}>
                You said
              </div>
              <div className="glass" style={{
                padding: '10px 16px',
                borderRadius: '16px 16px 4px 16px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontSize: '14px',
                color: 'var(--text-primary)',
                wordBreak: 'break-word'
              }}>
                {transcript}
              </div>
            </div>
          )}

          {response && (
            <div className="animate-slide-in" style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                INFI reply
              </div>
              <div className="glass" style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'rgba(255, 255, 255, 0.03)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {response}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="glass" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              fontSize: '13px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Text Input Panel */}
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask INFI anything or type command..."
          disabled={status === 'processing' || status === 'listening'}
          style={{ height: '48px', borderRadius: '24px', paddingLeft: '20px' }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          disabled={!inputText.trim() || status === 'processing' || status === 'listening'}
        >
          <Send size={18} />
        </button>
      </form>

      {/* FLOATING MEDIA PLAYER OVERLAY (WOW ACCENT) */}
      {currentSong && (
        <div className="glass animate-slide-in glow-secondary" style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          background: 'rgba(13, 13, 22, 0.95)',
          maxWidth: '300px',
          zIndex: 100
        }}>
          <YoutubeIcon size={24} style={{ color: '#ea4335', flexShrink: 0 }} />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NOW PLAYING</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentSong}
            </div>
          </div>
          <button 
            onClick={() => setCurrentSong('')} 
            className="btn-secondary"
            style={{ padding: '2px 6px', fontSize: '10px', borderRadius: '4px' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
