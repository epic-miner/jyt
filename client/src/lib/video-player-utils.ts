
// YouTube-like video player animations and utilities

/**
 * Shows a tap indicator animation (similar to YouTube's double-tap feedback)
 * @param side 'left' or 'right' side of the screen
 */
export const showTapIndicator = (side: 'left' | 'right') => {
  const element = document.getElementById(`tap-indicator-${side}`);
  if (!element) return;

  // Reset any existing animations
  element.style.animation = 'none';
  element.offsetHeight; // Trigger reflow
  
  // Apply a new animation
  element.style.animation = 'fadeInOut 0.6s ease-in-out';
  element.style.opacity = '1';
  
  // Remove animation after it completes
  setTimeout(() => {
    element.style.animation = '';
    element.style.opacity = '0';
  }, 600);
};

/**
 * Creates and adds CSS keyframes for video player animations
 */
export const addVideoPlayerKeyframes = () => {
  // Check if already added
  if (document.getElementById('video-player-keyframes')) return;
  
  const style = document.createElement('style');
  style.id = 'video-player-keyframes';
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(0, 0) scale(0.8); }
      20% { opacity: 1; transform: translate(0, 0) scale(1.1); }
      80% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(0, 0) scale(0.8); }
    }
    
    @keyframes progressGrow {
      0% { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
  `;
  
  document.head.appendChild(style);
};

/**
 * YouTube-like playback control with double-tap handling
 */
export const setupYouTubeControls = (
  playerContainer: HTMLElement,
  skipBackward: () => void,
  skipForward: () => void,
  togglePlayPause: () => void,
  setShowControls: (show: boolean) => void,
  showControlsTemporarily: () => void
) => {
  let lastTap = 0;
  let tapTimeout: NodeJS.Timeout | null = null;
  
  // Add keyframes needed for animations
  addVideoPlayerKeyframes();
  
  // Function to show tap feedback indicator
  const showTapIndicator = (side: 'left' | 'right') => {
    // Create or get existing indicator
    let indicator = document.querySelector(`.tap-indicator-${side}`) as HTMLElement;
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = `tap-indicator-${side}`;
      indicator.innerHTML = `
        <div class="tap-indicator-circle">
          <div class="tap-indicator-icon">
            ${side === 'left' ? '⟲ 10' : '⟳ 10'}
          </div>
        </div>
      `;
      indicator.style.position = 'absolute';
      indicator.style.top = '50%';
      indicator.style.transform = 'translateY(-50%)';
      indicator.style[side] = '25%';
      indicator.style.color = 'white';
      indicator.style.fontSize = '20px';
      indicator.style.opacity = '0';
      indicator.style.transition = 'opacity 0.2s ease';
      indicator.style.zIndex = '100';
      indicator.style.pointerEvents = 'none';
      
      const circle = indicator.querySelector('.tap-indicator-circle') as HTMLElement;
      if (circle) {
        circle.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        circle.style.borderRadius = '50%';
        circle.style.width = '60px';
        circle.style.height = '60px';
        circle.style.display = 'flex';
        circle.style.alignItems = 'center';
        circle.style.justifyContent = 'center';
      }
      
      playerContainer.appendChild(indicator);
    }
    
    // Show and animate the indicator
    indicator.style.opacity = '1';
    
    // Hide after animation completes
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 500);
  };
  
  const handleTap = (e: TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    // Clear any pending single tap
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      tapTimeout = null;
    }
    
    // Detect double tap (YouTube-like behavior)
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      e.preventDefault();
      
      // Get tap position to determine skip direction (left/right)
      const touch = e.touches[0] || e.changedTouches[0];
      const containerWidth = playerContainer.offsetWidth;
      const touchX = touch.clientX;
      
      if (touchX < containerWidth / 2) {
        // Double tap on left side - skip backward
        skipBackward();
        showTapIndicator('left');
      } else {
        // Double tap on right side - skip forward
        skipForward();
        showTapIndicator('right');
      }
    } else {
      // Single tap - wait briefly to see if it becomes a double tap
      tapTimeout = setTimeout(() => {
        // YouTube behavior: toggle controls on single tap
        if (e.target === playerContainer || playerContainer.contains(e.target as Node)) {
          togglePlayPause();
          showControlsTemporarily();
        }
      }, 200);
    }
    
    lastTap = currentTime;
  };
  
  playerContainer.addEventListener('touchstart', handleTap);
  
  // Return a cleanup function
  return () => {
    playerContainer.removeEventListener('touchstart', handleTap);
    
    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }
  };
};
