import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getOrCreateFreeToken, isFreeTokenUsed, markFreeTokenAsUsed } from '../lib/freeToken';
import QueryAnalyzerCard from '../components/QueryAnalyzerCard';
import FreeTrialModal from '../components/FreeTrialModal';

interface AnalysisResult {
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  suggestedIndex: string;
  rewrittenQuery: string;
  speedupEstimate: number;
}

function Landing() {
  const [query, setQuery] = useState('');
  const [schema, setSchema] = useState('');
  const [explain, setExplain] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      alert('Please enter a SQL query');
      return;
    }

    if (!isAuthenticated && isFreeTokenUsed()) {
      setShowFreeTrialModal(true);
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isAuthenticated) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      } else {
        const freeToken = getOrCreateFreeToken();
        headers['X-Free-Analysis-Token'] = freeToken;
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: query.trim(),
          schema: schema.trim() || undefined,
          explain: explain.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'free_limit_reached' || data.error === 'no_free_token') {
          markFreeTokenAsUsed();
          setShowFreeTrialModal(true);
          return;
        }
        throw new Error(data.message || 'Analysis failed');
      }

      if (!isAuthenticated) {
        markFreeTokenAsUsed();
      }

      setResult(data);
    } catch (error) {
      console.error('Error analyzing query:', error);
      alert('Failed to analyze query. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <style>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0c0e 0%, #0d0f11 50%, #0a0c0e 100%);
          color: #e5e5e5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .neon-glow {
          text-shadow: 0 0 40px rgba(0, 255, 163, 0.6), 0 0 80px rgba(0, 255, 163, 0.3);
        }

        .brand-logo {
          font-size: 56px;
          font-weight: 900;
          background: linear-gradient(135deg, #00ffa3 0%, #00cc82 50%, #00ffa3 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          display: inline-block;
        }

        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animated-terminal {
          background: #0a0c0e;
          border: 2px solid #1f2327;
          border-radius: 12px;
          padding: 24px;
          margin: 48px auto;
          max-width: 700px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 255, 163, 0.15);
        }

        .terminal-header {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .terminal-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
        }

        .terminal-dot:nth-child(2) {
          background: #eab308;
        }

        .terminal-dot:nth-child(3) {
          background: #10b981;
        }

        .terminal-line {
          font-family: 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.8;
          color: #9ca3af;
          margin-bottom: 4px;
          opacity: 0;
          animation: typeIn 0.5s ease forwards;
        }

        .terminal-line:nth-child(1) { animation-delay: 0.2s; }
        .terminal-line:nth-child(2) { animation-delay: 0.8s; }
        .terminal-line:nth-child(3) { animation-delay: 1.4s; }
        .terminal-line:nth-child(4) { animation-delay: 2s; }
        .terminal-line:nth-child(5) { animation-delay: 2.6s; }

        @keyframes typeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .keyword { color: #8b5cf6; }
        .string { color: #10b981; }
        .comment { color: #6b7280; }
        .success { color: #00ffa3; font-weight: 600; }

        .floating-icon {
          position: absolute;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        .database-icon {
          font-size: 80px;
          position: absolute;
          right: 10%;
          top: 20%;
          animation: float 8s ease-in-out infinite;
        }

        .query-icon {
          font-size: 60px;
          position: absolute;
          left: 5%;
          top: 40%;
          animation: float 7s ease-in-out infinite 1s;
        }

        .query-textarea {
          background: #0a0c0e;
          border: 2px solid #1f2327;
          color: #e5e5e5;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 15px;
          width: 100%;
          padding: 20px;
          border-radius: 12px;
          resize: vertical;
          min-height: 150px;
          transition: all 0.3s ease;
          line-height: 1.6;
        }

        .query-textarea:focus {
          outline: none;
          border-color: #00ffa3;
          box-shadow: 0 0 0 4px rgba(0, 255, 163, 0.15), 0 0 30px rgba(0, 255, 163, 0.2);
        }

        .query-textarea::placeholder {
          color: #4b5563;
        }

        .analyze-button {
          background: linear-gradient(135deg, #00ffa3 0%, #00cc82 100%);
          color: #0d0f11;
          border: none;
          padding: 18px 48px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 30px rgba(0, 255, 163, 0.5), 0 4px 20px rgba(0, 255, 163, 0.3);
          text-transform: none;
        }

        .analyze-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 0 45px rgba(0, 255, 163, 0.7), 0 6px 30px rgba(0, 255, 163, 0.4);
        }

        .analyze-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .analyze-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .toggle-link {
          color: #00ffa3;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px dashed #00ffa3;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-link:hover {
          opacity: 0.8;
          border-bottom-style: solid;
        }

        .advanced-fields {
          animation: slideDown 0.3s ease;
          overflow: hidden;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }

        .auth-links {
          position: fixed;
          top: 24px;
          right: 24px;
          display: flex;
          gap: 20px;
          align-items: center;
          z-index: 1000;
        }

        .auth-link {
          color: #9ca3af;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.2s ease;
          padding: 8px 16px;
          border-radius: 6px;
        }

        .auth-link:hover {
          color: #00ffa3;
          background: rgba(0, 255, 163, 0.1);
        }

        .auth-link.signup {
          background: #00ffa3;
          color: #0d0f11;
        }

        .auth-link.signup:hover {
          background: #00cc82;
          color: #0d0f11;
        }

        @media (max-width: 768px) {
          .auth-links {
            top: 16px;
            right: 16px;
            gap: 12px;
          }

          .analyze-button {
            width: 100%;
            padding: 16px;
          }
        }
      `}</style>

      <div className="landing-page">
        <div className="auth-links">
          <a href="/login" className="auth-link">Sign in</a>
          <a href="/signup" className="auth-link signup">Sign up</a>
        </div>

        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '80px 24px 100px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px', position: 'relative' }}>
            <div className="database-icon">💾</div>
            <div className="query-icon">⚡</div>

            <div className="brand-logo">
              DBPowerAI
            </div>

            <h1 className="neon-glow" style={{
              fontSize: 'clamp(40px, 6vw, 68px)',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '20px',
              lineHeight: '1.1',
              letterSpacing: '-0.03em'
            }}>
              Fix your slow queries<br />in 3 seconds.
            </h1>

            <p style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              color: '#00ffa3',
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              Senza diventare un DBA.
            </p>

            <p style={{
              fontSize: '18px',
              color: '#9ca3af',
              lineHeight: '1.7',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Incolla una query lenta, premi Analizza, guarda la magia:<br />
              score, problemi, indici, fix riscritto, e speedup stimato.<br />
              <span style={{ color: '#6b7280', fontSize: '16px' }}>
                E quasi un gioco — ma funziona davvero.
              </span>
            </p>

            <div className="animated-terminal">
              <div className="terminal-header">
                <div className="terminal-dot"></div>
                <div className="terminal-dot"></div>
                <div className="terminal-dot"></div>
              </div>
              <div>
                <div className="terminal-line">
                  <span className="comment">// Your slow query</span>
                </div>
                <div className="terminal-line">
                  <span className="keyword">SELECT</span> * <span className="keyword">FROM</span> orders <span className="keyword">WHERE</span> status = <span className="string">'PENDING'</span>
                </div>
                <div className="terminal-line">
                  <span className="comment">↓ DBPowerAI analyzing...</span>
                </div>
                <div className="terminal-line">
                  <span className="success">✓ Optimized query ready</span>
                </div>
                <div className="terminal-line">
                  <span className="success">✓ Index suggestion: CREATE INDEX idx_orders_status</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#111418',
            border: '2px solid #1f2327',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <textarea
              className="query-textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM orders WHERE status = 'PENDING' AND updated_at > NOW() - INTERVAL 5 DAY;"
            />

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginTop: '24px'
            }}>
              <button
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Analizza ora'}
              </button>

              <span
                className="toggle-link"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼' : '▶'} Aggiungi schema / EXPLAIN (opzionale)
              </span>
            </div>

            {showAdvanced && (
              <div className="advanced-fields" style={{
                marginTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    Schema (optional)
                  </label>
                  <textarea
                    className="query-textarea"
                    value={schema}
                    onChange={(e) => setSchema(e.target.value)}
                    placeholder="CREATE TABLE orders (&#10;  id INT PRIMARY KEY,&#10;  status VARCHAR(50),&#10;  updated_at TIMESTAMP&#10;);"
                    style={{ minHeight: '100px' }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    EXPLAIN output (optional)
                  </label>
                  <textarea
                    className="query-textarea"
                    value={explain}
                    onChange={(e) => setExplain(e.target.value)}
                    placeholder="Paste your EXPLAIN output here..."
                    style={{ minHeight: '100px' }}
                  />
                </div>
              </div>
            )}

            <div style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Oppure{' '}
              <a href="/signup" style={{ color: '#00ffa3', textDecoration: 'underline' }}>
                crea la tua API Key
              </a>
              {' '}e invia query via webhook
            </div>
          </div>

          {result && (
            <div style={{ marginTop: '48px' }}>
              <QueryAnalyzerCard result={result} />
            </div>
          )}

          {!isAuthenticated && !isFreeTokenUsed() && (
            <div style={{
              marginTop: '48px',
              padding: '24px',
              background: 'rgba(0, 255, 163, 0.05)',
              border: '1px solid rgba(0, 255, 163, 0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '15px',
                color: '#9ca3af',
                marginBottom: '12px'
              }}>
                🎁 You have <strong style={{ color: '#00ffa3' }}>1 free analysis</strong> remaining
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Sign up for unlimited access — it's free!
              </p>
            </div>
          )}
        </div>

        {showFreeTrialModal && (
          <FreeTrialModal onClose={() => setShowFreeTrialModal(false)} />
        )}
      </div>
    </>
  );
}

export default Landing;
