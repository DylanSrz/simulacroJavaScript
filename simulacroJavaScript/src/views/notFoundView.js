/**
 * @file views/notFoundView.js
 * @description Vista 404. Se muestra cuando el hash no coincide con ninguna
 * ruta conocida. Ofrece un enlace de vuelta al dashboard.
 */

/**
 * Renderiza la pantalla de "página no encontrada" en #view-container.
 * @returns {void}
 */
export const notFoundView = () => {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <section class="notfound">
      <h1 class="notfound__code">404</h1>
      <p class="notfound__text">The page you're looking for doesn't exist.</p>
      <a href="#/dashboard" class="btn btn--primary">Back to dashboard</a>
    </section>
  `;
};