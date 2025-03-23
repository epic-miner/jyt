// Advanced Ad Configuration for Fluid Player
// This utility provides optimized ad configurations that can be used throughout the application

// VAST tag types for different ad networks
export enum AdNetwork {
  GOOGLE_ADS = 'google_ads',
  SPOTX = 'spotx',
  ADITION = 'adition',
  CUSTOM = 'custom'
}

// Ad roll types
export enum AdRollType {
  PRE_ROLL = 'preRoll',
  MID_ROLL = 'midRoll',
  POST_ROLL = 'postRoll',
  ON_PAUSE = 'onPauseRoll'
}

// Non-linear ad sizes
export enum NonLinearAdSize {
  SIZE_468x60 = '468x60',
  SIZE_300x250 = '300x250',
  SIZE_728x90 = '728x90'
}

// Non-linear ad vertical alignment
export enum NonLinearVAlign {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom'
}

// Interface for a basic ad configuration
export interface AdConfig {
  roll: AdRollType;
  vastTag: string;
  adText?: string;
  adClickable?: boolean;
  adTextPosition?: 'top right' | 'top left' | 'bottom right' | 'bottom left';
  fallbackVastTags?: string[]; // Backup tags if primary fails
}

// Extended interface for mid-roll ads that require timing
export interface MidRollAdConfig extends AdConfig {
  roll: AdRollType.MID_ROLL;
  timer: number; // Time in seconds when the ad should play
}

// Extended interface for non-linear ads (banners, overlays)
export interface NonLinearAdConfig extends AdConfig {
  roll: AdRollType.ON_PAUSE;
  vAlign?: NonLinearVAlign;
  size?: NonLinearAdSize;
  nonLinearDuration?: number; // Duration to show the ad in seconds
}

// All possible ad configuration types
export type FluidPlayerAdConfig = AdConfig | MidRollAdConfig | NonLinearAdConfig;

// Interface for the VAST options configuration
export interface VastOptionsConfig {
  allowVPAID?: boolean;
  adText?: string;
  adTextPosition?: 'top right' | 'top left' | 'bottom right' | 'bottom left';
  skipButtonCaption?: string;
  skipButtonClickCaption?: string;
  adCTAText?: string | boolean;
  adCTATextPosition?: 'top right' | 'top left' | 'bottom right' | 'bottom left';
  adCTATextVast?: boolean;
  adClickable?: boolean;
  showProgressbarMarkers?: boolean;
  vastTimeout?: number;
  maxAllowedVastTagRedirects?: number;
  showPlayButton?: boolean;
  adList: FluidPlayerAdConfig[];
  vastAdvanced?: {
    vastLoadedCallback?: () => void;
    noVastVideoCallback?: () => void;
    vastVideoSkippedCallback?: () => void;
    vastVideoEndedCallback?: () => void;
  };
}

/**
 * Generates a Google AdSense VAST tag URL with dynamic parameters
 * 
 * @param adUnitPath - The ad unit path (e.g., "/124319096/external/single_ad_samples")
 * @param adType - The ad type identifier (e.g., "linear", "skippablelinear", "nonlinear")
 * @param customParams - Additional custom parameters to add to the tag
 * @returns A properly formatted VAST tag URL
 */
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

  return `https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=${adUnitPath}&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3D${adType}${customParamsString ? '%26' + customParamsString : ''}&correlator=${timestamp}`;
}

/**
 * Create an optimized configuration for pre-roll ads
 * 
 * @param vastTag - The VAST tag URL or identifier
 * @param options - Additional configuration options
 * @returns Pre-roll ad configuration object
 */
export function createPreRollAd(
  vastTag: string,
  options: Partial<AdConfig> = {}
): AdConfig {
  return {
    roll: AdRollType.PRE_ROLL,
    vastTag,
    adClickable: true,
    ...options
  };
}

/**
 * Create an optimized configuration for mid-roll ads
 * 
 * @param vastTag - The VAST tag URL
 * @param timeInSeconds - Time in seconds when the ad should play
 * @param options - Additional configuration options
 * @returns Mid-roll ad configuration object
 */
export function createMidRollAd(
  vastTag: string,
  timeInSeconds: number,
  options: Partial<Omit<MidRollAdConfig, 'roll' | 'timer'>> = {}
): MidRollAdConfig {
  return {
    roll: AdRollType.MID_ROLL,
    vastTag,
    timer: timeInSeconds,
    adClickable: true,
    ...options
  };
}

/**
 * Create an optimized configuration for post-roll ads
 * 
 * @param vastTag - The VAST tag URL
 * @param options - Additional configuration options
 * @returns Post-roll ad configuration object
 */
export function createPostRollAd(
  vastTag: string,
  options: Partial<AdConfig> = {}
): AdConfig {
  return {
    roll: AdRollType.POST_ROLL,
    vastTag,
    adClickable: true,
    ...options
  };
}

/**
 * Create an optimized configuration for on-pause (non-linear) ads
 * 
 * @param vastTag - The VAST tag URL
 * @param options - Additional configuration options
 * @returns On-pause ad configuration object
 */
export function createOnPauseAd(
  vastTag: string,
  options: Partial<Omit<NonLinearAdConfig, 'roll'>> = {}
): NonLinearAdConfig {
  return {
    roll: AdRollType.ON_PAUSE,
    vastTag,
    vAlign: NonLinearVAlign.BOTTOM,
    size: NonLinearAdSize.SIZE_728x90,
    nonLinearDuration: 10,
    adClickable: true,
    ...options
  };
}

/**
 * Creates a complete VAST options configuration for Fluid Player
 * 
 * @param adList - Array of ad configurations
 * @param options - Additional VAST options
 * @returns Complete VAST options configuration object
 */
export function createVastOptions(
  adList: FluidPlayerAdConfig[],
  options: Partial<Omit<VastOptionsConfig, 'adList'>> = {}
): VastOptionsConfig {
  return {
    allowVPAID: true,
    adText: 'Advertisement',
    adTextPosition: 'top right',
    skipButtonCaption: 'Skip ad in [seconds]',
    skipButtonClickCaption: 'Skip Ad',
    adCTAText: 'Learn More',
    adCTATextPosition: 'bottom right',
    adClickable: true,
    showProgressbarMarkers: true,
    vastTimeout: 10000, // 10 seconds timeout for VAST tag loading
    maxAllowedVastTagRedirects: 3, // Limit redirects for performance
    adList,
    ...options
  };
}

/**
 * Creates a default ad configuration setup with all ad types
 * Useful for testing or as a starting point
 * 
 * @returns Complete VAST options with various ad types
 */
export function createDefaultAdConfiguration(): VastOptionsConfig {
  // Create test vast tags
  const preRollTag = createGoogleVastTag('/124319096/external/single_ad_samples', 'linear');
  const midRollTag = createGoogleVastTag('/124319096/external/single_ad_samples', 'skippablelinear');
  const postRollTag = createGoogleVastTag('/124319096/external/single_ad_samples', 'linear');
  const onPauseTag = createGoogleVastTag('/124319096/external/single_ad_samples', 'nonlinear');

  // Create ad list
  const adList: FluidPlayerAdConfig[] = [
    createPreRollAd(preRollTag),
    createMidRollAd(midRollTag, 300), // 5 minutes in
    createPostRollAd(postRollTag),
    createOnPauseAd(onPauseTag, {
      size: NonLinearAdSize.SIZE_728x90,
      vAlign: NonLinearVAlign.BOTTOM
    })
  ];

  // Create the complete configuration
  return createVastOptions(adList, {
    vastAdvanced: {
      vastLoadedCallback: () => {
        console.log('VAST ad loaded successfully');
      },
      noVastVideoCallback: () => {
        console.log('No VAST ad available, playing content');
      },
      vastVideoSkippedCallback: () => {
        console.log('VAST ad was skipped by user');
      },
      vastVideoEndedCallback: () => {
        console.log('VAST ad playback completed');
      }
    }
  });
}

// Helper to create frequency-capped ads (limiting how often ads appear)
export function createFrequencyCappedAds(
  vastTag: string,
  options: {
    preRoll?: boolean;
    midRollFrequency?: number; // Minutes between mid-roll ads
    postRoll?: boolean;
    maxMidRolls?: number;
    videoDuration?: number;
  } = {}
): FluidPlayerAdConfig[] {
  const {
    preRoll = true,
    midRollFrequency = 10, // Default every 10 minutes
    postRoll = true,
    maxMidRolls = 3,
    videoDuration = 60 // Default assumed 60 minutes
  } = options;

  const adConfigs: FluidPlayerAdConfig[] = [];

  // Add pre-roll if requested
  if (preRoll) {
    adConfigs.push(createPreRollAd(vastTag));
  }

  // Calculate and add mid-rolls based on frequency and max count
  if (midRollFrequency > 0 && maxMidRolls > 0) {
    const midRollCount = Math.min(
      maxMidRolls,
      Math.floor(videoDuration / (midRollFrequency * 60))
    );

    // Add mid-roll ads at specified frequency
    for (let i = 1; i <= midRollCount; i++) {
      const timeInSeconds = i * midRollFrequency * 60;
      adConfigs.push(createMidRollAd(vastTag, timeInSeconds));
    }
  }

  // Add post-roll if requested
  if (postRoll) {
    adConfigs.push(createPostRollAd(vastTag));
  }

  return adConfigs;
}