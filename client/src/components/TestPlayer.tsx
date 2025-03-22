import React, { useEffect, useRef, useState } from 'react';
import fluidPlayer from 'fluid-player';
import 'fluid-player/src/css/fluidplayer.css';
import './TestPlayer.css';

interface TestPlayerProps {
  src: string[];
  poster?: string;
  title?: string;
  qualities?: { label: string; url: string }[];
}

const TestPlayer: React.FC<TestPlayerProps> = ({ src, poster, title, qualities }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>('');

  useEffect(() => {
    if (videoRef.current && src.length > 0) {
      // Destroy previous player instance if it exists
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }

      // If qualities are provided, use them, otherwise use the src array
      const videoSources = qualities?.length 
        ? qualities.map(q => ({ 
            type: 'video/mp4',
            src: q.url,
            title: q.label
          }))
        : src.map(url => ({
            type: 'video/mp4',
            src: url,
            title: 'Default'
          }));

      // Set the initial quality
      if (qualities?.length) {
        setCurrentQuality(qualities[0].label);
      }

      // Initialize Fluid Player
      playerInstanceRef.current = fluidPlayer(videoRef.current, {
        layoutControls: {
          primaryColor: "#ff0000",
          posterImage: poster || '',
          playButtonShowing: true,
          playPauseAnimation: true,
          fillToContainer: true,
          autoPlay: false,
          preload: 'auto',
          mute: false,
          doubleclickFullscreen: true,
          subtitlesEnabled: false,
          keyboardControl: true,
          title: title || 'Video Player',
          allowDownload: false,
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true
          },
          logo: {
            imageUrl: null,
            position: 'top left',
            clickUrl: null,
            opacity: 1,
            mouseOverImageUrl: null,
            imageMargin: '2px',
            hideWithControls: false,
            showOverAds: false
          },
        },
        vastOptions: {
          adList: [],
          skipButtonCaption: 'Skip ad in [seconds]',
          skipButtonClickCaption: 'Skip ad <span class="skip_button_icon"></span>',
          adText: null,
          adTextPosition: 'top left',
          adCTAText: 'Visit now!',
          adCTATextPosition: 'bottom right',
        }
      });

      // Add quality selector button if qualities are provided
      if (qualities?.length && qualities.length > 1) {
        const player = playerInstanceRef.current;

        // Create quality menu button
        const controlBar = document.querySelector('.fluid_controls_container');
        if (controlBar) {
          const qualityBtn = document.createElement('div');
          qualityBtn.className = 'fluid_control fluid_button fluid_control_quality';
          qualityBtn.innerHTML = `
            <span class="quality_button_text">${currentQuality}</span>
            <div class="fluid_quality_selector" style="display: none;">
              ${qualities.map(q => `
                <div class="fluid_quality_option ${q.label === currentQuality ? 'fluid_quality_selected' : ''}" 
                     data-quality="${q.label}" 
                     data-url="${q.url}">
                  ${q.label}
                </div>
              `).join('')}
            </div>
          `;

          // Insert before fullscreen button
          const fullscreenBtn = document.querySelector('.fluid_control_fullscreen');
          if (fullscreenBtn) {
            controlBar.insertBefore(qualityBtn, fullscreenBtn);
          } else {
            controlBar.appendChild(qualityBtn);
          }

          // Toggle quality menu
          qualityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const selector = qualityBtn.querySelector('.fluid_quality_selector');
            if (selector) {
              selector.style.display = selector.style.display === 'none' ? 'block' : 'none';
            }
          });

          // Add click handlers for quality options
          document.querySelectorAll('.fluid_quality_option').forEach(option => {
            option.addEventListener('click', (e) => {
              e.stopPropagation();
              const target = e.currentTarget as HTMLElement;
              const quality = target.getAttribute('data-quality') || '';
              const url = target.getAttribute('data-url') || '';

              // Update selected quality
              document.querySelectorAll('.fluid_quality_option').forEach(opt => {
                opt.classList.remove('fluid_quality_selected');
              });
              target.classList.add('fluid_quality_selected');

              // Update quality button text
              const btnText = qualityBtn.querySelector('.quality_button_text');
              if (btnText) {
                btnText.textContent = quality;
              }

              // Hide selector
              const selector = qualityBtn.querySelector('.fluid_quality_selector');
              if (selector) {
                selector.style.display = 'none';
              }

              // Remember current time and playing state
              const currentTime = videoRef.current?.currentTime || 0;
              const wasPlaying = !videoRef.current?.paused;

              // Change source
              if (videoRef.current) {
                videoRef.current.src = url;
                videoRef.current.load();
                videoRef.current.currentTime = currentTime;

                if (wasPlaying) {
                  videoRef.current.play();
                }
              }

              setCurrentQuality(quality);
            });
          });

          // Close menu when clicking outside
          document.addEventListener('click', () => {
            const selector = qualityBtn.querySelector('.fluid_quality_selector');
            if (selector) {
              selector.style.display = 'none';
            }
          });
        }
      }
    }

    // Cleanup function
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [src, poster, title, qualities]); // Re-initialize player when these props change

  useEffect(() => {
    const videoElement = videoRef.current;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    if (videoElement) {
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
      }
    };
  }, []);

  return (
    <div className="video-player-container">
      <video ref={videoRef} className="fluid-player" playsInline>
        {src.map((url, index) => (
          <source key={index} src={url} type="video/mp4" />
        ))}
      </video>
    </div>
  );
};

export default TestPlayer;