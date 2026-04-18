import { memo, useState, useEffect, useRef } from 'react';
import { useEmulator } from '../context/EmulatorContext';

/**
 * Performance monitor component showing FPS and frame time.
 */
function PerformanceMonitor() {
  const { state } = useEmulator();
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      const currentFps = Math.round((frameCountRef.current * 1000) / delta);
      setFps(currentFps);
      setFrameTime(Math.round(delta / frameCountRef.current) || 0);
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }, 1000);

    // Simulate frame count (in a real app, this would be updated by the actual render loop)
    const frameInterval = setInterval(() => {
      frameCountRef.current++;
    }, 16); // ~60 FPS

    return () => {
      clearInterval(interval);
      clearInterval(frameInterval);
    };
  }, []);

  // 只有当游戏文件加载后才显示 FPS 监控
  if (!state.loadedFile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg p-2 text-xs font-mono text-gray-400 shadow-lg">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={`${fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
            {fps}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Frame Time:</span>
          <span className={`${frameTime <= 16 ? 'text-green-400' : frameTime <= 33 ? 'text-yellow-400' : 'text-red-400'}`}>
            {frameTime}ms
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(PerformanceMonitor);