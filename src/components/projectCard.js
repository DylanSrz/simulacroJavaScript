/**
 * @file components/projectCard.js
 * @description Componente de presentación: renderiza un proyecto como tarjeta.
 * Es una función "pura" de plantilla (devuelve HTML); los eventos de sus botones
 * los gestiona la vista que la usa (projectsView), mediante delegación.
 */
import { escapeHtml, formatDate, statusClass } from '../utils/helpers.js';

/**
 * Genera el HTML de la tarjeta de un proyecto.
 *
 * @param {object} project - Proyecto a renderizar (name, description, status,
 *   assignedTo, createdAt, id).
 * @param {object} [options] - Opciones de presentación.
 * @param {string} [options.assigneeName='Unassigned'] - Nombre ya resuelto del
 *   responsable (la vista traduce el id de usuario a su nombre).
 * @param {boolean} [options.canEdit=false] - Si se muestra el botón Editar.
 * @param {boolean} [options.canDelete=false] - Si se muestra el botón Eliminar.
 * @returns {string} Cadena HTML de la tarjeta.
 */
export const projectCard = (project, { assigneeName = 'Unassigned', canEdit = false, canDelete = false } = {}) => `
  <article class="card" data-id="${project.id}">
    <header class="card__header">
      <h3 class="card__title">${escapeHtml(project.name)}</h3>
      <span class="badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span>
    </header>
    <p class="card__desc">${escapeHtml(project.description)}</p>
    <dl class="card__meta">
      <div><dt>Assigned to</dt><dd>${escapeHtml(assigneeName)}</dd></div>
      <div><dt>Created</dt><dd>${formatDate(project.createdAt)}</dd></div>
    </dl>
    <footer class="card__actions">
      ${canEdit ? `<button class="btn btn--small btn--primary" data-action="edit" data-id="${project.id}">Edit</button>` : ''}
      ${canDelete ? `<button class="btn btn--small btn--danger" data-action="delete" data-id="${project.id}">Delete</button>` : ''}
    </footer>
  </article>
`;
