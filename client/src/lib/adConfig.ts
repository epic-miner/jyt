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


export const adConfigurations = {
  none: {
    adList: [],
  }
};