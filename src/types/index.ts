// Emulator state type
export interface EmulatorState {
  isPlaying: boolean;
  isPaused: boolean;
  loadedFile: File | null;
  volume: number;
  crt: CrtSettings;
  fps: number;
  showSettings: boolean;
  showFpsMonitor: boolean;
  currentSettingsTab: string;
  currentTabPlayer: number;
  mappings: {
    [player: number]: KeyMapping;
  };
  toasts: Toast[];
}

// CRT settings type
export interface CrtSettings {
  brightness: number;
  contrast: number;
  scanlines: boolean;
  blur: boolean;
  noise: boolean;
  distortion: boolean;
  rgb: boolean;
  vignette: boolean;
  colorMode: 'color' | 'grayscale';
}

// Key mapping type
export interface KeyMapping {
  [action: string]: string;
}

// Toast type
export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

// Gamepad type
export interface GamepadInfo {
  index: number;
  id: string;
}

// Emulator action type
export type EmulatorAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_LOADED_FILE'; payload: File | null }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_CRT'; payload: Partial<CrtSettings> }
  | { type: 'SET_FPS'; payload: number }
  | { type: 'SET_FPS_MONITOR'; payload: boolean }
  | { type: 'TOGGLE_SETTINGS'; payload: boolean }
  | { type: 'SET_SETTINGS_TAB'; payload: string }
  | { type: 'SET_CURRENT_TAB_PLAYER'; payload: number }
  | { type: 'SET_MAPPING'; payload: { player: number; action: string; code: string } }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'RESET_SETTINGS' };