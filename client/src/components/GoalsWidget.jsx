import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Plane, Car, Target, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_GOALS = [
  { id: '1', name: 'Travel', target: 2000, current: 1000, category: 'travel' },
  { id: '2', name: 'Car', target: 42500, current: 8500, category: 'car' }
];

const GoalsWidget = () => {
  const { user } = useAuth();
  const storageKey = user ? `fincheck_goals_${user._id}` : 'fincheck_goals';

  const [goals, setGoals] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [category, setCategory] = useState('other');

  // Load goals from local storage
  useEffect(() => {
    const storedGoals = localStorage.getItem(storageKey);
    if (storedGoals) {
      try {
        setGoals(JSON.parse(storedGoals));
      } catch (e) {
        setGoals(DEFAULT_GOALS);
      }
    } else {
      setGoals(DEFAULT_GOALS);
      localStorage.setItem(storageKey, JSON.stringify(DEFAULT_GOALS));
    }
  }, [storageKey]);

  const saveGoals = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem(storageKey, JSON.stringify(newGoals));
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!name || !target) return;

    const newGoal = {
      id: Date.now().toString(),
      name,
      target: parseFloat(target),
      current: parseFloat(current || 0),
      category
    };

    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);

    // Reset Form
    setName('');
    setTarget('');
    setCurrent('');
    setCategory('other');
    setShowAddForm(false);
  };

  const handleDeleteGoal = (id) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    saveGoals(updatedGoals);
  };

  const getGoalIcon = (cat) => {
    switch (cat) {
      case 'travel':
        return <Plane size={16} />;
      case 'car':
        return <Car size={16} />;
      default:
        return <Target size={16} />;
    }
  };

  // Build segmented visual bar
  const renderSegments = (current, target) => {
    const totalSegments = 10;
    const progressPercent = Math.min((current / target) * 100, 100);
    const activeSegmentsCount = Math.round((progressPercent / 100) * totalSegments);
    
    return (
      <div className="goals-progress-segments">
        {Array.from({ length: totalSegments }).map((_, idx) => (
          <div
            key={idx}
            className={`goals-progress-segment${idx < activeSegmentsCount ? ' active' : ''}`}
            style={{
              backgroundColor: idx < activeSegmentsCount ? '#6366f1' : '#e5e7eb'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
          My Goals
        </h3>
        <button 
          onClick={() => setShowAddForm(true)} 
          className="btn btn-primary"
          style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '20px', gap: '4px' }}
        >
          <Plus size={12} />
          <span>Add Goals</span>
        </button>
      </div>

      {/* Goals list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {goals.map(goal => {
          const progressPercent = Math.round((goal.current / goal.target) * 100);
          return (
            <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563'
                  }}>
                    {getGoalIcon(goal.category)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#111827' }}>{goal.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      ₹{goal.current.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / ₹{goal.target.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>
                    {progressPercent}%
                  </span>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                    title="Delete Goal"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {renderSegments(goal.current, goal.target)}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            No goals set yet. Start saving for something special!
          </div>
        )}
      </div>

      {/* Inline popup modal for adding a goal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 7, 12, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '360px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid var(--panel-border)',
            padding: '24px'
          }}>
            <button 
              onClick={() => setShowAddForm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
              Create Savings Goal
            </h3>

            <form onSubmit={handleAddGoal}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Travel, MacBook Pro"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Category Icon</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="other">Target Star</option>
                  <option value="travel">Airplane</option>
                  <option value="car">Car</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="2000"
                    className="form-control"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Current Saved (₹)</label>
                  <input
                    type="number"
                    placeholder="500"
                    className="form-control"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsWidget;
