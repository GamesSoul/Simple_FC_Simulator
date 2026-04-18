import { memo } from 'react';
import { useEmulator } from '../context/EmulatorContext';

/**
 * Status bar showing FPS, loaded file, and player info.
 */
function StatusBar() {
  const { state } = useEmulator();

  const hasRom = state.loadedFile !== null;

  return (
    <div className={`absolute z-30 flex gap-4 text-xs font-mono text-green-500 opacity-80 pointer-events-none ${hasRom ? 'top-6 left-6' : 'top-6 left-1/2 transform -translate-x-1/2'}`}>
      <span>{state.loadedFile ? state.loadedFile.name.toUpperCase() : 'NO ROM LOADED'}</span>
      <span>P1: KEYBOARD</span>
      <span>P2: KEYBOARD</span>
    </div>
  );
}

export default memo(StatusBar);