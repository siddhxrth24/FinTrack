const { useState, useEffect, useRef, useCallback } = React;

// ── CONSTANTS ──
const CATEGORIES = {
  income: [
    { id: 'salary', label: 'Salary', icon: '💼' },
    { id: 'freelance', label: 'Freelance', icon: '💻' },
    { id: 'investment', label: 'Investment', icon: '📈' },
    { id: 'gift', label: 'Gift', icon: '🎁' },
    { id: 'other_in', label: 'Other', icon: '💰' },
  ],
  expense: [
    { id: 'food', label: 'Food & Dining', icon: '🍕' },
    { id: 'transport', label: 'Transport', icon: '🚗' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'bills', label: 'Bills', icon: '📄' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎮' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'rent', label: 'Rent', icon: '🏠' },
    { id: 'other_ex', label: 'Other', icon: '💸' },
  ],
};

const DEFAULT_BUDGETS = {
  food: 8000, transport: 3000, shopping: 5000, bills: 4000,
  health: 2000, entertainment: 3000, education: 2000, rent: 15000, other_ex: 2000,
};

const SAMPLE_DATA = [
  { id: '1', name: 'Monthly Salary', amount: 75000, type: 'income', category: 'salary', date: '2024-01-01' },
  { id: '2', name: 'Swiggy Order', amount: 650, type: 'expense', category: 'food', date: '2024-01-03' },
  { id: '3', name: 'Metro Card Recharge', amount: 500, type: 'expense', category: 'transport', date: '2024-01-04' },
  { id: '4', name: 'Amazon Order', amount: 2300, type: 'expense', category: 'shopping', date: '2024-01-05' },
  { id: '5', name: 'Freelance Project', amount: 12000, type: 'income', category: 'freelance', date: '2024-01-07' },
  { id: '6', name: 'Electricity Bill', amount: 1800, type: 'expense', category: 'bills', date: '2024-01-08' },
  { id: '7', name: 'Gym Membership', amount: 2000, type: 'expense', category: 'health', date: '2024-01-10' },
  { id: '8', name: 'Netflix + Hotstar', amount: 799, type: 'expense', category: 'entertainment', date: '2024-01-11' },
  { id: '9', name: 'Udemy Course', amount: 999, type: 'expense', category: 'education', date: '2024-01-12' },
  { id: '10', name: 'House Rent', amount: 18000, type: 'expense', category: 'rent', date: '2024-01-01' },
];

// ── HELPERS ──
const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const getCategoryInfo = (catId, type) => {
  const list = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
  return list.find(c => c.id === catId) || { label: catId, icon: '💡' };
};

const genId = () => Math.random().toString(36).slice(2, 9);

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── HOOKS ──
function useLocalStorage(key, init) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : (typeof init === 'function' ? init() : init);
    } catch { return typeof init === 'function' ? init() : init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

function useToast() {
  const [toast, setToast] = useState({ msg: '', type: 'success', show: false });
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);
  return [toast, show];
}

// ── CHART COMPONENTS ──
function LineChart({ transactions }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Group by month
    const monthlyData = {};
    transactions.forEach(tx => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyData[key]) monthlyData[key] = { label: monthNames[d.getMonth()], income: 0, expense: 0 };
      monthlyData[key][tx.type] += tx.amount;
    });

    const sorted = Object.values(monthlyData).slice(-6);

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: sorted.map(m => m.label),
        datasets: [
          {
            label: 'Income',
            data: sorted.map(m => m.income),
            borderColor: '#7af0c8',
            backgroundColor: 'rgba(122,240,200,0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#7af0c8',
          },
          {
            label: 'Expense',
            data: sorted.map(m => m.expense),
            borderColor: '#f07a9a',
            backgroundColor: 'rgba(240,122,154,0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#f07a9a',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { labels: { color: '#7a7a8a', font: { family: 'DM Sans', size: 11 } } } },
        scales: {
          x: { ticks: { color: '#7a7a8a', font: { family: 'DM Sans', size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#7a7a8a', font: { family: 'DM Sans', size: 11 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [transactions]);

  return <canvas ref={canvasRef} style={{ maxHeight: 200 }} />;
}

function DonutChart({ transactions }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory = {};
    expenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(byCategory).map(id => getCategoryInfo(id, 'expense').label);
    const data = Object.values(byCategory);
    const colors = ['#7af0c8','#f07a9a','#c8f07a','#7ac8f0','#f0c87a','#c87af0','#f07ac8','#7af0f0','#f0f07a'];

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors.slice(0, data.length), borderWidth: 0, hoverOffset: 8 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#7a7a8a', font: { family: 'DM Sans', size: 11 }, padding: 12, boxWidth: 10 } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [transactions]);

  return <canvas ref={canvasRef} style={{ maxHeight: 220 }} />;
}

function BarChart({ transactions }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory = {};
    expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
    const sorted = Object.entries(byCategory).sort((a,b) => b[1]-a[1]).slice(0,6);

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: sorted.map(([id]) => getCategoryInfo(id, 'expense').label),
        datasets: [{
          data: sorted.map(([,v]) => v),
          backgroundColor: 'rgba(200,240,122,0.7)',
          borderColor: '#c8f07a',
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#7a7a8a', font: { family: 'DM Sans', size: 10 } }, grid: { display: false } },
          y: { ticks: { color: '#7a7a8a', font: { family: 'DM Sans', size: 11 }, callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [transactions]);

  return <canvas ref={canvasRef} style={{ maxHeight: 220 }} />;
}

// ── TRANSACTION FORM ──
function TransactionForm({ onAdd, onClose }) {
  const [type, setType] = useState('expense');
  const [form, setForm] = useState({ name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.category) e.category = 'Select a category';
    if (!form.date) e.date = 'Select a date';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAdd({ id: genId(), ...form, amount: Number(form.amount), type });
    onClose();
  };

  const cats = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Add Transaction</h3>
        <div className="type-toggle">
          <button className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`} onClick={() => { setType('expense'); setForm(f => ({...f, category: ''})); }}>
            ↑ Expense
          </button>
          <button className={`type-btn ${type === 'income' ? 'active-income' : ''}`} onClick={() => { setType('income'); setForm(f => ({...f, category: ''})); }}>
            ↓ Income
          </button>
        </div>

        <div className="form-group">
          <label>Description</label>
          <input placeholder="e.g. Swiggy Order" value={form.name} className={errors.name ? 'error' : ''}
            onChange={e => { setForm(f => ({...f, name: e.target.value})); setErrors(er => ({...er, name: ''})); }} />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" placeholder="0" value={form.amount} className={errors.amount ? 'error' : ''}
              onChange={e => { setForm(f => ({...f, amount: e.target.value})); setErrors(er => ({...er, amount: ''})); }} />
            {errors.amount && <p className="form-error">{errors.amount}</p>}
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} className={errors.date ? 'error' : ''}
              onChange={e => { setForm(f => ({...f, date: e.target.value})); setErrors(er => ({...er, date: ''})); }} />
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={form.category} className={errors.category ? 'error' : ''}
            onChange={e => { setForm(f => ({...f, category: e.target.value})); setErrors(er => ({...er, category: ''})); }}>
            <option value="">Select a category</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          {errors.category && <p className="form-error">{errors.category}</p>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Transaction</button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({ transactions, onDelete }) {
  const [filter, setFilter] = useState('all');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const filtered = filter === 'all' ? transactions
    : transactions.filter(t => t.type === filter);

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Overview</h2>
          <p>{transactions.length} transactions recorded</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card balance">
          <p className="stat-label">Net Balance</p>
          <p className="stat-value">{formatCurrency(balance)}</p>
          <p className="stat-sub">{balance >= 0 ? '✓ In the green' : '⚠ Overspent'}</p>
        </div>
        <div className="stat-card income">
          <p className="stat-label">Total Income</p>
          <p className="stat-value">{formatCurrency(totalIncome)}</p>
          <p className="stat-sub">{transactions.filter(t => t.type === 'income').length} entries</p>
        </div>
        <div className="stat-card expense">
          <p className="stat-label">Total Expenses</p>
          <p className="stat-value">{formatCurrency(totalExpense)}</p>
          <p className="stat-sub">{transactions.filter(t => t.type === 'expense').length} entries</p>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Monthly Trend</h3>
          <LineChart transactions={transactions} />
        </div>
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <DonutChart transactions={transactions} />
        </div>
      </div>

      <div className="transactions-header">
        <h3>Transactions</h3>
        <div className="filter-bar">
          {['all','income','expense'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="transaction-list">
        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p>No transactions yet. Click + to add one!</p>
          </div>
        ) : sorted.map(tx => {
          const cat = getCategoryInfo(tx.category, tx.type);
          const bgColor = tx.type === 'income' ? 'rgba(122,240,200,0.12)' : 'rgba(240,122,154,0.12)';
          return (
            <div key={tx.id} className="transaction-item">
              <div className="tx-icon" style={{ background: bgColor }}>{cat.icon}</div>
              <div className="tx-info">
                <p className="tx-name">{tx.name}</p>
                <p className="tx-date">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className="tx-category">{cat.label}</span>
              <p className={`tx-amount ${tx.type}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}</p>
              <div className="tx-actions">
                <button className="tx-del-btn" onClick={() => onDelete(tx.id)} title="Delete">✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── BUDGET PAGE ──
function Budget({ transactions, budgets, onUpdateBudget }) {
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState('');

  const expenseByCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
  });

  const handleSave = (catId) => {
    const val = parseFloat(editVal);
    if (!isNaN(val) && val > 0) onUpdateBudget(catId, val);
    setEditId(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Budgets</h2>
          <p>Set monthly spending limits per category</p>
        </div>
      </div>
      <div className="budget-grid">
        {CATEGORIES.expense.map(cat => {
          const spent = expenseByCategory[cat.id] || 0;
          const budget = budgets[cat.id] || DEFAULT_BUDGETS[cat.id] || 5000;
          const pct = Math.min((spent / budget) * 100, 100);
          const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'safe';

          return (
            <div className="budget-card" key={cat.id}>
              <div className="budget-card-header">
                <span className="cat-label">{cat.icon} {cat.label}</span>
                <span className="amounts">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
              </div>
              {editId === cat.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                    style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'inherit' }} />
                  <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => handleSave(cat.id)}>Save</button>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setEditId(null)}>✕</button>
                </div>
              ) : (
                <p className="budget-sub" style={{ cursor: 'pointer', marginTop: '0.25rem' }} onClick={() => { setEditId(cat.id); setEditVal(budget); }}>
                  {pct >= 100 ? '🔴 Over budget!' : pct >= 80 ? `⚠️ ${Math.round(100 - pct)}% left` : `✓ ${Math.round(100 - pct)}% remaining`} · <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>Edit limit</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ANALYTICS PAGE ──
function Analytics({ transactions }) {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;
  const avgExpense = transactions.filter(t => t.type === 'expense').length > 0
    ? Math.round(totalExpense / transactions.filter(t => t.type === 'expense').length) : 0;

  return (
    <div>
      <div className="page-header">
        <div><h2>Analytics</h2><p>Insights into your spending patterns</p></div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card balance">
          <p className="stat-label">Savings Rate</p>
          <p className="stat-value" style={{ fontSize: '1.8rem' }}>{savingsRate}%</p>
          <p className="stat-sub">{savingsRate >= 20 ? '✓ Great saving habit' : 'Aim for 20%+'}</p>
        </div>
        <div className="stat-card income">
          <p className="stat-label">Avg. Transaction</p>
          <p className="stat-value" style={{ fontSize: '1.8rem' }}>{formatCurrency(avgExpense)}</p>
          <p className="stat-sub">per expense entry</p>
        </div>
        <div className="stat-card expense">
          <p className="stat-label">Expense Ratio</p>
          <p className="stat-value" style={{ fontSize: '1.8rem' }}>{totalIncome > 0 ? ((totalExpense/totalIncome)*100).toFixed(0) : 0}%</p>
          <p className="stat-sub">of income spent</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Top Expense Categories</h3>
          <BarChart transactions={transactions} />
        </div>
        <div className="chart-card">
          <h3>Income vs Expense Breakdown</h3>
          <DonutChart transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS PAGE ──
function Settings({ onReset, onLoadSample }) {
  return (
    <div>
      <div className="page-header">
        <div><h2>Settings</h2><p>Manage your data and preferences</p></div>
      </div>
      <div className="settings-section">
        <h3>Data Management</h3>
        <div className="settings-row">
          <div>
            <label>Load Sample Data</label>
            <p><span>Populate with demo transactions to explore features</span></p>
          </div>
          <button className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }} onClick={onLoadSample}>Load Samples</button>
        </div>
        <div className="settings-row" style={{ marginTop: '0.75rem' }}>
          <div>
            <label>Clear All Data</label>
            <p><span>Permanently delete all transactions and budgets</span></p>
          </div>
          <button className="btn btn-danger" onClick={onReset}>Clear All</button>
        </div>
      </div>
      <div className="settings-section">
        <h3>About</h3>
        <div className="settings-row"><label>Version</label><span>1.0.0</span></div>
        <div className="settings-row"><label>Currency</label><span>INR (₹)</span></div>
        <div className="settings-row"><label>Storage</label><span>Browser LocalStorage</span></div>
        <div className="settings-row"><label>Tech Stack</label><span>HTML · CSS · JS · React · Chart.js</span></div>
      </div>
    </div>
  );
}

// ── TOAST COMPONENT ──
function Toast({ msg, type, show }) {
  return (
    <div className={`toast ${type} ${show ? 'show' : ''}`}>{msg}</div>
  );
}

// ── ROOT APP ──
function App() {
  const [transactions, setTransactions] = useLocalStorage('fintrack_txns', SAMPLE_DATA);
  const [budgets, setBudgets] = useLocalStorage('fintrack_budgets', DEFAULT_BUDGETS);
  const [page, setPage] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [toast, showToast] = useToast();

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
    showToast('Transaction added!', 'success');
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Transaction deleted', 'error');
  };

  const updateBudget = (catId, val) => {
    setBudgets(prev => ({ ...prev, [catId]: val }));
    showToast('Budget updated!', 'success');
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: '◈' },
    { id: 'budget', label: 'Budgets', icon: '◉' },
    { id: 'analytics', label: 'Analytics', icon: '▦' },
    { id: 'settings', label: 'Settings', icon: '◎' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>FinTrack</h1>
          <p>Personal Finance Tracker</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {page === 'dashboard' && <Dashboard transactions={transactions} onDelete={deleteTransaction} />}
        {page === 'budget' && <Budget transactions={transactions} budgets={budgets} onUpdateBudget={updateBudget} />}
        {page === 'analytics' && <Analytics transactions={transactions} />}
        {page === 'settings' && (
          <Settings
            onReset={() => { setTransactions([]); setBudgets(DEFAULT_BUDGETS); showToast('All data cleared', 'error'); }}
            onLoadSample={() => { setTransactions(SAMPLE_DATA); showToast('Sample data loaded!', 'success'); }}
          />
        )}
      </main>

      <button className="fab" onClick={() => setShowForm(true)} title="Add Transaction">+</button>
      {showForm && <TransactionForm onAdd={addTransaction} onClose={() => setShowForm(false)} />}
      <Toast {...toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
