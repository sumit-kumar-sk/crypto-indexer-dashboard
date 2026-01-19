import React from 'react';

function TransactionList({ transactions, address, onSelectTransaction }) {
  const truncate = (str) => str ? `${str.slice(0, 10)}...${str.slice(-8)}` : 'N/A';

  const isOutgoing = (tx) => {
    if (!address) return false;
    return tx.from.toLowerCase() === address.trim().toLowerCase();
  };

  const handleRowClick = (tx) => {
    if (onSelectTransaction) {
      onSelectTransaction(tx);
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions found in this view.</p>
        <p className="empty-hint">Network data is indexed in real-time. Global feeds refresh automatically.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Hash</th>
            {address && <th>Type</th>}
            <th>From</th>
            <th>To</th>
            <th>Value</th>
            <th>Asset</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr 
              key={`${tx.hash}-${index}`} 
              className={`transaction-row ${onSelectTransaction ? 'clickable-row' : ''}`}
              onClick={() => handleRowClick(tx)}
            >
              <td className="hash-column">
                <span className="hash-link">{truncate(tx.hash)}</span>
              </td>
              {address && (
                <td>
                  <span className={`tx-type ${isOutgoing(tx) ? 'out' : 'in'}`}>
                    {isOutgoing(tx) ? 'OUT' : 'IN'}
                  </span>
                </td>
              )}
              <td className="addr-column">{truncate(tx.from)}</td>
              <td className="addr-column">{truncate(tx.to)}</td>
              <td className="value-column">
                <span className="value-text">{tx.value}</span>
              </td>
              <td className="asset-column">
                <span className="asset-badge">{tx.asset}</span>
              </td>
              <td className="time-column">
                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
