import { useState, useEffect, useCallback } from 'react';

let toastCount = 0;
let memoryState = { toasts: [] };
const listeners = [];

function dispatch(newState) {
  memoryState = newState;
  listeners.forEach((listener) => listener(memoryState));
}

export function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }) => {
    const id = ++toastCount;
    dispatch({ toasts: [...memoryState.toasts, { id, title, description, variant, open: true }] });
    setTimeout(() => {
      dispatch({ toasts: memoryState.toasts.filter((t) => t.id !== id) });
    }, duration);
    return id;
  }, []);

  return { toasts: state.toasts, toast };
}
