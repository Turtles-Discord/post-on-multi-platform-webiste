import React, { useRef } from 'react';
import './VideoUploader.css';

function VideoUploader({ 
  videoFile, 
  onFileSelect, 
  description, 
  onDescriptionChange, 
  onPost, 
  isPosting 
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('File size too large. Maximum size is 100MB.');
        return;
      }
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file.');
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className="video-uploader">
      <h2>Upload Video</h2>
      
      <div className="upload-section">
        <div 
          className="drop-zone"
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) onFileSelect(file);
          }}
        >
          {videoFile ? (
            <div className="video-preview">
              <video 
                src={URL.createObjectURL(videoFile)} 
                controls
                style={{ maxHeight: '200px' }}
              />
              <button 
                className="remove-video"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Drag and drop a video or click to select</p>
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          style={{ display: 'none' }}
        />
      </div>

      <div className="description-section">
        <textarea
          placeholder="Enter video description..."
          value={description}
          onChange={onDescriptionChange}
          rows={4}
          disabled={isPosting}
        />
      </div>

      <button
        className="post-button"
        onClick={onPost}
        disabled={!videoFile || isPosting}
      >
        {isPosting ? (
          <>
            <span className="spinner"></span>
            Posting...
          </>
        ) : (
          'Post to All Accounts'
        )}
      </button>
    </div>
  );
}

export default VideoUploader; 