import React, { useState } from 'react';
import { Code, Play, Copy, Check, Terminal, Sparkles, Send, FileCode } from 'lucide-react';

const SUGGESTED_TEMPLATES = [
  {
    title: 'Python Binary Search',
    lang: 'python',
    prompt: 'Write a recursive Binary Search function in Python with description and time complexity analysis.'
  },
  {
    title: 'CSS Glassmorphism Card',
    lang: 'css',
    prompt: 'Write modern responsive CSS classes for a futuristic frosted-glass glassmorphic container card.'
  },
  {
    title: 'JavaScript Debounce',
    lang: 'javascript',
    prompt: 'Create a custom Javascript utility function to debounce user input events with a clear example.'
  },
  {
    title: 'Go REST API Handler',
    lang: 'go',
    prompt: 'Write a simple HTTP GET handler in Go using net/http that queries data and returns JSON.'
  }
];

export default function Coding({ onRunCodingPrompt }) {
  const [lang, setLang] = useState('python');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleTemplateClick = (t) => {
    setLang(t.lang);
    setPrompt(t.prompt);
  };

  const handleSolve = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);

    const apiKey = localStorage.getItem('infi_gemini_key') || 'AQ.Ab8RN6JkEvbYYV-Mp0_iwCQIsgHTKmg4Cvs3UCMwsUIHK3_QVw';

    // Standard local fallback responses in case there is no API key configured.
    // This allows the app to work seamlessly out-of-the-box!
    if (!apiKey) {
      setTimeout(() => {
        let code = '';
        let explain = '';
        if (lang === 'python') {
          code = `def binary_search(arr, low, high, x):
    # Check base case
    if high >= low:
        mid = (high + low) // 2

        # If element is present at the middle itself
        if arr[mid] == x:
            return mid

        # If element is smaller than mid, then it can only be in left subarray
        elif arr[mid] > x:
            return binary_search(arr, low, mid - 1, x)

        # Else the element can only be in right subarray
        else:
            return binary_search(arr, mid + 1, high, x)

    else:
        # Element is not present in the array
        return -1`;
          explain = `### Python Binary Search Implementation\n\n- **Time Complexity:** O(log n)\n- **Space Complexity:** O(log n) auxiliary stack space for recursion.\n- **Use-Case:** Highly optimized searching in sorted datasets.`;
        } else if (lang === 'css') {
          code = `.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

.glass-card:hover {
    transform: translateY(-5px);
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 10px 40px rgba(99, 102, 241, 0.2);
}`;
          explain = `### CSS Glassmorphic Styling\n\n- **Backdrop-filter:** Enables the frosty blurring effect on the behind layers.\n- **Translucent Border:** Creates a premium 3D edge highlight.\n- **Hover Transition:** Smooth scale and glow transitions.`;
        } else {
          code = `// Javascript Debounce Function
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}`;
          explain = `### JavaScript Debouncer\n\n- **Concept:** Limits the rate at which a function gets triggered.\n- **Application:** Essential for search input fields, window resize handles, or scrolling events to improve UI efficiency.`;
        }

        setResult({ code, explain });
        setLoading(false);

        // Store in history
        saveToHistory(prompt, `CODE ANSWER:\n${code}\n\n${explain}`, 'code');
      }, 1200);
      return;
    }

    try {
      let res;
      let data;
      try {
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert software developer. Please solve this coding problem: "${prompt}".
Please structure your answer in TWO sections separated by the marker "===EXPLAIN_SPLIT===".
First, write ONLY the clean code block, no markdown enclosing code blocks, just raw code.
Second, write the documentation/explanation in markdown.
Example format:
[write your code here]
===EXPLAIN_SPLIT===
[write your markdown explanation here]`
              }]
            }]
          })
        });
        data = await res.json();
      } catch (err) {
        console.warn("Primary coding model failed, trying fallback...", err);
      }

      // If primary model failed, was unavailable, or exceeded quota, fall back to gemini-3.1-flash-lite
      if (!data || data.error) {
        console.log("Primary coding model error, trying fallback gemini-3.1-flash-lite...");
        res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert software developer. Please solve this coding problem: "${prompt}".
Please structure your answer in TWO sections separated by the marker "===EXPLAIN_SPLIT===".
First, write ONLY the clean code block, no markdown enclosing code blocks, just raw code.
Second, write the documentation/explanation in markdown.
Example format:
[write your code here]
===EXPLAIN_SPLIT===
[write your markdown explanation here]`
              }]
            }]
          })
        });
        data = await res.json();
      }
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const fullResponse = data.candidates[0].content.parts[0].text;
        
        let code = '';
        let explain = '';

        if (fullResponse.includes('===EXPLAIN_SPLIT===')) {
          const parts = fullResponse.split('===EXPLAIN_SPLIT===');
          code = parts[0].trim();
          explain = parts[1].trim();
        } else {
          // If formatting is loose, extract via markdown blocks
          const codeBlockRegex = /```(?:\w+)?([\s\S]*?)```/g;
          const match = codeBlockRegex.exec(fullResponse);
          if (match) {
            code = match[1].trim();
            explain = fullResponse.replace(match[0], '').trim();
          } else {
            code = '// Solution generated';
            explain = fullResponse;
          }
        }

        setResult({ code, explain });
        saveToHistory(prompt, `CODE ANSWER:\n${code}\n\n${explain}`, 'code');
      } else {
        setResult({ code: '// Error', explain: 'Failed to generate code logic.' });
      }
    } catch (err) {
      setResult({ code: '// Connection Error', explain: `Request failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (queryStr, responseStr, type) => {
    const history = JSON.parse(localStorage.getItem('infi_chat_history') || '[]');
    history.push({
      id: Date.now(),
      query: queryStr,
      response: responseStr,
      timestamp: new Date().toISOString(),
      isVoice: false,
      type: type
    });
    localStorage.setItem('infi_chat_history', JSON.stringify(history));
  };

  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-slide-in" style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Code Solver & Playground</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Solve algorithmic problems, generate responsive UI styling, or write API endpoints instantly.
        </p>
      </div>

      {/* Templates */}
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Fast Templates
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {SUGGESTED_TEMPLATES.map((t, idx) => (
            <button
              key={idx}
              onClick={() => handleTemplateClick(t)}
              className="glass-interactive"
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{t.title}</span>
              <span style={{ fontSize: '11px', color: 'var(--primary)', textTransform: 'uppercase' }}>{t.lang}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSolve} className="glass" style={{
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Select Programming Language
            </label>
            <select
              className="input-field"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript / TypeScript</option>
              <option value="css">HTML & CSS</option>
              <option value="go">Go (Golang)</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Problem Description / Prompt
          </label>
          <textarea
            className="input-field"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Write a function that finds the longest common prefix in an array of strings..."
            rows={4}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px'
          }}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <>
              <Sparkles size={16} /> Solve & Compile Code
            </>
          )}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Code Editor Mock */}
          <div className="glass" style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={16} style={{ color: 'var(--cyan)' }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  solution.{lang === 'python' ? 'py' : lang === 'javascript' ? 'js' : lang === 'css' ? 'css' : lang === 'go' ? 'go' : lang === 'java' ? 'java' : 'cpp'}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Code Body */}
            <div style={{ display: 'flex', background: 'rgba(5, 5, 10, 0.5)' }}>
              {/* Line Numbers */}
              <div style={{
                padding: '16px 8px',
                textAlign: 'right',
                userSelect: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                borderRight: '1px solid rgba(255, 255, 255, 0.04)',
                background: 'rgba(0,0,0,0.1)',
                width: '44px'
              }}>
                {result.code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              
              {/* Code text */}
              <pre style={{
                margin: 0,
                border: 'none',
                background: 'none',
                flex: 1,
                padding: '16px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                <code style={{ color: '#818cf8' }}>{result.code}</code>
              </pre>
            </div>
          </div>

          {/* Explanation Markdown */}
          <div className="glass" style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'var(--text-secondary)'
          }}>
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 'bold' }}>
              Explanation & Approach
            </h3>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {result.explain}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
