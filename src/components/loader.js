/**
 * @file components/loader.js
 * @description Spinner de carga (punto extra). Se muestra mientras se esperan
 * datos de la API, para dar feedback visual al usuario.
 */

/**
 * Devuelve el HTML de un spinner inline para insertarlo en cualquier contenedor.
 * @param {string} [label='Loading…'] - Texto acompañante del spinner.
 * @returns {string} Cadena HTML del loader.
 */
export const loaderHTML = (label = 'Loading…') => `
  <div class="loader" role="status" aria-live="polite">
    <div class="loader__spinner"></div>
    <span class="loader__label">${label}</span>
  </div>
`;

/**
 * Renderiza un spinner dentro de un contenedor (reemplaza su contenido).
 * @param {HTMLElement} container - Elemento donde mostrar el loader.
 * @param {string} [label] - Texto acompañante opcional.
 * @returns {void}
 */
export const showLoader = (container, label) => {
  if (container) container.innerHTML = loaderHTML(label);
};
