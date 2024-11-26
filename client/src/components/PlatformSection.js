import React from 'react';
import AccountConnector from './AccountConnector';
import { toast } from 'react-toastify';
import api from '../services/api';
import './PlatformSection.css';

function PlatformSection({ platform, accounts, onAccountsUpdate }) {
  const handleConnect = async (accountNumber) => {
    // Open platform login in a popup window
    const width = 600;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const authUrl = `${process.env.REACT_APP_API_URL}/auth/${platform}?accountNumber=${accountNumber}`;
    
    const popup = window.open(
      authUrl,
      `${platform}_auth_${accountNumber}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for authentication success message
    const handleMessage = (event) => {
      if (event.data.type === 'AUTH_SUCCESS' && 
          event.data.platform === platform && 
          event.data.accountNumber === accountNumber) {
        popup.close();
        toast.success(`Successfully connected ${platform} account ${event.data.username}`);
        onAccountsUpdate();
        // Clean up event listener
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  const handleDisconnect = async (accountNumber) => {
    try {
      await api.delete(`/auth/${platform}/${accountNumber}`);
      toast.success(`Disconnected ${platform} account successfully`);
      onAccountsUpdate();
    } catch (error) {
      toast.error(`Failed to disconnect account: ${error.message}`);
    }
  };

  return (
    <div className="platform-section">
      <div className="platform-header">
        <h2>{platform.toUpperCase()}</h2>
        <span className="connected-count">
          {accounts.length} connected
        </span>
      </div>

      <div className="accounts-grid">
        {Array.from({ length: 100 }, (_, i) => i + 1).map((number) => {
          const account = accounts.find(a => a.accountNumber === number);
          
          return (
            <AccountConnector
              key={number}
              number={number}
              platform={platform}
              account={account}
              onConnect={() => handleConnect(number)}
              onDisconnect={() => handleDisconnect(number)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PlatformSection; 