import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../context/AuthContext';
import TransactionList from '../components/TransactionList';
import { ArrowLeft, Edit3, X, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Food', 'Travel', 'Salary', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Others'];

const Transactions = () => {
  const { authFetch } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authFetch(`${API_BASE_URL}/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setError('Failed to load transaction logs.');
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
      setError('Connection to backend server failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete transaction.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  const handleEditOpen = (transaction) => {
    const formattedDate = new Date(transaction.date).toISOString().split('T')[0];
    
    setEditId(transaction._id);
    setTitle(transaction.title);
    setAmount(transaction.amount);
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(formattedDate);
    setDescription(transaction.description || '');
    
    setModalError('');
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    if (!title || !amount || !type || !category || !date) {
      setModalError('All fields except description are required.');
      setModalLoading(false);
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/transactions/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, amount, type, category, date, description })
      });

      if (response.ok) {
        setShowModal(false);
        await fetchTransactions();
      } else {
        const data = await response.json();
        setModalError(data.message || 'Failed to update transaction.');
      }
    } catch (err) {
      setModalError('Server connection error.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Receipt style={{ color: '#4f46e5' }} size={24} />
            <span>Transaction Ledger</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Search, filter, and modify your income and expense transactions.
          </p>
        </div>
        <Link to="/" className="btn btn-secondary" style={{ gap: '6px', borderRadius: '20px', padding: '8px 16px', fontSize: '12px' }}>
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: 0 }}>
          <span>{error}</span>
        </div>
      )}

      {/* Full Transaction list */}
      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Retrieving ledger...
          </div>
        ) : (
          <TransactionList 
            transactions={transactions} 
            onEdit={handleEditOpen} 
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Edit Modal Popup */}
      {showModal && (
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
            maxWidth: '450px',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid var(--panel-border)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <button 
              onClick={() => setShowModal(false)}
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
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={16} style={{ color: '#4f46e5' }} />
              <span>Modify Transaction</span>
            </h3>

            {modalError && (
              <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label">Title / Payee</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Amount ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="any"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-control"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
