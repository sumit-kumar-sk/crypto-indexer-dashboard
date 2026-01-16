import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// import AddressInput from './components/AddressInput'; // Commented out to solve warnings
import TransactionList from './components/TransactionList';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  // const [address, setAddress] = useState(''); // Commented out to solve warnings
  const [chain, setChain] = useState('ETH'); // 'ETH' or 'BTC'
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'search'
  
  // const [transactions, setTransactions] = useState([]); // Commented out to solve warnings
  const [blocks, setBlocks] = useState([]);
  const [globalTxs, setGlobalTxs] = useState([]);
  
  // const [loading, setLoading] = useState(false); // Commented out to solve warnings
  // const [error, setError] = useState(null); // Commented out to solve warnings

  // Fetch dashboard data
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
    if (view === 'dashboard') {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [view, fetchDashboardData]);

  /* Commented out to solve warnings
  const fetchTransactions = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setView('search');
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/${address.trim()}`);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };
  */

  const truncate = (str, n = 6) => str ? `${str.slice(0, n)}...${str.slice(-4)}` : '';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Crypto Indexer</h1>
          <p className="app-subtitle">Self-hosted Real-time Blockchain Explorer</p>
          <div className="chain-toggle-container">
            <button 
              className={`toggle-btn ${chain === 'ETH' ? 'active' : ''}`}
              onClick={() => { setChain('ETH'); setView('dashboard'); }}
            >
              Ethereum
            </button>
            <button 
              className={`toggle-btn ${chain === 'BTC' ? 'active' : ''}`}
              onClick={() => { setChain('BTC'); setView('dashboard'); }}
            >
              Bitcoin
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {/* Search functionality hidden for now
          <div className="search-section">
            <AddressInput
              address={address}
              setAddress={setAddress}
              onSearch={fetchTransactions}
              onKeyPress={(e) => e.key === 'Enter' && fetchTransactions()}
              loading={loading}
              chain={chain}
            />
          </div>
          */}

          {/* view is always 'dashboard' for now */}
          <div className="dashboard-content">
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>
                  <span>📦</span> Recent {chain} Blocks
                </h3>
                <div className="feed-list">
                  {blocks.length > 0 ? blocks.map(b => (
                    <a 
                      key={b.hash} 
                      className="feed-item clickable" 
                      href={chain === 'ETH' ? `https://etherscan.io/block/${b.number}` : `https://blockstream.info/block/${b.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="block-num">#{b.number}</span>
                      <span className="hash-mini">{truncate(b.hash)}</span>
                      <span className="time-mini">{new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </a>
                  )) : <p>Waiting for data...</p>}
                </div>
              </div>

              <div className="dashboard-card">
                <h3>
                  <span>⚡</span> Global Activity Feed
                </h3>
                <div className="feed-list">
                  {globalTxs.length > 0 ? globalTxs.map(tx => (
                    <a 
                      key={tx.hash} 
                      className="feed-item tx clickable"
                      href={chain === 'ETH' ? `https://etherscan.io/tx/${tx.hash}` : `https://blockstream.info/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
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
                    </a>
                  )) : <p>Scanning network...</p>}
                </div>
              </div>
            </div>

            <div className="dashboard-full-width">
              <div className="dashboard-card">
                <h3>
                  <span>🔍</span> Latest {chain} Transactions
                </h3>
                <TransactionList transactions={globalTxs} address="" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
