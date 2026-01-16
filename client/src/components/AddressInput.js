/**
 * AddressInput Component
 * 
 * Provides the input field and search button for entering Ethereum or Bitcoin addresses
 */

import React from 'react';

function AddressInput({ address, setAddress, onSearch, onKeyPress, loading, chain }) {
  return (
    <div className="search-section">
      <div className="address-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={`Search by ${chain} address...`}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={loading}
          spellCheck="false"
          autoComplete="off"
        />
        <button
          className="search-btn"
          onClick={onSearch}
          disabled={loading || !address}
        >
          {loading ? 'Searching...' : 'Explore'}
        </button>
      </div>
    </div>
  );
}

export default AddressInput;
