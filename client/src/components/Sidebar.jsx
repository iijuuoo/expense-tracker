import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Invest', path: '/invest-mock', icon: TrendingUp },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Cards', path: '/cards-mock', icon: CreditCard },
    { label: 'Statistics', path: '/statistics-mock', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      {/* Brand logo & title */}
      <NavLink to="/" className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg viewBox="0 0 120 100" width="34" height="28" style={{ flexShrink: 0 }}>
          {/* Banknotes stack */}
          <g stroke="#7cb342" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Sheet 1 (Back) */}
            <path d="M20,44 L20,68 C20,72 28,74 38,74" />
            {/* Sheet 2 (Middle) */}
            <path d="M30,34 L30,58 C30,66 42,68 52,68" />
            {/* Sheet 3 (Front) */}
            <path d="M42,20 L68,20 C76,20 84,30 84,46 C84,58 72,62 62,62" />
          </g>
          {/* Dollar Sign */}
          <text x="50" y="38" fill="#7cb342" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif">$</text>
          
          {/* Blue Figure */}
          <circle cx="96" cy="30" r="9" fill="#0288d1" />
          <path d="M68,26 C82,26 92,34 95,44 C98,54 96,66 88,78 C98,66 102,52 98,42 C94,32 82,26 68,26 Z" fill="#0288d1" />
        </svg>
        <span>FINCHECK</span>
      </NavLink>

      {/* Menu links */}
      <div className="sidebar-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isMock = item.path.includes('-mock');
          
          return (
            <NavLink
              key={item.label}
              to={isMock ? '#' : item.path}
              onClick={(e) => {
                if (isMock) {
                  e.preventDefault();
                  alert(`${item.label} page is currently a demonstration and links back here.`);
                }
              }}
              className={({ isActive }) => 
                `sidebar-link${isActive && !isMock ? ' active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer menu */}
      <div className="sidebar-footer">
        <NavLink
          to="#"
          onClick={(e) => {
            e.preventDefault();
            alert('Settings option is a placeholder in this view.');
          }}
          className="sidebar-link"
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            cursor: 'pointer' 
          }}
        >
          <LogOut size={18} />
          <span>Log-out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
