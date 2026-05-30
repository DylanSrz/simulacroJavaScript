/**
 * @file components/modal.js
 * @description Modal de confirmación genérico. Se usa, por ejemplo, antes de
 * eliminar un proyecto. Devuelve una Promesa para poder usarlo con `await`.
 */
import { escapeHtml } from '../utils/helpers.js';

// ID del contenedor donde se monta el modal (definido en index.html).
const ROOT_ID = 'modal-root';

/**
 * Abre un modal de confirmación y resuelve según la elección del usuario.
 *
 * @param {object} [opts] - Opciones de configuración del modal.
 * @param {string} [opts.title='Confirm'] - Título del modal.
 * @param {string} [opts.message='Are you sure?'] - Mensaje/pregunta.
 * @param {string} [opts.confirmText='Confirm'] - Texto del botón de confirmar.
 * @param {string} [opts.cancelText='Cancel'] - Texto del botón de cancelar.
 * @param {boolean} [opts.danger=false] - Si `true`, el botón de confirmar usa
 *   estilo de peligro (rojo), apropiado para acciones destructivas.
 * @returns {Promise<boolean>} `true` si confirma, `false` si cancela / cierra.
 */
export const confirmModal = ({
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
} = {}) =>
  new Promise((resolve) => {
    const root = document.getElementById(ROOT_ID) || document.body;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 class="modal__title" id="modal-title">${escapeHtml(title)}</h2>
        <p class="modal__message">${escapeHtml(message)}</p>
        <div class="modal__actions">
          <button type="button" class="btn btn--ghost" data-action="cancel">${escapeHtml(cancelText)}</button>
          <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-action="confirm">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    /**
     * Cierra el modal, limpia el listener de teclado y resuelve la promesa.
     * @param {boolean} result - Valor con el que se resuelve la promesa.
     */
    const close = (result) => {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };

    // Permite cancelar con la tecla Escape.
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
    };

    // Clic en el fondo (overlay) o en los botones de acción.
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'cancel') close(false);
      if (action === 'confirm') close(true);
    });
    document.addEventListener('keydown', onKey);

    root.appendChild(overlay);
    overlay.querySelector('[data-action="confirm"]').focus();
  });
