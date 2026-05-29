// Loading spinner helpers (extra feature).

/** Returns markup for an inline spinner; drop it into any container. */
export const loaderHTML = (label = 'Loading…') => `
  <div class="loader" role="status" aria-live="polite">
    <div class="loader__spinner"></div>
    <span class="loader__label">${label}</span>
  </div>
`;

/** Renders a spinner into a container element. */
export const showLoader = (container, label) => {
  if (container) container.innerHTML = loaderHTML(label);
};
