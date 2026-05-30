/**
 * @file components/toast.js
 * @description Notificaciones "toast" con auto-cierre (punto extra). Muestra
 * mensajes flotantes de éxito/error/info que desaparecen solos a los pocos
 * segundos o al hacer clic.
 */

// ID del contenedor donde se apilan los toasts.
const ROOT_ID = 'toast-root';

/**
 * Obtiene (o crea, si no existe) el contenedor raíz de los toasts.
 * @returns {HTMLElement} El elemento contenedor de los toasts.
 */
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
 * Muestra una notificación toast.
 * @param {string} message - Texto a mostrar.
 * @param {('success'|'error'|'info')} [type='info'] - Tipo (define el color).
 * @param {number} [duration=3000] - Milisegundos antes del auto-cierre.
 * @returns {void}
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  const root = getRoot();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  root.appendChild(toast);

  // Dispara la animación de entrada en el siguiente frame.
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  // Cierra el toast con animación de salida y lo elimina del DOM.
  const dismiss = () => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(dismiss, duration);
  // Permite cerrar el toast manualmente con un clic (cancela el temporizador).
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });
};
