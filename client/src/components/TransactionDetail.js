import React, { useState } from 'react';

function TransactionDetail({ transaction, onClose }) {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!transaction) return null;

  return (
    <div className="transaction-detail-overlay" onClick={onClose}>
      <div className="transaction-detail-modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="modal-brand">
            <span className="brand-dot"></span>
            <h2>Transaction Insight</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </header>

        <div className="modal-content-scroll">
          {/* Main Info Hero */}
          <section className="modal-hero">
            <div className="hero-stat">
              <span className="hero-label">Value</span>
              <span className="hero-value">{transaction.value} {transaction.asset}</span>
            </div>
            <div className="hero-stat">
              <span className="hero-label">Network</span>
              <span className="hero-badge">{transaction.chain}</span>
            </div>
          </section>

          {/* Detailed Data Grid */}
          <div className="details-grid">
            <div className="detail-item full clickable" onClick={() => copyToClipboard(transaction.hash, 'hash')}>
              <label>Transaction Hash</label>
              <div className="value-with-copy">
                <code>{transaction.hash}</code>
                <span className="copy-icon">{copied === 'hash' ? '✓' : '⧉'}</span>
              </div>
            </div>

            <div className="detail-item clickable" onClick={() => copyToClipboard(transaction.from, 'from')}>
              <label>From Address</label>
              <div className="value-with-copy">
                <code>{transaction.from}</code>
                <span className="copy-icon">{copied === 'from' ? '✓' : '⧉'}</span>
              </div>
            </div>

            <div className="detail-item clickable" onClick={() => copyToClipboard(transaction.to, 'to')}>
              <label>To Address</label>
              <div className="value-with-copy">
                <code>{transaction.to}</code>
                <span className="copy-icon">{copied === 'to' ? '✓' : '⧉'}</span>
              </div>
            </div>

            <div className="detail-item">
              <label>Block Number</label>
              <div className="static-value">#{transaction.blockNum.toString()}</div>
            </div>

            <div className="detail-item">
              <label>Timestamp</label>
              <div className="static-value">
                {new Date(transaction.timestamp).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>

            <div className="detail-item">
              <label>Asset</label>
              <div className="static-value">
                <span className={`asset-tag-inline ${transaction.chain.toLowerCase()}`}>
                  {transaction.asset}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <div className="static-value">
                <span className="status-indicator confirmed">Confirmed</span>
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <p>Data indexed via local node at {new Date().toLocaleTimeString()}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetail;
