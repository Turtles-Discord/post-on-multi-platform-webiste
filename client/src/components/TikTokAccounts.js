const connectAccount = (accountNumber) => {
  const width = 600;
  const height = 800;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  const authUrl = process.env.NODE_ENV === 'development'
    ? `http://localhost:5000/api/auth/tiktok?accountNumber=${accountNumber}`
    : `https://post-on-multi-platform-webiste.vercel.app/api/auth/tiktok?accountNumber=${accountNumber}`;

  const authWindow = window.open(
    authUrl,
    'TikTok Auth',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  window.addEventListener('message', (event) => {
    if (event.data.type === 'AUTH_SUCCESS' && 
        event.data.platform === 'tiktok') { 
      // Handle successful authentication
      console.log('TikTok account connected:', event.data); 
    }
  });
}; 