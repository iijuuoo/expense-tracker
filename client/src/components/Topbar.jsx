import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, Bell, ChevronDown } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuth();
  
  // Format today's date (e.g. Jun 18, 2026)
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
      {/* User Greeting */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Hi {user?.name || 'User'},
        </h2>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Welcome back!
        </span>
      </div>

      {/* Utilities Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, justifyContent: 'flex-end' }}>
        {/* Date Display Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--panel-border)',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}>
          <Calendar size={14} style={{ color: '#4f46e5' }} />
          <span>{todayFormatted}</span>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '240px', maxWidth: '100%' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            placeholder="Type to search..."
            className="form-control"
            style={{
              paddingLeft: '38px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '13px',
              borderRadius: '20px',
              height: '38px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}
          />
        </div>

        {/* Notifications Icon */}
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '1px solid var(--panel-border)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          color: 'var(--text-secondary)'
        }}
        onClick={() => alert('No new notifications')}
        >
          <Bell size={16} />
          {/* Red indicator dot */}
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '6px',
            height: '6px',
            backgroundColor: 'var(--danger)',
            borderRadius: '50%'
          }} />
        </button>

        {/* User Profile dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 8px',
          borderRadius: '20px',
          cursor: 'pointer',
          border: '1px solid transparent',
          transition: 'all 0.2s'
        }}
        onClick={() => alert(`Logged in as: ${user?.email}`)}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true&rounded=true`}
            alt="User profile"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {user?.name || 'User'}
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
