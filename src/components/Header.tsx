import { memo } from 'react';
import { useEmulator, useEmulatorAction } from '../context/EmulatorContext';

/**
 * Header component with logo, volume slider, and settings button.
 * Memoized to prevent unnecessary re-renders.
 */
function Header() {
  const { state } = useEmulator();
  const { setVolume, toggleSettings } = useEmulatorAction();

  return (
    <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shadow-lg z-20">
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-gamepad text-red-500 text-2xl"></i>
        <div className="flex items-center gap-2">
          <img src="/src/components/Logo.svg" alt="红vs白 nes模拟器" className="h-10" />
          {/* <span className="text-xs text-gray-500 font-sans normal-case">v1.0.2</span> */}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Volume Control */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <i className="fa-solid fa-volume-high"></i>
          <input
            className="w-24"
            max="100"
            min="0"
            type="range"
            value={state.volume * 100}
            onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
          />
        </div>

        {/* Settings Button */}
        <button
          className="btn-retro px-4 py-2 rounded text-sm font-bold"
          onClick={() => toggleSettings(true)}
        >
          <i className="fa-solid fa-gear"></i> 设置
        </button>
      </div>
    </header>
  );
}

export default memo(Header);