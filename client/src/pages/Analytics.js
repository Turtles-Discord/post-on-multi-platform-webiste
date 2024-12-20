import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './Analytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [timeframe, setTimeframe] = useState('week');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    views: [],
    likes: [],
    shares: [],
    comments: []
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const accountsResponse = await fetch('/api/accounts/tiktok');
      const accountsData = await accountsResponse.json();
      setAccounts(accountsData);

      const response = await fetch(`/api/analytics?timeframe=${timeframe}&account=${selectedAccount}`);
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  }, [timeframe, selectedAccount]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-controls">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="account-select"
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading analytics...</div>
      ) : (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Video Views</h3>
            <Line
              data={{
                labels: stats.views.map(v => v.date),
                datasets: [{
                  label: 'Views',
                  data: stats.views.map(v => v.count),
                  borderColor: '#2196f3',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>

          <div className="analytics-card">
            <h3>Engagement Rate</h3>
            <Bar
              data={{
                labels: ['Likes', 'Comments', 'Shares'],
                datasets: [{
                  label: 'Engagement',
                  data: [
                    stats.likes.reduce((a, b) => a + b.count, 0),
                    stats.comments.reduce((a, b) => a + b.count, 0),
                    stats.shares.reduce((a, b) => a + b.count, 0)
                  ],
                  backgroundColor: ['#4caf50', '#ff9800', '#9c27b0']
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>

          <div className="analytics-card">
            <h3>Top Performing Videos</h3>
            <div className="video-list">
              {stats.topVideos?.map(video => (
                <div key={video.id} className="video-item">
                  <span className="video-title">{video.title}</span>
                  <span className="video-views">{video.views.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Account Growth</h3>
            <Line
              data={{
                labels: stats.followers?.map(f => f.date),
                datasets: [{
                  label: 'Followers',
                  data: stats.followers?.map(f => f.count),
                  borderColor: '#4caf50',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics; 