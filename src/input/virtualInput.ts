import { useEffect, useState } from 'react';

/**
 * Touch / on-screen control state. The 3D scene ORs this with the keyboard state every frame,
 * so keyboard and tablet controls can be mixed freely.
 */
export const virtualInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
};

export type VirtualInputKey = keyof typeof virtualInput;

export function setVirtualInput(patch: Partial<typeof virtualInput>) {
  Object.assign(virtualInput, patch);
}

export function resetVirtualInput() {
  setVirtualInput({ forward: false, backward: false, left: false, right: false, jump: false, sprint: false });
}

/** Coarse pointer (finger) device, or forced with ?touch=1 for testing on a desktop. */
export function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get('touch') === '1') return true;
    if (window.matchMedia?.('(pointer: coarse)').matches) return true;
  } catch {
    /* ignore */
  }
  return 'ontouchstart' in window && navigator.maxTouchPoints > 0;
}

export const IS_TOUCH_DEVICE = detectTouchDevice();

export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(IS_TOUCH_DEVICE);
  useEffect(() => {
    // A hybrid laptop that gets a real touch event switches to touch controls
    const onTouch = () => setTouch(true);
    window.addEventListener('touchstart', onTouch, { once: true, passive: true });
    return () => window.removeEventListener('touchstart', onTouch);
  }, []);
  return touch;
}
