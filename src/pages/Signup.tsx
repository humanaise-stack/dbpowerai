import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ensureProfileExists } from '../lib/profileService';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/app');
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await ensureProfileExists(session.user.id);
        navigate('/app');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await ensureProfileExists(user.id);
        }
        navigate('/app');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });

      if (error) {
        setError('Failed to sign up with Google');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: #0d0f11;
          color: #e5e5e5;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .page-fade-in {
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input {
          background: #111418;
          border: 1px solid #1f2327;
          color: #e5e5e5;
          transition: all 0.2s ease;
        }

        input::placeholder {
          color: #6b7280;
        }

        input:focus {
          outline: none;
          border-color: #00ffa3;
          box-shadow: 0 0 0 3px rgba(0, 255, 163, 0.15);
        }

        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-top: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .submit-button {
          background: #00ffa3;
          color: #0d0f11;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          box-shadow: 0 0 25px rgba(0, 255, 163, 0.4);
        }

        .submit-button:hover:not(:disabled) {
          box-shadow: 0 0 35px rgba(0, 255, 163, 0.6);
          transform: translateY(-2px);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .link {
          color: #00ffa3;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }

        .link:hover {
          opacity: 0.7;
        }

        .google-button {
          background: #ffffff;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          padding: 14px 16px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .google-button:hover {
          background: #f9fafb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #1f2327;
        }

        .divider span {
          padding: 0 16px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#0d0f11', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="page-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '8px',
              textShadow: '0 0 30px rgba(0, 255, 163, 0.3)'
            }}>
              DBPowerAI
            </h1>
            <p style={{ fontSize: '16px', color: '#9ca3af' }}>
              Create your account
            </p>
          </div>

          <div style={{
            background: '#111418',
            border: '1px solid #1f2327',
            borderRadius: '12px',
            padding: '40px',
          }}>
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="google-button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleSignup}>
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
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#e5e5e5',
                    marginBottom: '8px',
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                  }}
                />
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                  Minimum 6 characters
                </p>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
                style={{ marginTop: '24px' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
              Already have an account?{' '}
              <a href="/login" className="link">
                Log in
              </a>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a href="/" className="link" style={{ fontSize: '14px' }}>
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
