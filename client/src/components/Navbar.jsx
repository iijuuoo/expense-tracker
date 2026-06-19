import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, LogOut, Wallet } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 32px',
      background: 'rgba(17, 24, 39, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--panel-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      justifyContent: 'space-between'
    }}>
      <Link to="/" className="navbar-brand" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '20px',
        fontWeight: 800,
        color: 'white',
        letterSpacing: '-0.03em'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          padding: '6px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)'
        }}>
          <Wallet size={20} color="white" />
        </div>
        <span>Wallet<span className="gradient-text">Flow</span></span>
      </Link>

      {user ? (
        <>
          <div className="navbar-links" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <NavLink 
              to="/" 
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              })}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/transactions"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)'
              })}
            >
              <Receipt size={16} />
              <span>Transactions</span>
            </NavLink>
          </div>

          <div className="navbar-user" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span className="navbar-username" style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>
              Hello, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.name}</span>
            </span>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
