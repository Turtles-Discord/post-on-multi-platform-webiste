const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const tiktokConfig = require('../config/tiktok');

class TikTokController {
    // Upload video using push_by_file
    async uploadVideoByFile(req, res) {
        try {
            const { accessToken } = req.user;
            const videoFile = req.file;
            
            const form = new FormData();
            form.append('video', fs.createReadStream(videoFile.path));
            
            const response = await axios.post(
                `${tiktokConfig.endpoints.videoUpload}/post_video`,
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            res.json(response.data);
        } catch (error) {
            console.error('Error uploading video:', error);
            res.status(500).json({ error: 'Failed to upload video' });
        }
    }

    // Upload video using pull_by_url
    async uploadVideoByUrl(req, res) {
        try {
            const { accessToken } = req.user;
            const { videoUrl, title, privacy_level } = req.body;
            
            const response = await axios.post(
                `${tiktokConfig.endpoints.videoUpload}/post_video_by_url`,
                {
                    video_url: videoUrl,
                    title,
                    privacy_level: privacy_level || 'PRIVATE'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            res.json(response.data);
        } catch (error) {
            console.error('Error uploading video by URL:', error);
            res.status(500).json({ error: 'Failed to upload video' });
        }
    }

    // Direct post to TikTok
    async directPost(req, res) {
        try {
            const { accessToken } = req.user;
            const { videoId, title, privacy_level } = req.body;
            
            const response = await axios.post(
                `${tiktokConfig.endpoints.videoUpload}/publish`,
                {
                    video_id: videoId,
                    title,
                    privacy_level: privacy_level || 'PUBLIC'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            res.json(response.data);
        } catch (error) {
            console.error('Error publishing video:', error);
            res.status(500).json({ error: 'Failed to publish video' });
        }
    }
}

module.exports = new TikTokController(); 