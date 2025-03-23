/**
 * Ad Configuration Utility
 * 
 * This module provides standardized ad configurations for Fluid Player.
 * It defines interfaces, helper functions, and preset configurations
 * for different ad strategies.
 */

// Type definitions for Fluid Player ad configuration
export interface FluidPlayerAdConfig {
  roll: 'preRoll' | 'midRoll' | 'postRoll' | 'onPauseRoll';
  vastTag: string;
  timer?: number; // Required for midRoll
  adText?: string;
  adTextPosition?: 'top left' | 'top right' | 'bottom left' | 'bottom right';
  vAlign?: 'top' | 'middle' | 'bottom';
  nonLinearDuration?: number;
  size?: '468x60' | '300x250' | '728x90';
  fallbackVastTags?: string[];
}

export interface FluidPlayerVastOptions {
  adList: FluidPlayerAdConfig[];
  skipButtonCaption: string;
  skipButtonClickCaption: string;
  adText: string;
  adTextPosition: 'top left' | 'top right' | 'bottom left' | 'bottom right';
  adCTAText: string | boolean;
  adCTATextPosition: 'top left' | 'top right' | 'bottom left' | 'bottom right';
  vastTimeout: number;
  showPlayButton: boolean;
  maxAllowedVastTagRedirects: number;
  showProgressbarMarkers: boolean;
  vastAdvanced?: {
    vastLoadedCallback?: () => void;
    noVastVideoCallback?: () => void;
    vastVideoSkippedCallback?: () => void;
    vastVideoEndedCallback?: () => void;
  };
}

// Helper function to create Google IMA VAST tag URLs
export function createGoogleVastTag(
  adUnitPath: string = '/124319096/external/single_ad_samples',
  adType: string = 'linear',
  customParams: Record<string, string> = {}
): string {
  // Convert custom parameters to URL format
  const customParamsString = Object.entries(customParams)
    .map(([key, value]) => `${encodeURIComponent(key)}%3D${encodeURIComponent(value)}`)
    .join('%26');

  // Add timestamp for cache busting
  const timestamp = Date.now();

  return `https://pubads.g.doubleclick.net/gampad/ads?` +
    `sz=640x480&` +
    `iu=${encodeURIComponent(adUnitPath)}&` +
    `ciu_szs=300x250%2C728x90&` +
    `impl=s&` +
    `gdfp_req=1&` +
    `env=vp&` +
    `output=vast&` +
    `unviewed_position_start=1&` +
    `url=${encodeURIComponent(window.location.href)}&` +
    `description_url=${encodeURIComponent(window.location.href)}&` +
    `correlator=${timestamp}&` +
    `vid_d=30&` +
    `ads_type=${adType}&` +
    (customParamsString ? `cust_params=${customParamsString}` : '');
}

// Helper function for test VAST tags (sample tags hosted by various ad providers)
export function getSampleVastTag(type: 'linear' | 'nonlinear' = 'linear'): string {
  if (type === 'nonlinear') {
    return 'https://pubads.g.doubleclick.net/gampad/ads?sz=480x70&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dnonlinear&correlator=' + Date.now();
  } else {
    return 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=' + Date.now();
  }
}

// Create a frequency capped ad configuration
export function createFrequencyCappedAds(
  vastTag: string,
  options: {
    preRoll?: boolean;
    midRollFrequency?: number;
    postRoll?: boolean;
    maxMidRolls?: number;
    videoDuration?: number;
  } = {}
): FluidPlayerAdConfig[] {
  const {
    preRoll = true,
    midRollFrequency = 300, // Default 5 minutes between ads
    postRoll = true,
    maxMidRolls = 2,
    videoDuration = 1200, // Default 20 minutes
  } = options;

  const adConfigs: FluidPlayerAdConfig[] = [];

  // Add pre-roll if requested
  if (preRoll) {
    adConfigs.push({
      roll: 'preRoll',
      vastTag,
      adText: 'Ad',
    });
  }

  // Add mid-rolls based on frequency and duration
  if (midRollFrequency && videoDuration > midRollFrequency) {
    // Calculate how many mid-rolls we can fit based on frequency and max allowed
    const potentialMidRolls = Math.floor(videoDuration / midRollFrequency);
    const actualMidRolls = Math.min(potentialMidRolls, maxMidRolls);
    
    // Calculate optimal spacing for mid-rolls
    const spacing = videoDuration / (actualMidRolls + 1);
    
    for (let i = 1; i <= actualMidRolls; i++) {
      const timer = Math.floor(spacing * i);
      adConfigs.push({
        roll: 'midRoll',
        vastTag,
        timer,
        adText: 'Ad',
      });
    }
  }

  // Add post-roll if requested
  if (postRoll) {
    adConfigs.push({
      roll: 'postRoll',
      vastTag,
      adText: 'Ad',
    });
  }

  return adConfigs;
}

// Pre-defined ad configurations
export const adConfigurations = {
  // Default configuration with all ad types
  default: {
    adList: [
      {
        roll: 'preRoll' as const,
        vastTag: getSampleVastTag('linear'),
        adText: 'Advertisement',
      },
      {
        roll: 'midRoll' as const,
        vastTag: getSampleVastTag('linear'),
        timer: 300, // 5 minutes
        adText: 'Advertisement',
      },
      {
        roll: 'midRoll' as const,
        vastTag: getSampleVastTag('linear'),
        timer: 600, // 10 minutes
        adText: 'Advertisement',
      },
      {
        roll: 'postRoll' as const,
        vastTag: getSampleVastTag('linear'),
        adText: 'Advertisement',
      },
      {
        roll: 'onPauseRoll' as const,
        vastTag: getSampleVastTag('nonlinear'),
        adText: 'Advertisement',
        vAlign: 'bottom',
        nonLinearDuration: 30,
        size: '300x250',
      },
    ],
    skipButtonCaption: 'Skip ad in [seconds]',
    skipButtonClickCaption: 'Skip ad ❯',
    adText: 'Advertisement',
    adTextPosition: 'top right' as const,
    adCTAText: 'Learn More',
    adCTATextPosition: 'bottom right' as const,
    vastTimeout: 8000,
    showPlayButton: true,
    maxAllowedVastTagRedirects: 3,
    showProgressbarMarkers: true,
  },
  
  // Minimal configuration with only pre-roll ads
  minimal: {
    adList: [
      {
        roll: 'preRoll' as const,
        vastTag: getSampleVastTag('linear'),
        adText: 'Advertisement',
      },
    ],
    skipButtonCaption: 'Skip ad in [seconds]',
    skipButtonClickCaption: 'Skip ad ❯',
    adText: 'Advertisement',
    adTextPosition: 'top right' as const,
    adCTAText: 'Learn More',
    adCTATextPosition: 'bottom right' as const,
    vastTimeout: 8000,
    showPlayButton: true,
    maxAllowedVastTagRedirects: 3,
    showProgressbarMarkers: true,
  },
  
  // Frequency-capped configuration that adjusts based on content length
  'frequency-capped': {
    getAdList: (videoDuration: number = 1200) => createFrequencyCappedAds(
      getSampleVastTag('linear'),
      {
        preRoll: true,
        midRollFrequency: 450, // 7.5 minutes between ads
        postRoll: true,
        maxMidRolls: 2,
        videoDuration,
      }
    ),
    skipButtonCaption: 'Skip ad in [seconds]',
    skipButtonClickCaption: 'Skip ad ❯',
    adText: 'Advertisement',
    adTextPosition: 'top right' as const,
    adCTAText: 'Learn More',
    adCTATextPosition: 'bottom right' as const,
    vastTimeout: 8000,
    showPlayButton: true,
    maxAllowedVastTagRedirects: 3,
    showProgressbarMarkers: true,
  },
  
  // No ads configuration for premium users
  none: {
    adList: [],
    skipButtonCaption: 'Skip ad in [seconds]',
    skipButtonClickCaption: 'Skip ad ❯',
    adText: '',
    adTextPosition: 'top right' as const,
    adCTAText: false,
    adCTATextPosition: 'bottom right' as const,
    vastTimeout: 8000,
    showPlayButton: false,
    maxAllowedVastTagRedirects: 3,
    showProgressbarMarkers: false,
  },
};

// Get the ad configuration based on the requested preset and adjust for content duration
export function getAdConfiguration(
  preset: keyof typeof adConfigurations | 'default' = 'default',
  contentDuration?: number
): FluidPlayerVastOptions {
  const config = adConfigurations[preset] || adConfigurations.default;
  
  // For frequency-capped config, we need to generate the ad list dynamically
  if (preset === 'frequency-capped' && contentDuration && config.getAdList) {
    return {
      ...config,
      adList: config.getAdList(contentDuration),
    };
  }
  
  return config as FluidPlayerVastOptions;
}

// Advanced ad tracking and analytics events
export function setupAdTracking(playerInstance: any) {
  if (!playerInstance) return;
  
  // Setup impression tracking
  playerInstance.on('play', (additionalInfo: any) => {
    if (additionalInfo.mediaSourceType === 'preRoll' || 
        additionalInfo.mediaSourceType === 'midRoll' || 
        additionalInfo.mediaSourceType === 'postRoll') {
      // Track ad impression start
      console.log(`Ad impression started: ${additionalInfo.mediaSourceType}`);
      // In production, send to analytics service
    }
  });
  
  // Setup completion tracking
  playerInstance.on('ended', (additionalInfo: any) => {
    if (additionalInfo.mediaSourceType === 'preRoll' || 
        additionalInfo.mediaSourceType === 'midRoll' || 
        additionalInfo.mediaSourceType === 'postRoll') {
      // Track ad impression complete
      console.log(`Ad impression completed: ${additionalInfo.mediaSourceType}`);
      // In production, send to analytics service
    }
  });
  
  return playerInstance;
}