import React, { useState } from 'react';
import { Search, Edit2, Trash2, Filter } from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Salary', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Others'];

const TransactionList = ({ transactions = [], onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort logic
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'amount-desc') {
      return b.amount - a.amount;
    } else if (sortBy === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
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
            placeholder="Search transactions..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '38px',
              borderRadius: '20px',
              height: '38px',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Type:</span>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ 
                padding: '6px 12px', 
                fontSize: '13px', 
                width: 'auto', 
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Category:</span>
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ 
                padding: '6px 12px', 
                fontSize: '13px', 
                width: 'auto', 
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Sort:</span>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ 
                padding: '6px 12px', 
                fontSize: '13px', 
                width: 'auto', 
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="table-container">
        {sortedTransactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Filter size={32} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontWeight: 700 }}>No transactions match your search/filter parameters.</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Try resetting filters or adding new transactions.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title / Receiver</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((t) => (
                <tr key={t._id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {formatDate(t.date)}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{t.title}</div>
                    {t.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-category">{t.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ 
                    fontWeight: 700, 
                    color: t.type === 'income' ? 'var(--success)' : '#111827'
                  }}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => onEdit(t)} 
                        className="btn-icon" 
                        title="Edit Transaction"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${t.title}"?`)) {
                            onDelete(t._id);
                          }
                        }} 
                        className="btn-icon" 
                        title="Delete Transaction"
                      >
                        <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
