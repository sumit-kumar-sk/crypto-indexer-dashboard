/**
 * TransactionList Component
 * 
 * Displays a list of transactions in a clean, readable table format
 */

import React from 'react';

function TransactionList({ transactions, address }) {
  /**
   * Truncates long addresses for better display
   */
  const truncateAddress = (addr) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /**
   * Formats timestamp to readable date
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp || timestamp === 'N/A') return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  /**
   * Determines if transaction is incoming or outgoing
   */
  const getTransactionType = (tx) => {
    if (!tx || !tx.to) return 'OUT';
    return tx.to.toLowerCase() === address.toLowerCase() ? 'IN' : 'OUT';
  };

  /**
   * Gets the correct explorer link based on chain
   */
  const getExplorerLink = (hash, chain) => {
    if (chain === 'BTC') return `https://blockstream.info/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-list empty">
        <div className="empty-state">
          <p>No transactions found for this address.</p>
          <p className="empty-hint">Note: Only transactions in indexed blocks will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value</th>
              <th>Asset</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={`${tx.hash}-${index}`} className="transaction-row">
                <td>
                  <span className={`tx-type ${getTransactionType(tx).toLowerCase()}`}>
                    {getTransactionType(tx)}
                  </span>
                </td>
                <td className="hash-cell">
                  <a
                    href={getExplorerLink(tx.hash, tx.chain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hash-link"
                    title={tx.hash}
                  >
                    {truncateAddress(tx.hash)}
                  </a>
                </td>
                <td className="address-cell" title={tx.from}>
                  {truncateAddress(tx.from)}
                </td>
                <td className="address-cell" title={tx.to}>
                  {truncateAddress(tx.to)}
                </td>
                <td className="value-cell">
                  {tx.value}
                </td>
                <td className="asset-cell">
                  <span className="asset-badge">{tx.asset}</span>
                </td>
                <td className="timestamp-cell">
                  {formatTimestamp(tx.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionList;
