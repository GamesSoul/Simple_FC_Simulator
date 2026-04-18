import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { EmulatorState, EmulatorAction, CrtSettings, KeyMapping } from '../types';

// Button constants
export const BUTTON_LABELS = ['A', 'B', 'Select', 'Start', 'Up', 'Down', 'Left', 'Right', 'A连发', 'B连发'] as const;
export const BUTTON_DISPLAY_NAMES: { [key: string]: string } = {
  'A': 'A键',
  'B': 'B键',
  'Select': '选择',
  'Start': '开始',
  'Up': '上',
  'Down': '下',
  'Left': '左',
  'Right': '右',
  'A连发': 'A连发',
  'B连发': 'B连发',
};

// Default key mappings
const defaultMappings = {
  1: { 'A': 'KeyJ', 'B': 'KeyK', 'A连发': 'KeyU', 'B连发': 'KeyI', 'Select': 'ShiftLeft', 'Start': 'Enter', 'Up': 'KeyW', 'Down': 'KeyS', 'Left': 'KeyA', 'Right': 'KeyD' },
  2: { 'A': 'KeyF', 'B': 'KeyG', 'A连发': 'KeyV', 'B连发': 'KeyB', 'Select': 'KeyR', 'Start': 'KeyT', 'Up': 'ArrowUp', 'Down': 'ArrowDown', 'Left': 'ArrowLeft', 'Right': 'ArrowRight' },
};

// Initial state
const initialState: EmulatorState = {
  isPlaying: false,
  isPaused: false,
  loadedFile: null,
  volume: 0.7,
  crt: {
    brightness: 1.0,
    contrast: 1.0,
    scanlines: true,
    blur: false,
    noise: true,
    distortion: true,
    rgb: false,
    vignette: true,
    colorMode: 'color',
  },
  fps: 0,
  showSettings: false,
  showFpsMonitor: false,
  currentSettingsTab: 'tab-input',
  currentTabPlayer: 1,
  mappings: defaultMappings as { [player: number]: KeyMapping },
  toasts: [],
};

// Reducer
function emulatorReducer(state: EmulatorState, action: EmulatorAction): EmulatorState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };
    case 'SET_LOADED_FILE':
      return { ...state, loadedFile: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_CRT':
      return { ...state, crt: { ...state.crt, ...action.payload } };
    case 'SET_FPS':
      return { ...state, fps: action.payload };
    case 'SET_FPS_MONITOR':
      return { ...state, showFpsMonitor: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: action.payload };
    case 'SET_SETTINGS_TAB':
      return { ...state, currentSettingsTab: action.payload };
    case 'SET_CURRENT_TAB_PLAYER':
      return { ...state, currentTabPlayer: action.payload };
    case 'SET_MAPPING':
      return {
        ...state,
        mappings: {
          ...state.mappings,
          [action.payload.player]: {
            ...state.mappings[action.payload.player],
            [action.payload.action]: action.payload.code,
          },
        },
      };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(toast => toast.id !== action.payload) };
    case 'RESET_SETTINGS':
      return {
        ...state,
        volume: 0.7,
        crt: {
          brightness: 1.0,
          contrast: 1.0,
          scanlines: true,
          blur: false,
          noise: true,
          distortion: true,
          rgb: false,
          vignette: true,
          colorMode: 'color',
        },
        mappings: defaultMappings as { [player: number]: KeyMapping },
      };
    default:
      return state;
  }
}

// Context types
interface EmulatorContextType {
  state: EmulatorState;
  dispatch: React.Dispatch<EmulatorAction>;
}

interface EmulatorActionContextType {
  setPlaying: (playing: boolean) => void;
  setPaused: (paused: boolean) => void;
  setLoadedFile: (file: File | null) => void;
  setVolume: (volume: number) => void;
  setCrt: (crt: Partial<CrtSettings>) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;
  toggleSettings: (show: boolean) => void;
  setSettingsTab: (tab: string) => void;
  setCurrentTabPlayer: (player: number) => void;
  setMapping: (player: number, action: string, code: string) => void;
  setFpsMonitor: (show: boolean) => void;
  resetSettings: () => void;
}

// Create contexts
const EmulatorContext = createContext<EmulatorContextType | undefined>(undefined);
const EmulatorActionContext = createContext<EmulatorActionContextType | undefined>(undefined);

// Provider component
interface EmulatorProviderProps {
  children: ReactNode;
}

export function EmulatorProvider({ children }: EmulatorProviderProps) {
  const [state, dispatch] = useReducer(emulatorReducer, initialState);

  // Action creators
  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    dispatch({ type: 'SET_PAUSED', payload: paused });
  }, []);

  const setLoadedFile = useCallback((file: File | null) => {
    dispatch({ type: 'SET_LOADED_FILE', payload: file });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const setCrt = useCallback((crt: Partial<CrtSettings>) => {
    dispatch({ type: 'SET_CRT', payload: crt });
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const toggleSettings = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_SETTINGS', payload: show });
  }, []);

  const setSettingsTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_SETTINGS_TAB', payload: tab });
  }, []);

  const setCurrentTabPlayer = useCallback((player: number) => {
    dispatch({ type: 'SET_CURRENT_TAB_PLAYER', payload: player });
  }, []);

  const setMapping = useCallback((player: number, action: string, code: string) => {
    dispatch({ type: 'SET_MAPPING', payload: { player, action, code } });
  }, []);

  const setFpsMonitor = useCallback((show: boolean) => {
    dispatch({ type: 'SET_FPS_MONITOR', payload: show });
  }, []);

  const resetSettings = useCallback(() => {
    dispatch({ type: 'RESET_SETTINGS' });
  }, []);

  const actionValue = {
    setPlaying,
    setPaused,
    setLoadedFile,
    setVolume,
    setCrt,
    showToast,
    removeToast,
    toggleSettings,
    setSettingsTab,
    setCurrentTabPlayer,
    setMapping,
    setFpsMonitor,
    resetSettings,
  };

  return (
    <EmulatorContext.Provider value={{ state, dispatch }}>
      <EmulatorActionContext.Provider value={actionValue}>
        {children}
      </EmulatorActionContext.Provider>
    </EmulatorContext.Provider>
  );
}

// Custom hooks
export function useEmulator() {
  const context = useContext(EmulatorContext);
  if (context === undefined) {
    throw new Error('useEmulator must be used within an EmulatorProvider');
  }
  return context;
}

export function useEmulatorAction() {
  const context = useContext(EmulatorActionContext);
  if (context === undefined) {
    throw new Error('useEmulatorAction must be used within an EmulatorProvider');
  }
  return context;
}