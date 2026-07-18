export interface ToastItem {
  id: number;
  message: string;
}

let nextId = 0;
const listeners = new Set<(toast: ToastItem) => void>();

export const showToast = (message: string) => {
  const toast = { id: nextId++, message };
  const notify = () => {
    listeners.forEach((listener) => listener(toast));
  };

  if (typeof window !== "undefined") {
    window.setTimeout(notify, 0);
    return;
  }

  notify();
};

export const subscribeToToast = (listener: (toast: ToastItem) => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
