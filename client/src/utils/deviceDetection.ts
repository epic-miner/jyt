/**
 * Device detection and performance optimization utilities
 * Used to conditionally render effects and optimizations based on device capabilities
 */

// Performance tiers for different device capabilities
export enum DevicePerformanceTier {
  LOW = 'low',     // Low-end devices, minimal animations, maximum optimizations
  MEDIUM = 'medium', // Mid-range devices, moderate animations, some optimizations
  HIGH = 'high'    // High-end devices, full animations, minimal optimizations
}

// Memory thresholds for determining performance tier (in MB)
const MEMORY_THRESHOLD_LOW = 2048;
const MEMORY_THRESHOLD_HIGH = 4096;

// Battery thresholds
const BATTERY_THRESHOLD_LOW = 0.2; // 20%
const BATTERY_POWER_SAVING_MODE = true;

/**
 * Detects if the current device is a mobile device
 * @returns boolean indicating if the device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'windows phone', 'mobile'];
  
  const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Also check screen size as a fallback
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobile || isSmallScreen;
}

/**
 * Detects if the user has requested reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function shouldReduceAnimations(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check media query for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for low power mode (iOS) or battery saver (Android)
  // Note: There's no direct API for this, so we approximate with battery API
  let isLowPowerMode = false;
  if ('getBattery' in navigator) {
    const nav = navigator as any;
    // We can access battery information to make an educated guess
    nav.getBattery?.().then((battery: any) => {
      isLowPowerMode = battery.level <= BATTERY_THRESHOLD_LOW || battery.charging === false;
    }).catch(() => {
      // Ignore errors with battery API
    });
  }
  
  return prefersReducedMotion || isLowPowerMode;
}

/**
 * Detects device's performance capabilities
 * @returns DevicePerformanceTier based on device capabilities
 */
export function getDevicePerformanceTier(): DevicePerformanceTier {
  // Default to medium tier
  let tier = DevicePerformanceTier.MEDIUM;
  
  // Server-side rendering check
  if (typeof window === 'undefined') return tier;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for obvious low-end device indicators
  const isLowEndDeviceByUA = 
    userAgent.includes('android 4') ||
    userAgent.includes('android 5') ||
    userAgent.includes('android 6') ||
    userAgent.includes('msie') ||
    userAgent.includes('iphone os 9') ||
    userAgent.includes('iphone os 10');
  
  // Check for obvious high-end device indicators
  const isHighEndDeviceByUA =
    userAgent.includes('iphone 13') ||
    userAgent.includes('iphone 14') ||
    userAgent.includes('iphone 15') ||
    userAgent.includes('ipad pro') ||
    userAgent.includes('pixel 6') ||
    userAgent.includes('pixel 7') ||
    userAgent.includes('pixel 8') ||
    userAgent.includes('samsung galaxy s22') ||
    userAgent.includes('samsung galaxy s23') ||
    userAgent.includes('samsung galaxy s24');
  
  // Check device memory if available
  let memoryTier = DevicePerformanceTier.MEDIUM;
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory <= MEMORY_THRESHOLD_LOW / 1024) {
      memoryTier = DevicePerformanceTier.LOW;
    } else if (memory >= MEMORY_THRESHOLD_HIGH / 1024) {
      memoryTier = DevicePerformanceTier.HIGH;
    }
  }
  
  // Check for reduced motion preference
  const prefersReducedMotion = shouldReduceAnimations();
  
  // Check for low battery or power saving mode
  let isPowerConstrained = false;
  if ('getBattery' in navigator) {
    const nav = navigator as any;
    nav.getBattery?.().then((battery: any) => {
      isPowerConstrained = battery.level <= BATTERY_THRESHOLD_LOW && !battery.charging;
    }).catch(() => {
      // Ignore errors with battery API
    });
  }
  
  // Determine tier based on all factors
  if (isLowEndDeviceByUA || isPowerConstrained || prefersReducedMotion) {
    tier = DevicePerformanceTier.LOW;
  } else if (isHighEndDeviceByUA && memoryTier !== DevicePerformanceTier.LOW) {
    tier = DevicePerformanceTier.HIGH;
  } else {
    tier = memoryTier;
  }
  
  return tier;
}

/**
 * Get scroll optimization settings based on device capabilities
 * @returns Object with scroll optimization settings
 */
export function getScrollOptimizationSettings() {
  const tier = getDevicePerformanceTier();
  const isMobile = isMobileDevice();
  
  // Default settings for medium tier
  let settings = {
    lazyLoadDistance: 300, // Load content 300px before it enters viewport
    enableAnimations: true, // Enable animations
    enableParallax: true, // Enable parallax effects
    enableShadows: true, // Enable complex shadows
    complexBackgrounds: true, // Enable complex backgrounds
    imageQuality: 'medium' as 'low' | 'medium' | 'high', // Image quality
    particleCount: 50, // Number of particles
    throttleScroll: false, // Throttle scroll events
    debounceDelay: 100, // Debounce delay in ms
    useGPU: true, // Use GPU acceleration
  };
  
  // Adjust based on performance tier
  if (tier === DevicePerformanceTier.LOW) {
    settings = {
      ...settings,
      lazyLoadDistance: isMobile ? 100 : 200, // Load content closer to viewport on mobile
      enableAnimations: false, // Disable animations
      enableParallax: false, // Disable parallax
      enableShadows: false, // Disable complex shadows
      complexBackgrounds: false, // Disable complex backgrounds
      imageQuality: 'low', // Lower image quality
      particleCount: 10, // Fewer particles
      throttleScroll: true, // Throttle scroll events
      debounceDelay: 200, // Longer debounce delay
      useGPU: false, // Don't force GPU acceleration
    };
  } else if (tier === DevicePerformanceTier.HIGH) {
    settings = {
      ...settings,
      lazyLoadDistance: 500, // Load content further from viewport
      enableAnimations: true, // Enable all animations
      enableParallax: true, // Enable parallax
      enableShadows: true, // Enable complex shadows
      complexBackgrounds: true, // Enable complex backgrounds
      imageQuality: 'high', // Higher image quality
      particleCount: 100, // More particles
      throttleScroll: false, // Don't throttle scroll
      debounceDelay: 50, // Shorter debounce delay
      useGPU: true, // Use GPU acceleration
    };
  }
  
  return settings;
}

/**
 * Get adaptive image quality based on device capabilities
 * @returns Image quality level for loading optimized images
 */
export function getAdaptiveImageQuality(): 'low' | 'medium' | 'high' {
  const tier = getDevicePerformanceTier();
  
  switch (tier) {
    case DevicePerformanceTier.LOW:
      return 'low';
    case DevicePerformanceTier.MEDIUM:
      return 'medium';
    case DevicePerformanceTier.HIGH:
      return 'high';
    default:
      return 'medium';
  }
}