// Fluid Player type definitions

declare global {
  interface Window {
    fluidPlayer: (id: string | HTMLVideoElement, options?: FluidPlayerOptions) => FluidPlayerInstance;
  }
}

export interface FluidPlayerOptions {
  layoutControls?: {
    primaryColor?: string;
    fillToContainer?: boolean;
    posterImage?: string;
    posterImageSize?: 'auto' | 'cover' | 'contain';
    playButtonShowing?: boolean;
    playPauseAnimation?: boolean;
    autoPlay?: boolean;
    mute?: boolean;
    keyboardControl?: boolean;
    loop?: boolean;
    allowDownload?: boolean;
    playbackRateEnabled?: boolean;
    allowTheatre?: boolean;
    controlBar?: {
      autoHide?: boolean;
      autoHideTimeout?: number;
      animated?: boolean;
    };
    contextMenu?: {
      controls?: boolean;
      links?: Array<{
        href: string;
        label: string;
      }>;
    };
    logo?: {
      imageUrl: string | null;
      position?: 'top left' | 'top right' | 'bottom left' | 'bottom right';
      clickUrl?: string | null;
      opacity?: number;
      mouseOverImageUrl?: string | null;
      imageMargin?: string;
      hideWithControls?: boolean;
      showOverAds?: boolean;
    };
    miniPlayer?: {
      enabled?: boolean;
      width?: number;
      height?: number;
      widthMobile?: number;
      placeholderText?: string;
      position?: string;
      autoToggle?: boolean;
    };
    htmlOnPauseBlock?: {
      html: string | null;
      height?: number | null;
      width?: number | null;
    };
    theatreAdvanced?: {
      theatreElement?: string;
      classToApply?: string;
    };
    persistentSettings?: {
      volume?: boolean;
      quality?: boolean;
      speed?: boolean;
      theatre?: boolean;
    };
    controlForwardBackward?: {
      show?: boolean;
      doubleTapMobile?: boolean;
    };
    captions?: {
      play?: string;
      pause?: string;
      mute?: string;
      unmute?: string;
      fullscreen?: string;
      exitFullscreen?: string;
    };
    showCardBoardView?: boolean;
    roundedCorners?: number;
    autoRotateFullScreen?: boolean;
  };
  vastOptions?: {
    adList?: Array<any>;
    adClickable?: boolean;
    showProgressbarMarkers?: boolean;
    adCTAText?: boolean | string;
    adCTATextPosition?: string;
    vastTimeout?: number;
    vastAdvanced?: {
      vastLoadedCallback?: () => void;
      noVastVideoCallback?: () => void;
      vastVideoSkippedCallback?: () => void;
      vastVideoEndedCallback?: () => void;
    };
  };
  modules?: {
    configureDash?: (options: any) => any;
    onBeforeInitDash?: (dash: any) => void;
    onAfterInitDash?: (dash: any) => void;
    configureHls?: (options: any) => any;
    onBeforeInitHls?: (hls: any) => void;
    onAfterInitHls?: (hls: any) => void;
  };
  captions?: {
    play?: string;
    pause?: string;
    mute?: string;
    unmute?: string;
    fullscreen?: string;
    exitFullscreen?: string;
  };
}

export interface FluidPlayerInstance {
  play: () => void;
  pause: () => void;
  skipTo: (seconds: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleFullScreen: (shouldToggle?: boolean) => void;
  toggleMiniPlayer: (shouldToggle?: boolean) => void;
  destroy: () => void;
  dashInstance: () => any | null;
  hlsInstance: () => any | null;
  on: (event: string, callback: (eventInfo?: any, additionalInfo?: any) => void) => boolean;
}

export interface PlayerEventInfo {
  type?: string;
  mediaSourceType?: 'source' | 'preRoll' | 'midRoll' | 'postRoll';
}

export interface MiniPlayerToggleEvent extends CustomEvent {
  detail: {
    isToggledOn: boolean;
  };
}