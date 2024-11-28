import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TikTokVerification = () => {
  const { fileName } = useParams();

  useEffect(() => {
    const fileUrl = `${process.env.PUBLIC_URL}/${fileName}.txt`;
    window.location.href = fileUrl;
  }, [fileName]);

  return null; // No UI needed, just a redirect
};

export default TikTokVerification;