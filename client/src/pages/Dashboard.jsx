import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../context/AuthContext';
import PieChart from '../components/PieChart';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import GoalsWidget from '../components/GoalsWidget';
import TransactionList from '../components/TransactionList';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PiggyBank, 
  Plus, 
  Edit3, 
  X, 
  Eye, 
  ArrowUpDown,
  TrendingUp,
  Receipt,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Food', 'Travel', 'Salary', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Others'];

const Dashboard = () => {
  const { authFetch } = useAuth();
  
  // Dashboard Metrics State
  const [overview, setOverview] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Transaction Sorting & Tab Filter
  const [activeSortTab, setActiveSortTab] = useState('recently'); // 'recently' or 'oldest'

  // Modal Form State (Add/Edit Transaction)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch all metrics & logs
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [overviewRes, monthlyRes, categoryRes, transactionsRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/summary/overview`),
        authFetch(`${API_BASE_URL}/summary/monthly`),
        authFetch(`${API_BASE_URL}/summary/category`),
        authFetch(`${API_BASE_URL}/transactions`)
      ]);

      if (overviewRes.ok && monthlyRes.ok && categoryRes.ok && transactionsRes.ok) {
        const overviewData = await overviewRes.json();
        const monthlyArray = await monthlyRes.json();
        const categoryArray = await categoryRes.json();
        const transactionsArray = await transactionsRes.json();

        setOverview(overviewData);
        setMonthlyData(monthlyArray);
        setCategoryData(categoryArray);
        setTransactions(transactionsArray);
      } else {
        setError('Failed to fetch dashboard metrics. Please reload.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Form submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    if (!title || !amount || !type || !category || !date) {
      setFormError('All fields except description are required.');
      setFormLoading(false);
      return;
    }

    try {
      const url = editId 
        ? `${API_BASE_URL}/transactions/${editId}` 
        : `${API_BASE_URL}/transactions`;
      
      const method = editId ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        body: JSON.stringify({ title, amount, type, category, date, description })
      });

      if (response.ok) {
        resetForm();
        setShowFormModal(false);
        await fetchDashboardData();
      } else {
        const data = await response.json();
        setFormError(data.message || 'Failed to submit transaction.');
      }
    } catch (err) {
      setFormError('Server connection error.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (editId === id) resetForm();
        await fetchDashboardData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete transaction.');
      }
    } catch (err) {
      alert('Server connection error.');
    }
  };

  const handleEditClick = (transaction) => {
    const formattedDate = new Date(transaction.date).toISOString().split('T')[0];
    
    setEditId(transaction._id);
    setTitle(transaction.title);
    setAmount(transaction.amount);
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(formattedDate);
    setDescription(transaction.description || '');
    
    setFormError('');
    setShowFormModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setFormError('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Sort transactions in UI based on active tab
  const getSortedTransactions = () => {
    const list = [...transactions].slice(0, 5); // display up to 5 items on Dashboard
    if (activeSortTab === 'oldest') {
      return list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Mock calculated savings (45% of income, or standard formula if no transactions)
  const savingsVal = overview.totalIncome > 0 
    ? Math.max(overview.totalIncome * 0.45, 0)
    : 9500.63;

  if (loading && transactions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--text-secondary)'
      }}>
        Loading Fincheck metrics...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && (
        <div className="alert alert-danger" style={{ margin: 0 }}>
          <span>{error}</span>
        </div>
      )}

      {/* Row of 4 Premium Gradient Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px'
      }}>
        {/* Total Balance */}
        <div className="stat-card-gradient balance">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-card-label">Total Balance</span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">
              ${overview.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-card-badge">
              <span>+22% ↗</span>
              <span style={{ opacity: 0.8 }}>than last month</span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="stat-card-gradient income">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-card-label">Total Income</span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">
              ${overview.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-card-badge">
              <span>+36% ↗</span>
              <span style={{ opacity: 0.8 }}>than last month</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="stat-card-gradient expense">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-card-label">Total Expenses</span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">
              ${overview.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-card-badge">
              <span>-11% ↘</span>
              <span style={{ opacity: 0.8 }}>than last month</span>
            </div>
          </div>
        </div>

        {/* Total Savings */}
        <div className="stat-card-gradient savings">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-card-label">Total Savings</span>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}>
              <PiggyBank size={18} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">
              ${savingsVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-card-badge">
              <span>+15% ↗</span>
              <span style={{ opacity: 0.8 }}>than last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Components */}
      <div className="dashboard-grid">
        {/* Left Column (Chart + Table) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Income vs Expenses curved area chart */}
          <div className="glass-card">
            <IncomeExpenseChart data={monthlyData} />
          </div>

          {/* Transaction History ledger */}
          <div className="glass-card">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--panel-border)',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Transaction history
                </h3>
              </div>

              {/* Action Tabs & Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', padding: '3px', borderRadius: '20px' }}>
                  <button
                    onClick={() => setActiveSortTab('recently')}
                    style={{
                      border: 'none',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      backgroundColor: activeSortTab === 'recently' ? '#ffffff' : 'transparent',
                      color: activeSortTab === 'recently' ? '#111827' : 'var(--text-secondary)',
                      boxShadow: activeSortTab === 'recently' ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Recently
                  </button>
                  <button
                    onClick={() => setActiveSortTab('oldest')}
                    style={{
                      border: 'none',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      backgroundColor: activeSortTab === 'oldest' ? '#ffffff' : 'transparent',
                      color: activeSortTab === 'oldest' ? '#111827' : 'var(--text-secondary)',
                      boxShadow: activeSortTab === 'oldest' ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    Oldest
                  </button>
                  <Link
                    to="/transactions"
                    style={{
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: '16px',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    More
                  </Link>
                </div>

                {/* Add Transaction FAB */}
                <button
                  onClick={() => { resetForm(); setShowFormModal(true); }}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '20px', gap: '4px' }}
                >
                  <Plus size={12} />
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>

            {/* Rendered ledger list matching mockup layout */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Receiver</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedTransactions().map((t) => (
                    <tr key={t._id}>
                      {/* Receiver with placeholder image avatar */}
                      <td style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#4f46e5'
                        }}>
                          {t.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{t.title}</div>
                          {t.description && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                              {t.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {t.category}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
                        {formatDate(t.date)}
                      </td>
                      <td style={{ 
                        fontWeight: 700, 
                        color: t.type === 'income' ? 'var(--success)' : '#111827',
                        textAlign: 'right'
                      }}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditClick(t)}
                            className="btn-icon"
                            style={{ width: '26px', height: '26px', borderRadius: '4px' }}
                            title="Edit"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${t.title}"?`)) {
                                handleDeleteTransaction(t._id);
                              }
                            }}
                            className="btn-icon"
                            style={{ width: '26px', height: '26px', borderRadius: '4px' }}
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                        No transactions found. Add a transaction to see it listed here!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Activity + Goals) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Donut Chart breakdown */}
          <div className="glass-card">
            <PieChart data={categoryData} />
          </div>

          {/* savings goals with segments */}
          <div className="glass-card">
            <GoalsWidget />
          </div>
        </div>
      </div>

      {/* Floating popup modal for adding/editing transactions */}
      {showFormModal && (
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
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--panel-border)'
          }}>
            <button 
              onClick={() => setShowFormModal(false)}
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
              <Receipt size={16} style={{ color: '#4f46e5' }} />
              <span>{editId ? 'Modify Transaction' : 'Record Transaction'}</span>
            </h3>

            {formError && (
              <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Title / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks Coffee"
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
                    placeholder="e.g. 6.50"
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
                  placeholder="Additional details..."
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
                  onClick={() => setShowFormModal(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? 'Processing...' : (editId ? 'Save Changes' : 'Add Transaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
