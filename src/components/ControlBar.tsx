import { memo, useRef, useCallback } from 'react';
import { useEmulator, useEmulatorAction } from '../context/EmulatorContext';

interface NESCoreLike {
  fileToBinaryString: (file: File) => Promise<string>;
}

interface NESCoreInstance {
  loadROM: (romData: string) => Promise<any>;
  isROMLoaded: () => boolean;
}

/**
 * Control bar with file import, play/pause/reset buttons.
 * Reads NES ROM files as binary data and loads into jsnes.
 */
function ControlBar({ 
  onReset, 
  onPlay, 
  onPause, 
  initAudio, 
  getNESCore, 
  NESCoreClass, 
  isFileLoaded,
  isButtonDisabled
}: { 
  onReset: () => void; 
  onPlay?: () => void;
  onPause?: () => void;
  initAudio: () => void;
  getNESCore: () => NESCoreInstance;
  NESCoreClass: NESCoreLike;
  isFileLoaded: boolean;
  isButtonDisabled: boolean;
}) {
  const { state } = useEmulator();
  const { setPlaying, setPaused, showToast, setLoadedFile } = useEmulatorAction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startAudioContext = useCallback(() => {
    if (initAudio) {
      initAudio();
    }
  }, [initAudio]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startAudioContext();
    const ext = file.name.split('.').pop()?.toLowerCase();
    showToast(`正在加载 ${file.name}...`);

    try {
      if (ext === 'nes') {
        const nes = getNESCore();
        const romData = await NESCoreClass.fileToBinaryString(file);

        const result = await nes.loadROM(romData);

        if (result.success) {
          setLoadedFile(file);
          setPlaying(true);
          showToast(`${file.name} 加载成功！`, 'success');
        } else {
          showToast(`ROM 加载失败: ${result.error || '未知错误'}`, 'error');
        }
      } else {
        showToast(`不支持的文件格式: .${ext}`, 'error');
      }
    } catch (err) {
      console.error('File load error:', err);
      showToast(`文件读取失败: ${err instanceof Error ? err.message : '未知错误'}`, 'error');
    }
  };

  const handlePlay = () => {
    if (isButtonDisabled) return;
    const nes = getNESCore();
    if (!state.loadedFile && !nes.isROMLoaded()) {
      showToast('请先导入游戏文件', 'error');
      return;
    }
    startAudioContext();
    if (onPlay) {
      onPlay();
    } else {
      setPlaying(true);
      setPaused(false); // 点击启动时取消暂停状态
    }
  };

  const handlePause = () => {
    if (isButtonDisabled) return;
    if (!state.isPlaying) return;
    startAudioContext();
    if (onPause) {
      onPause();
    } else {
      setPaused(!state.isPaused);
    }
  };

  const handleReset = () => {
    startAudioContext();
    if (onReset) onReset();
  };

  const handleFullscreen = () => {
    if (!state.loadedFile) {
      showToast('请导入游戏后再进入全屏模式', 'error');
      return;
    }
    const crtContainer = document.querySelector('.crt-container') as HTMLElement;
    if (!crtContainer) return;
    
    if (!document.fullscreenElement) {
      crtContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="mt-6 w-full max-w-4xl bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-xl flex flex-wrap justify-between items-center gap-4 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10">
      {/* File Import */}
      <div className="flex items-center gap-3">
        <label
          className={`btn-retro btn-primary px-6 py-2 rounded cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 hover:scale-105 ${isFileLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
          htmlFor="romInput"
          style={{ pointerEvents: isFileLoaded ? 'none' : 'auto' }}
        >
          <i className="fa-solid fa-floppy-disk text-white"></i> 导入游戏
        </label>
        <input
          ref={fileInputRef}
          accept=".nes"
          className="hidden"
          id="romInput"
          type="file"
          onChange={handleFileChange}
          disabled={isFileLoaded}
        />
        <span className="text-xs text-gray-400 max-w-[150px] truncate font-mono bg-gray-700 px-3 py-1 rounded border border-gray-600" id="fileName">
          {state.loadedFile ? state.loadedFile.name : '未选择文件'}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          className={`btn-retro w-10 h-10 rounded flex items-center justify-center transition-all duration-200 ${(isButtonDisabled || (state.isPlaying && !state.isPaused)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700 hover:scale-110 hover:shadow-lg hover:shadow-green-500/20'}`}
          title="开始/运行"
          onClick={handlePlay}
          disabled={isButtonDisabled || (state.isPlaying && !state.isPaused)}
        >
          <i className="fa-solid fa-play text-green-400 drop-shadow-[0_0_2px_white]"></i>
        </button>
        <button
          className={`btn-retro w-10 h-10 rounded flex items-center justify-center transition-all duration-200 ${(isButtonDisabled || !state.isPlaying) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20'}`}
          title="暂停"
          onClick={handlePause}
          disabled={isButtonDisabled || !state.isPlaying}
        >
          <i className="fa-solid fa-pause text-red-400 drop-shadow-[0_0_2px_white]"></i>
        </button>
        <button
          className="btn-retro w-10 h-10 rounded flex items-center justify-center transition-all duration-200 hover:bg-gray-700 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 relative"
          title="弹出卡带"
          onClick={handleReset}
        >
          {/* FC卡带弹出图标 */}
          <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="4" width="12" height="16" rx="2" />
            <rect x="8" y="2" width="8" height="2" rx="1" />
            <path d="M10 12H14" />
            <path d="M10 16H14" />
            <path d="M10 8H14" />
          </svg>
        </button>
        <div className="w-px h-6 bg-gray-600 mx-1"></div>
        <button
          className="btn-retro w-10 h-10 rounded flex items-center justify-center transition-all duration-200 hover:bg-gray-700 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/20"
          title="全屏"
          onClick={handleFullscreen}
        >
          <i className="fa-solid fa-expand text-purple-400 drop-shadow-[0_0_2px_white]"></i>
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 hidden md:block font-mono bg-gray-700 px-4 py-2 rounded border border-gray-600">
        <div className="flex gap-4">
          <span>支持 .nes</span>
          <span>P1-P2 本地多玩家</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ControlBar);