/**
 * Device Detection Utility
 * 
 * Provides functions for:
 * - Detecting device type (mobile, tablet, desktop)
 * - Determining device performance capabilities
 * - Optimizing rendering based on device performance
 * - Adapting image quality based on device
 * - Detecting reduced motion preferences
 */

// Performance tiers for different devices
export enum DevicePerformanceTier {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Detects if the current device is a mobile device
 * This function uses a combination of user agent detection and screen size checks
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // User agent detection
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Screen size detection (typical mobile devices)
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  
  return mobileRegex.test(userAgent) || screenWidth <= 768;
};

/**
 * Detects if the current device is a tablet
 */
export const isTabletDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || '';
  const tabletRegex = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i;
  
  // Screen size typical for tablets (between mobile and desktop)
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  
  return tabletRegex.test(userAgent.toLowerCase()) || 
         (screenWidth > 768 && screenWidth <= 1024 && 'ontouchstart' in window);
};

/**
 * Detects if the device has low power (e.g., budget phone)
 * This uses various signals to estimate device capabilities
 */
export const isLowPowerDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check available CPU cores - fewer cores often indicates a budget device
  const cpuCores = navigator.hardwareConcurrency || 0;
  
  // Check if device memory API is available (Chrome)
  const lowMemory = (navigator as any).deviceMemory !== undefined ? 
    (navigator as any).deviceMemory < 4 : false;
    
  // Check if the device might be older based on GPU blacklisting or other signals
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for connection speed as a proxy for device quality
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  
  const slowConnection = connection ? 
    (connection.effectiveType === 'slow-2g' || 
     connection.effectiveType === '2g' || 
     connection.saveData === true) : false;
  
  // Combine signals to determine if it's likely a lower-power device
  return (cpuCores <= 4 || lowMemory || slowConnection || 
         (hasReducedMotion && isMobileDevice()));
};

/**
 * Returns the estimated performance tier for the current device
 */
export const getDevicePerformanceTier = (): DevicePerformanceTier => {
  // On server-side, assume medium tier
  if (typeof window === 'undefined') return DevicePerformanceTier.MEDIUM;
  
  // Cache this value to avoid recalculating
  if (isLowPowerDevice()) {
    return DevicePerformanceTier.LOW;
  }
  
  // Gaming PCs, high-end mobile devices, etc.
  if (isHighPerformanceDevice()) {
    return DevicePerformanceTier.HIGH;
  }
  
  // Mid-range devices (most common)
  return DevicePerformanceTier.MEDIUM;
};

/**
 * Returns recommended scroll optimization settings based on device capability
 */
export const getScrollOptimizationSettings = () => {
  const tier = getDevicePerformanceTier();
  const isMobile = isMobileDevice();
  
  // Default settings (medium tier)
  const settings = {
    throttleScroll: isMobile,
    debounceDelay: 100,
    lazyLoadDistance: 300
  };
  
  // Adjust based on performance tier
  if (tier === DevicePerformanceTier.LOW) {
    return {
      throttleScroll: true,
      debounceDelay: 200, // Longer delay to reduce CPU usage
      lazyLoadDistance: 200 // Shorter distance to reduce elements in DOM
    };
  } else if (tier === DevicePerformanceTier.HIGH) {
    return {
      throttleScroll: isMobile, // Only throttle on mobile even for high-end
      debounceDelay: 50, // Faster response on high-end devices
      lazyLoadDistance: 600 // Pre-load more content on high-end devices
    };
  }
  
  return settings;
};

/**
 * Returns appropriate image quality settings based on device
 */
export const getAdaptiveImageQuality = (): 'low' | 'medium' | 'high' => {
  const tier = getDevicePerformanceTier();
  
  if (tier === DevicePerformanceTier.LOW) {
    return 'low';
  } else if (tier === DevicePerformanceTier.HIGH && !isMobileDevice()) {
    return 'high';
  }
  
  return 'medium';
};

/**
 * Checks if the user has requested reduced motion
 */
export const shouldReduceAnimations = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check OS-level reduced motion setting
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Also reduce animations on low-power devices
  const isLowPower = isLowPowerDevice();
  
  return hasReducedMotion || isLowPower;
};

/**
 * Detects if the device is likely a high-performance device
 */
const isHighPerformanceDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // High core count typically indicates a more powerful device
  const highCpuCores = navigator.hardwareConcurrency >= 8;
  
  // Check for higher device memory (if available)
  const highMemory = (navigator as any).deviceMemory !== undefined ? 
    (navigator as any).deviceMemory >= 8 : false;
  
  // Check for high-resolution display (typically on premium devices)
  const highDpi = window.devicePixelRatio >= 2.5;
  
  // Detect desktop with good specifications
  const isDesktop = !isMobileDevice() && !isTabletDevice();
  
  return (highCpuCores && (highMemory || isDesktop)) || 
         (highDpi && highCpuCores && !isLowPowerDevice());
};

/**
 * Returns the battery level of the device if available
 * This can be used to further optimize for low-battery situations
 */
export const getBatteryLevel = async (): Promise<number | null> => {
  if (typeof window === 'undefined' || !('getBattery' in navigator)) return null;
  
  try {
    const battery = await (navigator as any).getBattery();
    return battery.level;
  } catch (e) {
    return null;
  }
};

/**
 * Returns whether the device is in battery saving mode
 * This can be used to further optimize for power saving
 */
export const isInBatterySaveMode = async (): Promise<boolean | null> => {
  if (typeof window === 'undefined' || 
      !('getBattery' in navigator)) return null;
  
  try {
    const battery = await (navigator as any).getBattery();
    
    // Check for very low battery with power saving likely enabled
    const lowBattery = battery.level <= 0.2 && !battery.charging;
    
    return lowBattery;
  } catch (e) {
    return null;
  }
};

/**
 * Returns optimal animation FPS based on device capability
 * This helps balance smoothness vs battery life
 */
export const getOptimalAnimationFps = (): number => {
  const tier = getDevicePerformanceTier();
  
  if (tier === DevicePerformanceTier.LOW) {
    return 30; // 30fps for low-end devices
  } else if (tier === DevicePerformanceTier.MEDIUM) {
    return 45; // 45fps for mid-range
  } else {
    return 60; // 60fps for high-end
  }
};

/**
 * Checks if device supports WebGL for advanced effects
 */
export const hasWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

/**
 * Determines the optimal particle count for background effects
 * based on device capabilities
 */
export const getOptimalParticleCount = (): number => {
  const tier = getDevicePerformanceTier();
  
  if (tier === DevicePerformanceTier.LOW) {
    return 20; // Minimal particles for low-end devices
  } else if (tier === DevicePerformanceTier.MEDIUM) {
    return 50; // Medium amount for mid-range devices
  } else {
    return 100; // Full effect for high-end devices
  }
};