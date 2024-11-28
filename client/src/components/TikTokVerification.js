import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TikTokVerification = () => {
  const { fileName } = useParams();

  useEffect(() => {
    // Redirect to the correct file based on the fileName parameter
    const fileUrl = `${process.env.PUBLIC_URL}/${fileName}.txt`; // Adjust the path as necessary
    window.location.href = fileUrl;
  }, [fileName]);

  return null; // No UI needed, just a redirect
};

export default TikTokVerification;