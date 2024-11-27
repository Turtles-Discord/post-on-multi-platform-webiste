import React, { useEffect } from 'react';
import './TikTokLogin.css';

function TikTokLogin() {
    useEffect(() => {
        // Initialize TikTok Login
        const loadTikTokLogin = async () => {
            try {
                // Replace with your Client Key from TikTok Developer Portal
                const clientKey = process.env.REACT_APP_TIKTOK_CLIENT_KEY;
                
                window.TikTokLogin.init({
                    clientKey: clientKey,
                    scope: 'user.info.basic,video.list,video.upload',
                    redirectUrl: `${process.env.REACT_APP_CLIENT_URL}/auth/tiktok/callback`,
                    state: 'your-csrf-token'
                });
            } catch (error) {
                console.error('TikTok Login initialization failed:', error);
            }
        };

        loadTikTokLogin();
    }, []);

    const handleTikTokLogin = () => {
        window.TikTokLogin.authorize();
    };

    return (
        <div className="tiktok-login-container">
            <button 
                className="tiktok-login-button"
                onClick={handleTikTokLogin}
            >
                <img 
                    src="/tiktok-icon.png" 
                    alt="TikTok" 
                    className="tiktok-icon"
                />
                Login with TikTok
            </button>
        </div>
    );
}

export default TikTokLogin; 