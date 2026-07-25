declare global {
  interface Window {
    __KOTOR_DEV_INPUT_GUARD__?: boolean;
  }
}

let toastHost: HTMLDivElement | null = null;

function showDevInputToast(message: string): void {
  if (typeof document === 'undefined') return;
  if (!toastHost) {
    toastHost = document.createElement('div');
    toastHost.setAttribute('data-kotor-dev-toast', '1');
    Object.assign(toastHost.style, {
      position: 'fixed',
      bottom: '12px',
      left: '12px',
      zIndex: '99999',
      maxWidth: '420px',
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.82)',
      color: '#e8e8e8',
      font: '12px/1.4 monospace',
      borderRadius: '4px',
      pointerEvents: 'none',
    });
    document.body.appendChild(toastHost);
  }
  toastHost.textContent = message;
  toastHost.style.opacity = '1';
  window.setTimeout(() => {
    if (toastHost) toastHost.style.opacity = '0';
  }, 3500);
}

/**
 * Blocks browser F5 reload in dev HMR builds. F5 remains bound to quickload
 * via KeyMapper; dev refresh uses Ctrl+R or webpack HMR abort reload.
 */
export function installDevInputGuard(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (window.__KOTOR_DEV_INPUT_GUARD__) return;
  window.__KOTOR_DEV_INPUT_GUARD__ = true;

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.key !== 'F5') return;
      event.preventDefault();
      showDevInputToast('F5 = quickload (in-game). Use Ctrl+R or HMR reload for dev refresh.');
    },
    true,
  );
}

/** Test hook — resets module state between tests. */
export function resetDevInputGuardForTests(): void {
  window.__KOTOR_DEV_INPUT_GUARD__ = false;
  if (toastHost?.parentNode) {
    toastHost.parentNode.removeChild(toastHost);
  }
  toastHost = null;
}
