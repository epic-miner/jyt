
// Video-specific protection features for 9Anime

// Watermark overlay to deter screen recording
export const addDynamicWatermark = (videoElement: HTMLVideoElement) => {
  const container = videoElement.parentElement as HTMLElement;
  
  // Ensure container has position relative
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  
  // Create watermark element
  const watermark = document.createElement('div');
  watermark.className = 'video-watermark';
  watermark.style.position = 'absolute';
  watermark.style.pointerEvents = 'none';
  watermark.style.opacity = '0.3';
  watermark.style.color = 'white';
  watermark.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
  watermark.style.fontSize = '14px';
  watermark.style.fontFamily = 'Arial, sans-serif';
  watermark.style.zIndex = '10';
  
  // Generate user identifier (this would typically use a more robust method)
  const userId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Update watermark position and content periodically
  const updateWatermark = () => {
    const timestamp = new Date().toLocaleTimeString();
    watermark.textContent = `9Anime • ${userId} • ${timestamp}`;
    
    // Position watermark randomly within the video
    const maxX = container.clientWidth - watermark.clientWidth;
    const maxY = container.clientHeight - watermark.clientHeight;
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    
    watermark.style.left = `${randomX}px`;
    watermark.style.top = `${randomY}px`;
  };
  
  // Initial setup
  container.appendChild(watermark);
  updateWatermark();
  
  // Update watermark every 3 seconds
  const intervalId = setInterval(updateWatermark, 3000);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    if (container.contains(watermark)) {
      container.removeChild(watermark);
    }
  };
};

// Detect and prevent screen capture attempts
export const preventScreenCapture = () => {
  // Modern browsers expose the Screen Capture API
  if (navigator.mediaDevices) {
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
    
    // Override getDisplayMedia to detect screen capture attempts
    navigator.mediaDevices.getDisplayMedia = async function(constraints) {
      try {
        alert('Screen recording is disabled on 9Anime for copyright protection.');
        throw new Error('Screen recording is not allowed');
      } catch (err) {
        throw err;
      }
    };
  }
};

// DRM capabilities detection (for educational purposes)
export const checkDrmSupport = () => {
  if (window.navigator.requestMediaKeySystemAccess) {
    return window.navigator.requestMediaKeySystemAccess('org.w3.clearkey', [
      {
        initDataTypes: ['keyids'],
        audioCapabilities: [
          { contentType: 'audio/mp4; codecs="mp4a.40.2"' }
        ],
        videoCapabilities: [
          { contentType: 'video/mp4; codecs="avc1.42E01E"' }
        ]
      }
    ])
    .then(() => true)
    .catch(() => false);
  }
  return Promise.resolve(false);
};

// Enhanced content protection
export const initializeVideoSecurity = (videoElement: HTMLVideoElement) => {
  // Add dynamic watermark
  const removeWatermark = addDynamicWatermark(videoElement);
  
  // Check for screen recording
  preventScreenCapture();
  
  // Prevent time skips in video (optional, can be uncomfortable for users)
  let lastPlaybackTime = 0;
  const checkPlaybackJumps = () => {
    const currentTime = videoElement.currentTime;
    const timeDiff = Math.abs(currentTime - lastPlaybackTime);
    
    // If there's a suspicious jump (more than 5 seconds without seeking)
    if (timeDiff > 5 && !videoElement.seeking) {
      // Could indicate manipulation - take action if needed
      console.warn('Suspicious playback time jump detected');
    }
    
    lastPlaybackTime = currentTime;
  };
  
  const playbackInterval = setInterval(checkPlaybackJumps, 1000);
  
  // Return cleanup function
  return () => {
    removeWatermark();
    clearInterval(playbackInterval);
  };
};

export default {
  addDynamicWatermark,
  preventScreenCapture,
  checkDrmSupport,
  initializeVideoSecurity
};
