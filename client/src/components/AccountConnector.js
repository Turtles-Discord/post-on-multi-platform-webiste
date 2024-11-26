import React from 'react';
import './AccountConnector.css';

function AccountConnector({ number, platform, account, onConnect, onDisconnect }) {
  return (
    <div className={`account-connector ${account ? 'connected' : ''}`}>
      <div className="account-number">{number}</div>
      
      {account ? (
        <div className="account-info">
          <span className="username">{account.username}</span>
          <button 
            className="disconnect-btn"
            onClick={onDisconnect}
            title="Disconnect account"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          className="connect-btn"
          onClick={onConnect}
        >
          Connect
        </button>
      )}
    </div>
  );
}

export default AccountConnector; 