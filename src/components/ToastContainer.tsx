import { memo } from 'react';
import { useEmulator, useEmulatorAction } from '../context/EmulatorContext';

/**
 * Toast notification container.
 */
function ToastContainer() {
  const { state } = useEmulator();
  const { removeToast } = useEmulatorAction();

  if (state.toasts.length === 0) return null;

  return (
    <div id="toast-container">
      {state.toasts.map((toast) => {
        const iconMap = {
          success: <i className="fa-solid fa-circle-check text-neon-green"></i>,
          error: <i className="fa-solid fa-circle-exclamation text-neon-red"></i>,
          info: <i className="fa-solid fa-circle-info text-neon-blue"></i>,
        };

        return (
          <div
            key={toast.id}
            className="toast"
            onClick={() => removeToast(toast.id)}
            style={{ cursor: 'pointer' }}
          >
            {iconMap[toast.type] || iconMap.info}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export default memo(ToastContainer);