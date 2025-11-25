import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProfile, UserProfile } from '../lib/profileService';
import { Menu, X, User } from 'lucide-react';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProfile();
  }, []);

  const getInitials = (name: string | null, email: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const hamburger = document.getElementById('hamburger-button');
        if (hamburger && !hamburger.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .nav-link {
          color: #9ca3af;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #00ffa3;
        }

        .nav-link-active {
          color: #00ffa3;
        }

        .mobile-menu-button {
          display: none;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .mobile-menu-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          max-width: 85vw;
          background: #0d0f11;
          border-left: 1px solid rgba(0, 255, 163, 0.2);
          box-shadow: -4px 0 30px rgba(0, 255, 163, 0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #1f2327;
        }

        .mobile-menu-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
        }

        .mobile-menu-link {
          display: block;
          color: #e5e5e5;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .mobile-menu-link:hover {
          background: rgba(0, 255, 163, 0.1);
          border-color: rgba(0, 255, 163, 0.3);
          color: #00ffa3;
        }

        .mobile-menu-logout {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.2s ease;
          margin-top: 16px;
        }

        .mobile-menu-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }

        .hamburger-icon {
          transition: all 0.2s ease;
        }

        .hamburger-icon:hover {
          color: #00ffa3;
          transform: scale(1.1);
        }

        .close-icon {
          transition: all 0.2s ease;
        }

        .close-icon:hover {
          color: #ef4444;
          transform: rotate(90deg);
        }

        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }

          .mobile-menu-button {
            display: block;
          }
        }
      `}</style>

      <nav style={{
        background: '#111418',
        borderBottom: '1px solid #1f2327',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(17, 20, 24, 0.95)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/app" style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
            textDecoration: 'none',
            textShadow: '0 0 20px rgba(0, 255, 163, 0.3)'
          }}>
            DBPowerAI
          </a>

          <div className="desktop-menu" style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center'
          }}>
            <a href="/app" className="nav-link">
              App
            </a>
            <a href="/dashboard" className="nav-link">
              Dashboard
            </a>
            <a href="/profile" className="nav-link" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {profile && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00ffa3 0%, #00cc82 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#0d0f11'
                }}>
                  {getInitials(profile.full_name, profile.email)}
                </div>
              )}
              {!profile && <User size={20} />}
              Profile
            </a>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #1f2327',
                color: '#9ca3af',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00ffa3';
                e.currentTarget.style.color = '#00ffa3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1f2327';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Logout
            </button>
          </div>

          <button
            id="hamburger-button"
            className="mobile-menu-button hamburger-icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e5e5e5',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={closeMobileMenu} />
          <div className="mobile-menu-panel" ref={menuRef}>
            <div className="mobile-menu-header">
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#ffffff',
                textShadow: '0 0 20px rgba(0, 255, 163, 0.3)'
              }}>
                Menu
              </span>
              <button
                onClick={closeMobileMenu}
                aria-label="Close menu"
                className="close-icon"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#e5e5e5',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="mobile-menu-content">
              <a href="/dashboard" className="mobile-menu-link" onClick={closeMobileMenu}>
                Dashboard
              </a>
              <a href="/app" className="mobile-menu-link" onClick={closeMobileMenu}>
                App
              </a>
              <a href="/profile" className="mobile-menu-link" onClick={closeMobileMenu}>
                Profile
              </a>

              <button
                className="mobile-menu-logout"
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
