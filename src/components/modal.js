// Generic confirmation modal.
import { escapeHtml } from '../utils/helpers.js';

const ROOT_ID = 'modal-root';

/**
 * Opens a confirmation modal. Resolves true on confirm, false on cancel.
 * @returns {Promise<boolean>}
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

    const close = (result) => {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
    };

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
