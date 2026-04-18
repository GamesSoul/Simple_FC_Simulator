import { memo, useState, useEffect, useCallback } from 'react';
import { useEmulator, useEmulatorAction } from '../context/EmulatorContext';
import { GamepadInfo } from '../types';

/**
 * Key mapping panel for a single player.
 */
interface KeyMappingPanelProps {
  player: number;
  startKeyCapture: (callback: (code: string) => void) => void;
  keyboardController?: any;
}

function KeyMappingPanel({ player, startKeyCapture }: KeyMappingPanelProps) {
  const { state } = useEmulator();
  const { setMapping } = useEmulatorAction();
  const [listeningKey, setListeningKey] = useState<string | null>(null);

  const handleKeyClick = useCallback((action: string) => {
    setListeningKey(action);
    startKeyCapture((code: string) => {
      // 只更新 context 中的 mappings，让 EmulatorJsPage 的 useEffect 来处理 jsnes 键位更新
      setMapping(player, action, code);
      setListeningKey(null);
    });
  }, [player, setMapping, startKeyCapture]);

  const codeToName = (code: string): string => {
    if (!code) return '未设置';
    if (code.startsWith('Digit')) return code.replace('Digit', '');
    if (code.startsWith('Key')) return code.replace('Key', '');
    if (code.startsWith('Numpad')) return 'Num' + code.replace('Numpad', '');
    if (code === 'ControlLeft') return 'L-Ctrl';
    if (code === 'ControlRight') return 'R-Ctrl';
    if (code === 'Space') return 'Space';
    if (code === 'NumpadSlash') return 'Num/';
    if (code === 'NumpadMultiply') return 'Num*';
    if (code === 'NumpadDecimal') return 'Num.';
    if (code.startsWith('Arrow')) return code.replace('Arrow', '');
    return code;
  };

  const map = state.mappings[player];

  return (
    <div className="fc-controller-layout" id="mappingContainer">
      {/* Directional Pad */}
      <div className="dpad-container">
        <div className="dpad-row">
          <button
            className={`dpad-btn ${listeningKey === 'Up' ? 'animate-pulse' : ''}`}
            onClick={() => handleKeyClick('Up')}
          >
            <span className="dpad-label">{codeToName(map['Up'])}</span>
          </button>
        </div>
        <div className="dpad-row">
          <button
            className={`dpad-btn ${listeningKey === 'Left' ? 'animate-pulse' : ''}`}
            onClick={() => handleKeyClick('Left')}
          >
            <span className="dpad-label">{codeToName(map['Left'])}</span>
          </button>
          <button
            className={`dpad-btn ${listeningKey === 'Down' ? 'animate-pulse' : ''}`}
            onClick={() => handleKeyClick('Down')}
          >
            <span className="dpad-label">{codeToName(map['Down'])}</span>
          </button>
          <button
            className={`dpad-btn ${listeningKey === 'Right' ? 'animate-pulse' : ''}`}
            onClick={() => handleKeyClick('Right')}
          >
            <span className="dpad-label">{codeToName(map['Right'])}</span>
          </button>
        </div>
      </div>

      {/* Select and Start Buttons */}
      <div className="center-buttons">
        <button
          className={`center-btn ${listeningKey === 'Select' ? 'animate-pulse' : ''}`}
          onClick={() => handleKeyClick('Select')}
        >
          <span className="btn-label">{codeToName(map['Select'])}</span>
        </button>
        <button
          className={`center-btn ${listeningKey === 'Start' ? 'animate-pulse' : ''}`}
          onClick={() => handleKeyClick('Start')}
        >
          <span className="btn-label">{codeToName(map['Start'])}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className={`action-btn a-btn ${listeningKey === 'A' ? 'animate-pulse' : ''}`}
          onClick={() => handleKeyClick('A')}
        >
          <span className="btn-label">{codeToName(map['A'])}</span>
        </button>
        <button
          className={`action-btn b-btn ${listeningKey === 'B' ? 'animate-pulse' : ''}`}
          onClick={() => handleKeyClick('B')}
        >
          <span className="btn-label">{codeToName(map['B'])}</span>
        </button>
        <button
          className={`action-btn a-turbo-btn ${listeningKey === 'A连发' ? 'animate-pulse' : ''}`}
          onClick={() => handleKeyClick('A连发')}
        >
          <span className="btn-label">{codeToName(map['A连发'])}</span>
        </button>
        <button
          className={`action-btn b-turbo-btn ${listeningKey === 'B连发' ? 'animate-pulse' : ''}`}
          onClick={() => handleKeyClick('B连发')}
        >
          <span className="btn-label">{codeToName(map['B连发'])}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Gamepad status display.
 */
function GamepadStatus() {
  const [gamepads, setGamepads] = useState<GamepadInfo[]>([]);

  useEffect(() => {
    const update = () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      const connected: GamepadInfo[] = [];
      for (let i = 0; i < 4; i++) {
        if (gps[i]) {
          connected.push({ index: i, id: gps[i]!.id });
        }
      }
      setGamepads(connected);
    };

    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 pt-4 border-t border-arcade-border">
      <h3 className="text-xs font-bold text-arcade-muted mb-3 uppercase tracking-wider">
        <i className="fa-solid fa-gamepad mr-2"></i>设备连接状态
      </h3>
      <div className="space-y-2">
        {gamepads.length > 0 ? (
          gamepads.map((gp) => (
            <div key={gp.index} className="flex items-center gap-2 text-sm text-neon-green">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="font-mono text-xs">
                Player {gp.index + 1}: {gp.id.length > 30 ? gp.id.substring(0, 30) + '...' : gp.id}
              </span>
            </div>
          ))
        ) : (
          <div className="text-arcade-muted text-sm">
            <i className="fa-solid fa-plug-circle-xmark mr-2"></i>
            正在努力实现手柄映射功能
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Input mapping tab content.
 */
interface InputTabProps {
  startKeyCapture: (callback: (code: string) => void) => void;
  keyboardController?: any;
}

function InputTab({ startKeyCapture, keyboardController }: InputTabProps) {
  const { state } = useEmulator();
  const { setCurrentTabPlayer } = useEmulatorAction();

  return (
    <div>
      {/* Player Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        {[1, 2].map((p) => (
          <button
            key={p}
            className={`player-tab-btn ${state.currentTabPlayer === p ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'} px-4 py-1 rounded text-sm font-bold hover:bg-gray-600`}
            onClick={() => setCurrentTabPlayer(p)}
            data-player={p}
          >
            Player {p}
          </button>
        ))}
        {/* Player 3 and 4 temporarily disabled */}
        {/* {[3, 4].map((p) => (
          <button
            key={p}
            className={`player-tab-btn ${state.currentTabPlayer === p ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'} px-4 py-1 rounded text-sm font-bold hover:bg-gray-600`}
            onClick={() => setCurrentTabPlayer(p)}
            data-player={p}
          >
            Player {p}
          </button>
        ))} */}
      </div>

      {/* Key Mapping Grid */}
      <KeyMappingPanel
        player={state.currentTabPlayer}
        startKeyCapture={startKeyCapture}
        keyboardController={keyboardController}
      />

      {/* Gamepad Status */}
      <GamepadStatus />
    </div>
  );
}

/**
 * CRT effects settings tab.
 */
function CRTTab() {
  const { state } = useEmulator();
  const { setCrt } = useEmulatorAction();

  const effects = [
    { key: 'scanlines', label: '扫描线', desc: '逐行明暗条纹' },
    { key: 'rgb', label: 'RGB 色差', desc: '红绿蓝通道偏移' },
    { key: 'noise', label: '噪点/胶片颗粒', desc: '模拟老旧信号干扰' },
    { key: 'distortion', label: '图像扭曲', desc: '正弦波扰动效果' },
    { key: 'blur', label: '图像模糊', desc: '边缘柔化处理' },
    { key: 'vignette', label: '边缘遮罩', desc: '四角变暗效果' },
  ];

  return (
    <div className="space-y-6">
      {/* Color Mode Selector */}
      <div className="p-3 bg-arcade-dark rounded-lg border border-arcade-border">
        <div className="mb-3">
          <label className="text-arcade-bright font-bold text-sm">电视模式</label>
          <p className="text-arcade-muted text-xs mt-0.5">选择彩色或黑白电视模式</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
              state.crt.colorMode === 'color'
                ? 'bg-[#dc2626] text-white shadow-lg'
                : 'bg-arcade-surface text-arcade-muted hover:bg-arcade-border'
            }`}
            onClick={() => setCrt({ colorMode: 'color' })}
          >
            <i className="fa-solid fa-tv mr-2"></i>彩色电视
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${
              state.crt.colorMode === 'grayscale'
                ? 'bg-[#dc2626] text-white shadow-lg'
                : 'bg-arcade-surface text-arcade-muted hover:bg-arcade-border'
            }`}
            onClick={() => setCrt({ colorMode: 'grayscale' })}
          >
            <i className="fa-solid fa-moon mr-2"></i>黑白电视
          </button>
        </div>
      </div>

      {effects.map((effect) => (
        <div
          key={effect.key}
          className="flex items-center justify-between"
        >
          <label className="text-gray-300 font-bold">{effect.label}</label>
          <input
            type="checkbox"
            checked={Boolean(state.crt[effect.key as keyof typeof state.crt])}
            onChange={(e) => setCrt({ [effect.key]: e.target.checked })}
            className="w-5 h-5 accent-red-500"
          />
        </div>
      ))}

    </div>
  );
}

/**
 * About tab content.
 */
function AboutTab() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-4">
          <img src="/src/components/Logo.svg" alt="红vs白 nes模拟器" className="h-10" />
        </div>
        <p className="text-gray-400 mb-4 leading-relaxed">
          这是一个基于 HTML5 Canvas 和 WebGL 技术构建的高级 FC/NES 模拟器前端演示，
          使用 <strong>jsnes</strong> 库实现核心模拟功能。
          完整实现了复古 CRT 电视效果、多玩家输入映射以及文件导入交互。
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6">
          <li>支持 .nes 文件读取</li>
          <li>支持 2 人本地同屏（键盘/手柄）</li>
          <li>纯前端实现，无后端依赖</li>
        </ul>
      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700">
        <p className="text-xs text-gray-500 font-mono">
          Core: JSNES (使用 jsnes 库实现模拟)<br />
          Render: Canvas2D + Post-Processing<br />
          Audio: Web Audio API
        </p>
      </div>
    </div>
  );
}

/**
 * Main Settings Modal component.
 */
interface SettingsModalProps {
  startKeyCapture: (callback: (code: string) => void) => void;
  keyboardController?: any;
}

function SettingsModal({ startKeyCapture, keyboardController }: SettingsModalProps) {
  const { state } = useEmulator();
  const { toggleSettings, setSettingsTab, resetSettings, showToast } = useEmulatorAction();

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && state.showSettings) {
        toggleSettings(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [state.showSettings, toggleSettings]);

  if (!state.showSettings) return null;

  const tabs = [
    { id: 'tab-input', icon: 'fa-keyboard', label: '键位映射' },
    { id: 'tab-crt', icon: 'fa-tv', label: '画面特效' },
    { id: 'tab-about', icon: 'fa-circle-info', label: '关于' },
  ];

  return (
    <div className={`fixed inset-0 modal-backdrop z-50 flex items-center justify-center ${state.showSettings ? '' : 'hidden'}`} id="settingsModal">
      <div className="bg-gray-800 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white"><i className="fa-solid fa-sliders"></i> 系统设置</h2>
          <button className="text-gray-400 hover:text-white transition" id="closeSettings" onClick={() => toggleSettings(false)}>
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-gray-900 border-r border-gray-700 flex flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`p-4 text-left hover:bg-gray-800 border-l-4 ${state.currentSettingsTab === tab.id ? 'border-red-500 text-white font-bold' : 'border-transparent text-gray-400 hover:text-white'} transition`}
                onClick={() => setSettingsTab(tab.id)}
              >
                <i className={`fa-solid ${tab.icon} mr-2`}></i> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 p-6 overflow-y-auto custom-scroll bg-gray-800 relative">
            {state.currentSettingsTab === 'tab-input' && (
              <InputTab startKeyCapture={startKeyCapture} keyboardController={keyboardController} />
            )}
            {state.currentSettingsTab === 'tab-crt' && <CRTTab />}
            {state.currentSettingsTab === 'tab-about' && <AboutTab />}
          </div>
        </div>
        <div className="bg-gray-900 p-4 border-t border-gray-700 flex justify-end">
          <button className="text-sm text-red-400 hover:text-red-300 mr-4" id="resetSettings" onClick={resetSettings}>
            恢复默认设置
          </button>
          <button className="btn-retro btn-primary px-6 py-2 rounded font-bold" id="saveSettings" onClick={() => {
            toggleSettings(false);
            showToast('设置已保存', 'success');
          }}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(SettingsModal);
