import { useState } from 'react';

type TabType = 'before' | 'after' | 'indexes' | 'explanation' | 'advanced';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('before');
  const [isAnimating, setIsAnimating] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    database: '',
    painPoint: '',
    query: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    database: '',
    painPoint: ''
  });

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsAnimating(false);
    }, 150);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const invalidPatterns = [
      /test@test\./i,
      /aaa@aaa\./i,
      /abc@abc\./i,
      /example@example\./i,
      /demo@demo\./i,
      /fake@fake\./i,
      /asdf@asdf\./i,
      /qwer@qwer\./i
    ];

    return !invalidPatterns.some(pattern => pattern.test(email));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'email' && value) {
      setErrors(prev => ({ ...prev, email: '' }));
    } else if (field === 'database' && value) {
      setErrors(prev => ({ ...prev, database: '' }));
    } else if (field === 'painPoint' && value) {
      setErrors(prev => ({ ...prev, painPoint: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasErrors = false;
    const newErrors = { email: '', database: '', painPoint: '' };

    if (!formData.email) {
      newErrors.email = 'Work email is required';
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid work email';
      hasErrors = true;
    }

    if (!formData.database) {
      newErrors.database = 'Please select your database';
      hasErrors = true;
    }

    if (!formData.painPoint) {
      newErrors.painPoint = 'Please select an option';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const form = e.target as HTMLFormElement;
    form.submit();
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background-color: #0d0f11;
          color: #e5e5e5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
        }

        .glow-text {
          text-shadow: 0 0 30px rgba(0, 255, 163, 0.4);
        }

        .glow-button {
          box-shadow: 0 0 25px rgba(0, 255, 163, 0.5);
          transition: all 0.3s ease;
        }

        .glow-button:hover {
          box-shadow: 0 0 35px rgba(0, 255, 163, 0.7);
          transform: translateY(-2px);
        }

        .card {
          background: #111418;
          border: 1px solid #1f2327;
          border-radius: 12px;
          padding: 32px;
          transition: all 0.3s ease;
        }

        .card:hover {
          border-color: #00ffa3;
          box-shadow: 0 0 25px rgba(0, 255, 163, 0.2);
          transform: translateY(-4px);
        }

        .code-block {
          background: #0a0c0e;
          border: 1px solid #1f2327;
          border-radius: 8px;
          padding: 24px;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 14px;
          overflow-x: auto;
          line-height: 1.6;
        }

        .code-header {
          color: #00ffa3;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .code-comment {
          color: #6b7280;
        }

        .code-keyword {
          color: #8b5cf6;
        }

        .code-string {
          color: #10b981;
        }

        input, textarea {
          background: #111418;
          border: 1px solid #1f2327;
          color: #e5e5e5;
          transition: all 0.2s ease;
        }

        input::placeholder, textarea::placeholder {
          color: #6b7280;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #00ffa3;
          box-shadow: 0 0 0 3px rgba(0, 255, 163, 0.15);
        }

        select {
          background: #111418;
          border: 1px solid #1f2327;
          color: #e5e5e5;
          transition: all 0.2s ease;
        }

        .error-message {
          color: #ef4444;
          font-size: 13px;
          margin-top: 6px;
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid #1f2327;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .radio-option:hover {
          border-color: #00ffa3;
          background: rgba(0, 255, 163, 0.05);
        }

        .radio-option input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #00ffa3;
          cursor: pointer;
        }

        .radio-option label {
          cursor: pointer;
          color: #e5e5e5;
          font-size: 15px;
        }

        .form-fade-in {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          display: block;
          stroke-width: 3;
          stroke: #00ffa3;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #00ffa3;
          animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
        }

        .success-checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #00ffa3;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .success-checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 30px #00ffa3;
          }
        }

        .disclaimer {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-top: 16px;
          color: #ef4444;
          font-size: 13px;
          animation: fadeIn 0.3s ease;
        }

        .tab {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid #1f2327;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
        }

        .tab:hover {
          color: #00ffa3;
          border-color: #00ffa3;
        }

        .tab.active {
          background: #00ffa3;
          color: #0d0f11;
          border-color: #00ffa3;
        }

        .tab-content {
          animation: fadeSlideIn 0.3s ease;
        }

        .tab-content.animating {
          opacity: 0;
          transform: translateX(20px);
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }

        .split-code {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .split-code {
            grid-template-columns: 1fr;
          }

          .tab-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tabs {
            min-width: max-content;
          }

          .auth-bar {
            top: 12px !important;
            right: 12px !important;
            flex-direction: row !important;
            gap: 12px !important;
            fontSize: 13px !important;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0d0f11' }}>
        {/* Auth Bar - Top Right */}
        <div className="auth-bar" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          <a
            href="/login"
            style={{
              color: '#9ca3af',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              borderBottom: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e5e5e5';
              e.currentTarget.style.borderBottomColor = '#e5e5e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            style={{
              color: '#00ffa3',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              borderBottom: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottomColor = '#00ffa3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            Sign up
          </a>
        </div>

        {/* Hero Section */}
        <section style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '100px 40px 80px',
          textAlign: 'center'
        }}>
          <h1 className="glow-text" style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '24px',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Fix Your Slow SQL Queries with AI
          </h1>

          <p style={{
            fontSize: '20px',
            color: '#9ca3af',
            marginBottom: '16px',
            lineHeight: '1.5',
            maxWidth: '800px',
            margin: '0 auto 16px'
          }}>
            Paste your SQL query + optional schema and get an optimized version, recommended indexes, and a clear human explanation.
          </p>

          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '48px'
          }}>
            Built for developers. No DBA expertise required.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '48px'
          }}>
            <a
              href="#early-access"
              className="glow-button"
              style={{
                display: 'inline-block',
                backgroundColor: '#00ffa3',
                color: '#0d0f11',
                padding: '16px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Join Early Access
            </a>

            <a
              href="#how-it-works"
              style={{
                display: 'inline-block',
                color: '#00ffa3',
                padding: '16px 32px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Learn how it works →
            </a>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                color: '#e5e5e5',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '12px 24px',
                border: '1px solid #1f2327',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00ffa3';
                e.currentTarget.style.borderColor = '#00ffa3';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 163, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e5e5e5';
                e.currentTarget.style.borderColor = '#1f2327';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Try the Demo
            </a>
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              (Login required)
            </div>
          </div>

          {/* Simple Before/After Preview */}
          <div className="split-code">
            <div className="code-block">
              <div className="code-header">Input Query</div>
              <code style={{ color: '#cccccc', display: 'block', whiteSpace: 'pre' }}>
{`SELECT *
FROM orders
WHERE customer_id = 42
ORDER BY created_at;`}
              </code>
            </div>

            <div className="code-block">
              <div className="code-header">Optimized Output</div>
              <code style={{ color: '#00ffa3', display: 'block', whiteSpace: 'pre' }}>
{`SELECT id, customer_id,
       created_at, total
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC;`}
              </code>
            </div>
          </div>
        </section>

        {/* Animated Tabs Section */}
        <section style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '80px 40px',
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            See It In Action
          </h2>

          <div style={{
            background: '#111418',
            border: '1px solid #1f2327',
            borderRadius: '12px',
            padding: '32px',
          }}>
            <div className="tab-container" style={{ marginBottom: '32px', overflowX: 'auto' }}>
              <div className="tabs" style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <button
                  className={`tab ${activeTab === 'before' ? 'active' : ''}`}
                  onClick={() => handleTabChange('before')}
                >
                  Before
                </button>
                <button
                  className={`tab ${activeTab === 'after' ? 'active' : ''}`}
                  onClick={() => handleTabChange('after')}
                >
                  After
                </button>
                <button
                  className={`tab ${activeTab === 'indexes' ? 'active' : ''}`}
                  onClick={() => handleTabChange('indexes')}
                >
                  Indexes
                </button>
                <button
                  className={`tab ${activeTab === 'explanation' ? 'active' : ''}`}
                  onClick={() => handleTabChange('explanation')}
                >
                  Explanation
                </button>
                <button
                  className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
                  onClick={() => handleTabChange('advanced')}
                >
                  Advanced Case
                </button>
              </div>
            </div>

            <div className={`tab-content ${isAnimating ? 'animating' : ''}`}>
              {activeTab === 'before' && (
                <div className="code-block">
                  <div className="code-header">Input Query</div>
                  <pre style={{ color: '#cccccc', margin: 0 }}>
{`SELECT *
FROM orders
WHERE customer_id = 42
ORDER BY created_at;`}
                  </pre>
                </div>
              )}

              {activeTab === 'after' && (
                <div className="code-block">
                  <div className="code-header">Optimized Query</div>
                  <pre style={{ color: '#00ffa3', margin: 0 }}>
{`SELECT id, customer_id, created_at, total
FROM orders
WHERE customer_id = 42
ORDER BY created_at DESC;

-- Suggested Index:
CREATE INDEX idx_orders_customer_created
ON orders (customer_id, created_at);`}
                  </pre>
                </div>
              )}

              {activeTab === 'indexes' && (
                <div className="code-block">
                  <div className="code-header">Suggested Index</div>
                  <pre style={{ color: '#00ffa3', margin: 0 }}>
{`CREATE INDEX idx_orders_customer_created
ON orders (customer_id, created_at);`}
                  </pre>
                  <div style={{ marginTop: '20px', color: '#cccccc' }}>
                    <p style={{ marginBottom: '8px', color: '#00ffa3', fontWeight: 600 }}>Reason:</p>
                    <p style={{ marginBottom: '4px' }}>• Helps WHERE + ORDER BY</p>
                    <p style={{ marginBottom: '4px' }}>• Prevents full table scan</p>
                    <p>• Uses composite index for sorting</p>
                  </div>
                </div>
              )}

              {activeTab === 'explanation' && (
                <div className="code-block">
                  <div className="code-header">Explanation</div>
                  <div style={{ color: '#cccccc' }}>
                    <p style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#ef4444' }}>Before:</strong> full-table scan + sorting → slow on large datasets.
                    </p>
                    <p style={{ marginBottom: '16px' }}>
                      <strong style={{ color: '#00ffa3' }}>After:</strong> composite index (customer_id, created_at) enables fast filtering and ordering.
                    </p>
                    <p>
                      DBPowerAI rewrites SQL, suggests indexes, and explains the logic behind each optimization.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div>
                  <div className="code-block" style={{ marginBottom: '20px' }}>
                    <div className="code-header">Input Query</div>
                    <pre style={{ color: '#cccccc', margin: 0 }}>
{`SELECT o.id, o.customer_id, SUM(oi.price * oi.qty) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed'
AND o.created_at > '2024-01-01'
GROUP BY o.id, o.customer_id
ORDER BY total DESC;`}
                    </pre>
                  </div>

                  <div className="code-block">
                    <div className="code-header">Optimized Output + Indexes</div>
                    <pre style={{ color: '#00ffa3', margin: 0 }}>
{`-- Optimized Query
SELECT o.id, o.customer_id, SUM(oi.price * oi.qty) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'completed'
AND o.created_at > '2024-01-01'
GROUP BY o.id, o.customer_id
ORDER BY total DESC;

-- Suggested Indexes:
CREATE INDEX idx_orders_status_date
ON orders (status, created_at);

CREATE INDEX idx_orderitems_orderid
ON order_items (order_id, price, qty);`}
                    </pre>
                    <div style={{ marginTop: '20px', color: '#cccccc' }}>
                      <p style={{ marginBottom: '8px', color: '#00ffa3', fontWeight: 600 }}>Explanation:</p>
                      <p style={{ marginBottom: '4px' }}>1) Composite index supports WHERE + GROUP BY</p>
                      <p style={{ marginBottom: '4px' }}>2) JOIN optimized using multi-column index</p>
                      <p>3) Reduces I/O cost for large datasets</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '80px 40px',
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            How It Works
          </h2>

          <div className="feature-grid">
            <div className="card">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                Paste your SQL
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' }}>
                Start by pasting any slow SQL query you want to improve.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧩</div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                Add optional schema
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' }}>
                Describe your tables, indexes or row counts for better optimization.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                Get instant optimization
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' }}>
                DBPowerAI rewrites your query, suggests indexes and explains the logic.
              </p>
            </div>
          </div>
        </section>

        {/* Advanced Case Section */}
        <section style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '80px 40px',
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            Handles Complex Queries Too
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px'
          }}>
            DBPowerAI can analyze joins, aggregations, subqueries and multi-column filters using heuristics and AI-assisted reasoning.
          </p>

          <div className="split-code">
            <div className="code-block">
              <div className="code-header">Complex Input</div>
              <pre style={{ color: '#cccccc', margin: 0, fontSize: '13px' }}>
{`SELECT o.id, o.customer_id,
  SUM(oi.price * oi.qty) AS total
FROM orders o
JOIN order_items oi
  ON oi.order_id = o.id
WHERE o.status = 'completed'
AND o.created_at > '2024-01-01'
GROUP BY o.id, o.customer_id
ORDER BY total DESC;`}
              </pre>
            </div>

            <div className="code-block">
              <div className="code-header">Optimized + Indexes</div>
              <pre style={{ color: '#00ffa3', margin: 0, fontSize: '13px' }}>
{`-- Suggested Indexes:

CREATE INDEX idx_orders_status_date
ON orders (status, created_at);

CREATE INDEX idx_orderitems_orderid
ON order_items
  (order_id, price, qty);

-- Optimized for:
-- ✓ Fast WHERE filtering
-- ✓ Efficient JOIN
-- ✓ Reduced I/O cost`}
              </pre>
            </div>
          </div>
        </section>

        {/* Early Access Form */}
        <section id="early-access" style={{
          maxWidth: '650px',
          margin: '0 auto',
          padding: '80px 40px 100px',
        }}>
          {!formSubmitted ? (
            <div className="form-fade-in">
              <h2 style={{
                fontSize: '38px',
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                Join the Early Access
              </h2>

              <p style={{
                fontSize: '15px',
                color: '#9ca3af',
                textAlign: 'center',
                marginBottom: '48px',
                lineHeight: '1.6'
              }}>
                This early access is for developers who work with SQL in production. If you've handled slow queries, you'll get priority access.
              </p>

              <form
                action="https://formsubmit.co/info@humanaise.com"
                method="POST"
                onSubmit={handleSubmit}
                style={{
                  background: '#111418',
                  border: '1px solid #1f2327',
                  borderRadius: '12px',
                  padding: '40px',
                }}
              >
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="box" />
                <input type="hidden" name="_subject" value="New DBPowerAI Early Access Signup" />

                {/* Email Field */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: 'block',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#e5e5e5',
                      marginBottom: '8px',
                    }}
                  >
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="you@company.com"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      border: errors.email ? '1px solid #ef4444' : '1px solid #1f2327'
                    }}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                {/* Database Dropdown */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    htmlFor="database"
                    style={{
                      display: 'block',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#e5e5e5',
                      marginBottom: '8px',
                    }}
                  >
                    What database do you use? *
                  </label>
                  <select
                    id="database"
                    name="database"
                    value={formData.database}
                    onChange={(e) => handleInputChange('database', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      fontFamily: 'inherit',
                      border: errors.database ? '1px solid #ef4444' : '1px solid #1f2327',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select a database</option>
                    <option value="MySQL">MySQL</option>
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="Oracle">Oracle</option>
                    <option value="SQL Server">SQL Server</option>
                    <option value="MariaDB">MariaDB</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.database && (
                    <div className="error-message">{errors.database}</div>
                  )}
                </div>

                {/* Pain Point Radio Buttons */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#e5e5e5',
                      marginBottom: '12px',
                    }}
                  >
                    Have you struggled with slow SQL queries in the last 6 months? *
                  </label>
                  <div className="radio-group">
                    {['Yes', 'Sometimes', 'Rarely', 'No'].map((option) => (
                      <div key={option} className="radio-option">
                        <input
                          type="radio"
                          id={`pain-${option.toLowerCase()}`}
                          name="pain_point"
                          value={option}
                          checked={formData.painPoint === option}
                          onChange={(e) => handleInputChange('painPoint', e.target.value)}
                        />
                        <label htmlFor={`pain-${option.toLowerCase()}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.painPoint && (
                    <div className="error-message">{errors.painPoint}</div>
                  )}
                </div>

                {/* Disclaimer for "No" selection */}
                {formData.painPoint === 'No' && (
                  <div className="disclaimer">
                    This tool is designed for real production pain points. Priority is given to users with SQL performance issues.
                  </div>
                )}

                {/* Optional Query Textarea */}
                <div style={{ marginBottom: '32px' }}>
                  <label
                    htmlFor="query"
                    style={{
                      display: 'block',
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#e5e5e5',
                      marginBottom: '8px',
                    }}
                  >
                    Optional: share a slow query you'd like us to test
                  </label>
                  <textarea
                    id="query"
                    name="query"
                    value={formData.query}
                    onChange={(e) => handleInputChange('query', e.target.value)}
                    rows={5}
                    placeholder="Paste a real SQL query here (it will be processed anonymously)"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '15px',
                      borderRadius: '8px',
                      fontFamily: "'Fira Code', 'Courier New', monospace",
                      resize: 'vertical',
                      minHeight: '120px'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="glow-button"
                  style={{
                    width: '100%',
                    backgroundColor: '#00ffa3',
                    color: '#0d0f11',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Join Early Access
                </button>
              </form>
            </div>
          ) : (
            <div className="form-fade-in" style={{ textAlign: 'center' }}>
              <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>

              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '16px'
              }}>
                You're on the list!
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#9ca3af',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                If you provided real SQL pain points, you'll get priority access. Expect an update soon.
              </p>

              <a
                href="https://www.linkedin.com/company/humanaise"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  color: '#00ffa3',
                  fontSize: '15px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                → Follow the build in public journey on LinkedIn
              </a>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '40px',
          fontSize: '14px',
          color: '#6b7280',
          borderTop: '1px solid #1f2327'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <a
              href="/demo"
              style={{
                color: '#00ffa3',
                textDecoration: 'none',
                fontWeight: '600',
                marginRight: '24px',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Try the Demo
            </a>
            <a
              href="#early-access"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#00ffa3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              Early Access
            </a>
          </div>
          <div>
            © 2025 DBPowerAI — Powered by Humanaise
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
