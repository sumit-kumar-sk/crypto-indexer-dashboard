import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AddressInput from './components/AddressInput';
import TransactionList from './components/TransactionList';
import TransactionDetail from './components/TransactionDetail';
import './styles/App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [chain, setChain] = useState('ETH');
  const [view, setView] = useState('dashboard');
  
  const [address, setAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [globalTxs, setGlobalTxs] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch dashboard data (Blocks & Global Feed)
  const fetchDashboardData = useCallback(async () => {
    try {
      const [blockRes, txRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/blocks/${chain}`),
        axios.get(`${API_BASE_URL}/all-transactions/${chain}`)
      ]);
      setBlocks(blockRes.data.blocks || []);
      setGlobalTxs(txRes.data.transactions || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  }, [chain]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Fetch transactions for a wallet address
  const fetchTransactions = async () => {
    const trimmedAddr = address.trim();
    if (!trimmedAddr) return;
    
    setSearchLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/${trimmedAddr}`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
        setView('search');
        
        // Auto-switch chain view based on search result
        if (response.data.chain && response.data.chain !== chain) {
          setChain(response.data.chain);
        }
        
        if (response.data.transactions.length === 0) {
          setError(`No indexed transactions found for this address on ${response.data.chain || chain}.`);
        }
      } else {
        setError(response.data.message || 'Search failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please verify address format.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') fetchTransactions();
  };

  const goToDashboard = () => {
    setView('dashboard');
    setAddress('');
    setTransactions([]);
    setError(null);
  };

  const handleSelectTransaction = (tx) => setSelectedTransaction(tx);
  const closeTransactionDetail = () => setSelectedTransaction(null);
  const truncate = (str, n = 6) => str ? `${str.slice(0, n)}...${str.slice(-4)}` : '';

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Crypto Indexer</h1>
        <p className="app-subtitle">Premium Real-time Blockchain Intelligence</p>
        
        <div className="chain-toggle-container">
          <button 
            className={`toggle-btn ${chain === 'ETH' ? 'active' : ''}`}
            onClick={() => { setChain('ETH'); if(view === 'search') goToDashboard(); }}
          >
            Ethereum
          </button>
          <button 
            className={`toggle-btn ${chain === 'BTC' ? 'active' : ''}`}
            onClick={() => { setChain('BTC'); if(view === 'search') goToDashboard(); }}
          >
            Bitcoin
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Stats Row */}
        <section className="stats-container">
          <div className="stat-card">
            <span className="stat-label">Network Status</span>
            <span className="stat-value">{chain} Live</span>
            <div className="stat-badge ready">
              <span className="dot">●</span> Connected
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-label">Sync Progress</span>
            <span className="stat-value">
              {blocks.length > 0 ? `#${blocks[0].number}` : 'Syncing...'}
            </span>
            <span className="stat-badge">Latest Block</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Global Traffic</span>
            <span className="stat-value">{globalTxs.length}+</span>
            <span className="stat-badge">Indexed Txs</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Latency</span>
            <span className="stat-value">~1.2s</span>
            <span className="stat-badge">API Speed</span>
          </div>
        </section>

        {/* Search Bar */}
        <div className="search-section">
          <AddressInput
            address={address}
            setAddress={setAddress}
            onSearch={fetchTransactions}
            onKeyPress={handleKeyPress}
            loading={searchLoading}
            chain={chain}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="content-grid-wrapper">
          {/* Left Column: Fixed Feed */}
          <aside className="sidebar-feed">
            <div className="dashboard-card sticky-card">
              <h3><span>📦</span> Recent Blocks</h3>
              <div className="feed-list">
                {blocks.length > 0 ? blocks.map(b => (
                  <div key={b.hash} className="feed-item">
                    <span className="block-num">#{b.number}</span>
                    <span className="hash-mini">{truncate(b.hash, 8)}</span>
                    <span className="time-mini">{new Date(b.timestamp).toLocaleTimeString()}</span>
                  </div>
                )) : <div className="loading-state">Synchronizing nodes...</div>}
              </div>
            </div>
          </aside>

          {/* Right Column: Dynamic View */}
          <section className="main-content-stream">
            {view === 'search' ? (
              <div className="search-results-view">
                <div className="results-toolbar">
                  <div className="results-info">
                    <button className="back-btn-pill" onClick={goToDashboard}>← Dashboard</button>
                    <h2>Wallet <span className="highlight-addr">{truncate(address, 10)}</span></h2>
                  </div>
                  <span className="result-badge">{transactions.length} Transactions</span>
                </div>
                
                <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                  <TransactionList 
                    transactions={transactions} 
                    address={address}
                    onSelectTransaction={handleSelectTransaction}
                  />
                </div>
              </div>
            ) : (
              <div className="dashboard-view-stack">
                <div className="dashboard-card">
                  <h3><span>⚡</span> Global Activity Feed</h3>
                  <div className="feed-list">
                    {globalTxs.slice(0, 10).map(tx => (
                      <div 
                        key={tx.hash} 
                        className="feed-item tx"
                        onClick={() => handleSelectTransaction(tx)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="tx-meta">
                          <span className="asset-tag">{tx.asset}</span>
                          <span className="value-tag">{tx.value} {tx.asset}</span>
                        </div>
                        <div className="tx-paths">
                          <span className="path-address">{truncate(tx.from)}</span>
                          <span className="arrow">→</span>
                          <span className="path-address">{truncate(tx.to)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-card">
                  <h3><span>🔍</span> Deep Transaction History</h3>
                  <TransactionList 
                    transactions={globalTxs} 
                    address=""
                    onSelectTransaction={handleSelectTransaction}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedTransaction && (
        <TransactionDetail 
          transaction={selectedTransaction} 
          onClose={closeTransactionDetail}
        />
      )}
    </div>
  );
}

export default App;
