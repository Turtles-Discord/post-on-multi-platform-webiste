import React, { useState, useEffect } from 'react';
import PlatformSection from '../components/PlatformSection';
import VideoUploader from '../components/VideoUploader';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [videoFile, setVideoFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [accounts, setAccounts] = useState({
    tiktok: [],
    instagram: []
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/auth/accounts');
      const groupedAccounts = response.data.accounts.reduce((acc, account) => {
        if (!acc[account.platform]) {
          acc[account.platform] = [];
        }
        acc[account.platform].push(account);
        return acc;
      }, { tiktok: [], instagram: [] });
      
      setAccounts(groupedAccounts);
    } catch (error) {
      toast.error('Failed to fetch connected accounts');
    }
  };

  const handlePost = async () => {
    if (!videoFile) {
      toast.error('Please select a video first');
      return;
    }

    setIsPosting(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('description', description);

    try {
      await api.post('/post/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Video posted successfully');
      setVideoFile(null);
      setDescription('');
      fetchAccounts(); // Refresh account status
    } catch (error) {
      toast.error('Failed to post video: ' + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Social Media Dashboard</h1>
      </div>
      
      <div className="dashboard-content">
        <div className="platform-sections">
          <PlatformSection 
            platform="tiktok"
            accounts={accounts.tiktok}
            onAccountsUpdate={fetchAccounts}
          />
          <PlatformSection 
            platform="instagram"
            accounts={accounts.instagram}
            onAccountsUpdate={fetchAccounts}
          />
        </div>

        <div className="upload-section">
          <VideoUploader 
            videoFile={videoFile}
            onFileSelect={setVideoFile}
            description={description}
            onDescriptionChange={(e) => setDescription(e.target.value)}
            onPost={handlePost}
            isPosting={isPosting}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 