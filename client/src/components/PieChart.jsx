import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Color map tailored to match the mockup
const CATEGORY_COLORS = {
  Food: '#f43f5e',         // Red/Pink (25% Food)
  Travel: '#14b8a6',       // Teal
  Shopping: '#6366f1',     // Indigo
  Bills: '#fb923c',        // Orange (10% Beauty/Bills equivalent)
  Entertainment: '#a855f7', // Purple (17% Investing equivalent)
  Health: '#10b981',       // Green
  Others: '#6b7280'        // Muted Grey
};

const getCategoryColor = (category, index) => {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  const colors = ['#a855f7', '#818cf8', '#34d399', '#f87171', '#fb7185'];
  return colors[index % colors.length];
};

const PieChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // If no expense data is registered yet, use mock data matching the screenshot
  const chartData = data.filter(item => item.amount > 0).length > 0
    ? data.filter(item => item.amount > 0)
    : [
        { category: 'Travel', amount: 673.21, label: 'House/Travel' },
        { category: 'Food', amount: 525.94, label: 'Food' },
        { category: 'Entertainment', amount: 357.64, label: 'Investing' },
        { category: 'Shopping', amount: 336.60, label: 'Online Shop' },
        { category: 'Bills', amount: 210.38, label: 'Beauty' }
      ];

  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  // Circle properties for SVG donut
  const radius = 55;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~345.57
  
  let accumulatedLength = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Widget Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Activity
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          <select
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              padding: '4px 20px 4px 10px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none'
            }}
            onChange={() => alert('Only current month is active in this demo.')}
          >
            <option>This month</option>
            <option>This year</option>
          </select>
          <ChevronDown size={12} style={{ color: 'var(--text-muted)', position: 'absolute', right: '6px', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Donut and Legend row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginTop: '8px'
      }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
          <svg 
            width="150" 
            height="150" 
            viewBox="0 0 140 140"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          >
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />
            
            {chartData.map((item, index) => {
              const percentage = (item.amount / total) * 100;
              const strokeLength = (percentage / 100) * circumference;
              // Shift the starting point of the stroke clockwise by accumulatedLength using a negative offset
              const strokeOffset = -accumulatedLength;
              
              accumulatedLength += strokeLength;

              const isHovered = hoveredIndex === index;
              const color = getCategoryColor(item.category, index);

              return (
                <circle
                  key={item.category}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    transition: 'stroke-width 0.2s ease, stroke 0.2s ease',
                    cursor: 'pointer'
                  }}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            width: '90px'
          }}>
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
              ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '2px 0 0 0', fontWeight: 600 }}>
              Spent
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1
        }}>
          {chartData.map((item, index) => {
            const percentage = Math.round((item.amount / total) * 100);
            const color = getCategoryColor(item.category, index);
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.category}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? '#f9fafb' : 'transparent',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'inline-block'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isHovered ? 700 : 600,
                    color: isHovered ? '#111827' : 'var(--text-secondary)'
                  }}>
                    {item.label || item.category}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
