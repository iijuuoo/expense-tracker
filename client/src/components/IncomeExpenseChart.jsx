import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const IncomeExpenseChart = ({ data = [] }) => {
  const [viewType, setViewType] = useState('income'); // 'income' or 'expense'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // If data is empty, use default mock entries for presentation
  const chartData = data.length > 0 ? data : [
    { month: 'Mar', income: 2800, expense: 2100 },
    { month: 'Apr', income: 3400, expense: 2300 },
    { month: 'May', income: 3200, expense: 2900 },
    { month: 'Jun', income: 4653, expense: 2103 },
    { month: 'Jul', income: 4100, expense: 2800 },
    { month: 'Aug', income: 4900, expense: 3300 }
  ];

  // Set the hovered index to the last element by default if not hovered
  const activeIndex = hoveredIndex !== null ? hoveredIndex : chartData.length - 1;

  // Extract values based on viewType
  const values = chartData.map(d => viewType === 'income' ? d.income : d.expense);
  const maxVal = Math.max(...values, 1000) * 1.1; // Add 10% headroom

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 260;

  // Offsets
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + plotHeight;

  // Compute points
  const points = chartData.map((d, index) => {
    const val = viewType === 'income' ? d.income : d.expense;
    const x = paddingLeft + (index / (chartData.length - 1)) * plotWidth;
    const y = baselineY - (val / maxVal) * plotHeight;
    return { x, y, value: val, month: d.month };
  });

  // Helper for smooth Bezier curves
  const getBezierPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curveLinePath = getBezierPath(points);
  const curveAreaPath = points.length > 0 
    ? `${curveLinePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z` 
    : '';

  // Y Axis tick lines (4 steps)
  const ticksCount = 4;
  const yTicks = Array.from({ length: ticksCount + 1 }, (_, i) => {
    const val = (maxVal / ticksCount) * i;
    const y = baselineY - (val / maxVal) * plotHeight;
    return { value: val, y };
  });

  const activeColor = viewType === 'income' ? '#6366f1' : '#f43f5e';
  const activeGradientId = `chart-gradient-${viewType}`;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Toggle Dropdown Header */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#111827',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              paddingRight: '20px'
            }}
          >
            <option value="income">Total income</option>
            <option value="expense">Total expenses</option>
          </select>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)', position: 'absolute', right: 0, pointerEvents: 'none' }} />
        </div>

        {/* Time-range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              border: '1px solid var(--panel-border)',
              borderRadius: '8px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none'
            }}
            onChange={() => alert('Only past 6 months data range is available in this demo.')}
          >
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      {/* SVG Plot */}
      <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Area Gradient Fill */}
            <linearGradient id={activeGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={svgWidth - paddingRight}
                y2={tick.y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 4}
                fill="var(--text-muted)"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
              >
                {tick.value >= 1000 
                  ? `${(tick.value / 1000).toFixed(0)}k` 
                  : tick.value.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Area under curve */}
          {curveAreaPath && (
            <path
              d={curveAreaPath}
              fill={`url(#${activeGradientId})`}
              style={{ transition: 'd 0.3s ease' }}
            />
          )}

          {/* Curved Line */}
          {curveLinePath && (
            <path
              d={curveLinePath}
              fill="none"
              stroke={activeColor}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: 'd 0.3s ease, stroke 0.3s ease' }}
            />
          )}

          {/* Vertical indicator line for active month */}
          {points[activeIndex] && (
            <line
              x1={points[activeIndex].x}
              y1={paddingTop - 10}
              x2={points[activeIndex].x}
              y2={baselineY}
              stroke="var(--text-muted)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* Render interactive markers & month labels */}
          {points.map((pt, index) => {
            const isActive = index === activeIndex;
            return (
              <g key={index}>
                {/* Clickable Hover Zones */}
                <rect
                  x={pt.x - (plotWidth / chartData.length) / 2}
                  y={paddingTop}
                  width={plotWidth / (chartData.length - 1)}
                  height={plotHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* X Axis Month Labels */}
                <text
                  x={pt.x}
                  y={baselineY + 20}
                  fill={isActive ? '#111827' : 'var(--text-muted)'}
                  fontSize="11"
                  fontWeight={isActive ? '700' : '600'}
                  textAnchor="middle"
                >
                  {pt.month}
                </text>

                {/* Active marker point dot */}
                {isActive && (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#ffffff"
                      stroke={activeColor}
                      strokeWidth="3"
                      style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill={activeColor}
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Text marker/tooltip above the active point */}
        {points[activeIndex] && (
          <div
            style={{
              position: 'absolute',
              top: `${((points[activeIndex].y - 25) / svgHeight) * 100}%`,
              left: `${(points[activeIndex].x / svgWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            ${points[activeIndex].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
