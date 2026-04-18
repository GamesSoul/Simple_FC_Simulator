import { useRef, useCallback, useEffect, useState } from 'react';
import { EmulatorProvider, useEmulator, useEmulatorAction } from '../context/EmulatorContext';
import { Browser, Controller } from 'jsnes';
import Header from '../components/Header';
import StatusBar from '../components/StatusBar';
import ControlBar from '../components/ControlBar';
import SettingsModal from '../components/SettingsModal';
import ToastContainer from '../components/ToastContainer';
import PerformanceMonitor from '../components/PerformanceMonitor';

// 将键盘 code 转换为 keyCode 的函数
const codeToKeyCode = (code: string): number => {
  // 字母键 (KeyA -> 65)
  if (code.startsWith('Key')) {
    return code.charCodeAt(3);
  }
  // 方向键
  if (code.startsWith('Arrow')) {
    const arrowMap: Record<string, number> = {
      'ArrowUp': 38,
      'ArrowDown': 40,
      'ArrowLeft': 37,
      'ArrowRight': 39,
    };
    return arrowMap[code];
  }
  // 数字键 (Digit0 -> 48)
  if (code.startsWith('Digit')) {
    return 48 + parseInt(code.charAt(5));
  }
  // 功能键
  const keyMap: Record<string, number> = {
    'Enter': 13,
    'Space': 32,
    'ShiftLeft': 16,
    'ShiftRight': 16,
    'ControlLeft': 17,
    'ControlRight': 17,
    'AltLeft': 18,
    'AltRight': 18,
    'Tab': 9,
    'Escape': 27,
    'Backspace': 8,
    'CapsLock': 20,
    'NumLock': 144,
    'ScrollLock': 145,
    'Pause': 19,
    'Insert': 45,
    'Delete': 46,
    'Home': 36,
    'End': 35,
    'PageUp': 33,
    'PageDown': 34,
    'PrintScreen': 44,
    // 小键盘
    'Numpad0': 96,
    'Numpad1': 97,
    'Numpad2': 98,
    'Numpad3': 99,
    'Numpad4': 100,
    'Numpad5': 101,
    'Numpad6': 102,
    'Numpad7': 103,
    'Numpad8': 104,
    'Numpad9': 105,
    'NumpadAdd': 107,
    'NumpadSubtract': 109,
    'NumpadMultiply': 106,
    'NumpadDivide': 111,
    'NumpadDecimal': 110,
    'NumpadEnter': 108,
    // 标点符号
    'Semicolon': 186,
    'Equal': 187,
    'Comma': 188,
    'Minus': 189,
    'Period': 190,
    'Slash': 191,
    'Backquote': 192,
    'BracketLeft': 219,
    'Backslash': 220,
    'BracketRight': 221,
    'Quote': 222,
  };
  return keyMap[code] || code.charCodeAt(0);
};

// 将 mappings 转换为 jsnes 期望的键位格式
const mappingsToJsnesKeys = (mappings: any) => {
  const keys: any = {};
  const buttonMap: Record<string, number> = {
    'Up': Controller.BUTTON_UP,
    'Down': Controller.BUTTON_DOWN,
    'Left': Controller.BUTTON_LEFT,
    'Right': Controller.BUTTON_RIGHT,
    'A': Controller.BUTTON_A,
    'B': Controller.BUTTON_B,
    'Select': Controller.BUTTON_SELECT,
    'Start': Controller.BUTTON_START,
    'A连发': Controller.BUTTON_TURBO_A,
    'B连发': Controller.BUTTON_TURBO_B,
  };
  
  for (let player = 1; player <= 2; player++) {
    const playerMappings = mappings[player];
    if (playerMappings) {
      for (const action in playerMappings) {
        const code = playerMappings[action];
        const button = buttonMap[action];
        if (button !== undefined && code) {
          const keyCode = codeToKeyCode(code);
          keys[keyCode] = [player, button, code];
        }
      }
    }
  }
  return keys;
};

function EmulatorJsContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useEmulator();
  const { setPlaying, setPaused, showToast, setLoadedFile } = useEmulatorAction();
  const browserRef = useRef<Browser | null>(null);
  const [keyboardController, setKeyboardController] = useState<any>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Initialize jsnes browser
  useEffect(() => {
    if (containerRef.current) {
      // Create jsnes browser instance
      const browser = new Browser({
        container: containerRef.current,
      });
      browserRef.current = browser;
      
      // Set keys from context mappings
      if (browser.keyboard) {
        const keys = mappingsToJsnesKeys(state.mappings);
        browser.keyboard.setKeys(keys);
        setKeyboardController(browser.keyboard);
      }

      // Find and store the canvas element created by Browser
      setTimeout(() => {
        const canvas = containerRef.current?.querySelector('canvas');
        if (canvas) {
          setCanvasElement(canvas);
        }
      }, 100);

      // Clean up on unmount
      return () => {
        browser.destroy();
      };
    }
  }, []);

  // 当 mappings 变化时更新键位
  useEffect(() => {
    if (keyboardController) {
      const keys = mappingsToJsnesKeys(state.mappings);
      keyboardController.setKeys(keys);
    }
  }, [state.mappings, keyboardController]);

  // Apply CRT effects to the canvas
  useEffect(() => {
    if (canvasElement) {
      // Add/remove grayscale class based on color mode
      if (state.crt.colorMode === 'grayscale') {
        canvasElement.classList.add('grayscale');
      } else {
        canvasElement.classList.remove('grayscale');
      }
      
      // Make sure canvas fills the container
      canvasElement.style.width = '100%';
      canvasElement.style.height = '100%';
      
      // Enable hardware acceleration
      canvasElement.style.transform = 'translateZ(0)';
      canvasElement.style.willChange = 'transform';
      
      // Optimize canvas rendering
      canvasElement.style.imageRendering = 'pixelated';
      canvasElement.style.backfaceVisibility = 'hidden';
    }
  }, [state.crt.colorMode, canvasElement]);

  // Handle pause/resume
  useEffect(() => {
    if (browserRef.current) {
      // jsnes doesn't have a built-in pause method
      // We'll handle this through the UI for now
    }
  }, [state.isPaused]);

  const handleReset = useCallback(() => {
    if (!state.loadedFile) {
      showToast('请先导入游戏文件');
      return;
    }
    if (browserRef.current?.nes) {
      // Use jsnes API to reset the game
      browserRef.current.nes.reset();
      // 清空加载的文件
      setLoadedFile(null);
      showToast('模拟器已重置，可以导入新的游戏文件');
    }
  }, [setLoadedFile, showToast, state.loadedFile]);

  const handlePlay = useCallback(() => {
    if (isButtonDisabled) return;
    if (!state.loadedFile) {
      showToast('请先导入游戏文件');
      return;
    }
    setIsButtonDisabled(true);
    if (browserRef.current) {
      // Use jsnes API to start the game
      browserRef.current.start();
      setPlaying(true);
      setPaused(false); // 点击启动时取消暂停状态
    }
    setTimeout(() => setIsButtonDisabled(false), 500);
  }, [setPlaying, setPaused, showToast, state.loadedFile, isButtonDisabled, setIsButtonDisabled]);

  const handlePause = useCallback(() => {
    if (isButtonDisabled) return;
    if (!state.loadedFile) {
      showToast('请先导入游戏文件');
      return;
    }
    setIsButtonDisabled(true);
    if (browserRef.current) {
      // Use jsnes API to stop the game
      browserRef.current.stop();
      setPaused(true);
    }
    setTimeout(() => setIsButtonDisabled(false), 500);
  }, [setPaused, showToast, state.loadedFile, isButtonDisabled, setIsButtonDisabled]);

  const initAudio = useCallback(() => {
    // jsnes handles audio internally
  }, []);

  const getNESCore = useCallback(() => {
    // Return a dummy object that matches the expected interface
    return {
      loadROM: async (romData: string) => {
        if (browserRef.current) {
          browserRef.current.loadROM(romData);
          return { success: true };
        }
        return { success: false, error: 'Browser not initialized' };
      },
      isROMLoaded: () => true,
    };
  }, []);

  const NESCoreClass = {
    fileToBinaryString: (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            const bytes = new Uint8Array(reader.result);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            resolve(binary);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });
    },
  };

  // 键位修改逻辑
  const startKeyCapture = useCallback((callback: (code: string) => void) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      callback(e.code);
      window.removeEventListener('keydown', handleKeyDown);
    };
    window.addEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative bg-gray-900">
        <StatusBar />
        <div className="crt-container group">
          <div 
            ref={containerRef} 
            className="w-full h-full"
          />
          {/* Default screen when no ROM is loaded */}
          {!state.loadedFile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
              <div className="text-center">
                <i className="fa-solid fa-gamepad text-red-500 text-6xl mb-6"></i>
                <h3 className="text-white text-2xl font-bold mb-4">红vs白 nes模拟器</h3>
                <p className="text-gray-400 mb-6">请导入 .nes 文件开始游戏</p>
                <div className="flex gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold">P1</span>
                    <span className="text-gray-400 text-xs">WASD - 方向</span>
                    <span className="text-gray-400 text-xs">J/K - A/B</span>
                    <span className="text-gray-400 text-xs">U/I - A/B连发</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold">P2</span>
                    <span className="text-gray-400 text-xs">方向键 - 方向</span>
                    <span className="text-gray-400 text-xs">F/G - A/B</span>
                    <span className="text-gray-400 text-xs">V/B - A/B连发</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Pause overlay */}
          {state.loadedFile && state.isPaused && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-20">
              <div className="text-center">
                <i className="fa-solid fa-pause-circle text-yellow-400 text-6xl mb-6"></i>
                <h3 className="text-white text-3xl font-bold mb-4">游戏暂停中</h3>
                <p className="text-gray-300">点击开始按钮继续游戏</p>
              </div>
            </div>
          )}
          {/* CRT Effects Overlays */}
          {state.crt.scanlines && <div className="crt-overlay scanlines" />}
          {state.crt.vignette && <div className="crt-overlay vignette" />}
          {state.crt.noise && <div className="crt-overlay flicker" />}
          {state.crt.distortion && <div className="crt-overlay distortion" />}
          {state.crt.blur && <div className="crt-overlay blur" />}
          {state.crt.rgb && <div className="crt-overlay rgb" />}
        </div>
        <ControlBar 
          onReset={handleReset} 
          onPlay={handlePlay}
          onPause={handlePause}
          initAudio={initAudio}
          getNESCore={getNESCore}
          NESCoreClass={NESCoreClass as any}
          isFileLoaded={!!state.loadedFile}
          isButtonDisabled={isButtonDisabled}
        />
      </main>

      <SettingsModal startKeyCapture={startKeyCapture} keyboardController={keyboardController} />
      <ToastContainer />
      <PerformanceMonitor />
    </div>
  );
}

export default function EmulatorJsPage() {
  return (
    <EmulatorProvider>
      <EmulatorJsContent />
    </EmulatorProvider>
  );
}
