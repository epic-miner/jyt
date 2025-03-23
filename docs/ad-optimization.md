# Ad Optimization for Anime Streaming Platform

This document provides an overview of the ad optimization implementation for the anime streaming platform.

## Overview

Our platform uses Fluid Player's VAST (Video Ad Serving Template) implementation to deliver a customizable and optimized advertising experience. The implementation allows for various ad types and configurations to balance user experience with monetization requirements.

## Key Components

1. **adConfig.ts Utility**
   - Central configuration utility for standardizing ad implementations
   - Provides type-safe interfaces for all ad configurations
   - Includes helper functions to generate optimized ad setups

2. **AdOptimizedFluidPlayer Component**
   - React component that wraps Fluid Player with ad optimization
   - Supports multiple ad configuration presets
   - Handles quality selection, watch history, and playback optimization

3. **Ad Optimization Test Page**
   - Showcase page for demonstrating different ad configurations
   - Allows for side-by-side comparison of ad strategies
   - Provides documentation on implementation details

## Ad Types Supported

The platform supports the following VAST ad types:

1. **Linear Ads**
   - **Pre-roll**: Plays before the main content starts
   - **Mid-roll**: Plays during the main content at specified intervals
   - **Post-roll**: Plays after the main content ends

2. **Non-linear Ads**
   - **Overlay/Banner**: Displays during content playback without interruption
   - **Pause Ads**: Displays when the user pauses the video

## Ad Configuration Presets

We provide several optimized presets to accommodate different monetization strategies:

1. **Default**
   - Complete ad implementation with all ad types
   - Pre-roll, mid-roll, post-roll, and pause ads
   - Maximum monetization potential

2. **Minimal**
   - Reduced ad load with only pre-roll ads
   - No interruptions during content viewing
   - Better for shorter content or improving retention

3. **Frequency-capped**
   - Dynamic ad placement based on content duration
   - Limited number of mid-roll ads
   - Balances viewer experience with monetization

4. **Ad-free**
   - No ads configuration for premium users
   - Maximum viewer satisfaction for paid tiers

## Implementation Details

### VAST Tag Integration

VAST tags are managed through helper functions that create properly formatted URLs with the necessary parameters:

```typescript
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

  return `https://pubads.g.doubleclick.net/gampad/ads?...`;
}
```

### Frequency Capping Implementation

The frequency capping algorithm calculates optimal ad placement based on content duration:

```typescript
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
  // Calculate optimal ad placement
  // ...
}
```

## Testing and Optimization

Ad configurations can be tested and compared at `/ad-optimization` route, which provides an interactive interface for evaluating different strategies.

## Best Practices

1. **Balance Ad Load**
   - Limit total number of ads based on content length
   - Don't place ads too close together

2. **Respect User Experience**
   - Implement skippable ads when possible
   - Consider an ad-free premium tier

3. **Monitor Performance**
   - Track ad completion rates
   - Monitor drop-off points during ads

4. **Optimize Ad Placement**
   - Place mid-roll ads at natural content breaks
   - Test different ad frequencies to find optimal balance

## Integration with Ad Networks

For production use, replace the example VAST tags with actual ad network tags from:

1. Google Ad Manager
2. SpotX
3. FreeWheel
4. Other VAST-compliant ad servers

## Troubleshooting

Common issues and solutions:

1. **Ads not displaying**
   - Verify VAST tag URLs are correct
   - Check for ad blockers
   - Ensure proper CORS headers are set

2. **Poor playback performance**
   - Optimize ad video file sizes
   - Implement ad preloading
   - Consider reducing ad frequency

3. **Tracking issues**
   - Verify impression URLs are accessible
   - Implement fallback tracking mechanisms