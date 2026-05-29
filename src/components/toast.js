// Toast notifications with auto-dismiss (extra feature).
const ROOT_ID = 'toast-root';

const getRoot = () => {
  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    document.body.appendChild(root);
  }
  return root;
};

/**
 * Shows a toast.
 * @param {string} message
 * @param {('success'|'error'|'info')} type
 * @param {number} duration ms before auto-dismiss
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  const root = getRoot();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  root.appendChild(toast);

  // Trigger enter animation on next frame.
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  const dismiss = () => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(dismiss, duration);
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });
};
