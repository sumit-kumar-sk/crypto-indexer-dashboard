import React from 'react';

function AddressInput({ address, setAddress, onSearch, onKeyPress, loading, chain }) {
  const getPlaceholder = () => {
    return chain === 'ETH' 
      ? "Enter 0x... address" 
      : "Enter BTC address (bc1..., 1..., 3...)";
  };

  return (
    <div className="address-input-wrapper">
      <div className="search-icon-box">
        {chain === 'ETH' ? '⟠' : '₿'}
      </div>
      <input
        type="text"
        className="search-input"
        placeholder={getPlaceholder()}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyPress={onKeyPress}
        disabled={loading}
      />
      <button 
        className="search-btn" 
        onClick={onSearch}
        disabled={loading || !address.trim()}
      >
        {loading ? (
          <span className="loading-spinner">Searching...</span>
        ) : (
          "Explore Wallet"
        )}
      </button>
    </div>
  );
}

export default AddressInput;
