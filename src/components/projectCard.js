// Renders a single project as a card.
import { escapeHtml, formatDate, statusClass } from '../utils/helpers.js';

/**
 * @param {object} project
 * @param {object} options
 * @param {string} options.assigneeName - resolved name of the assignee
 * @param {boolean} options.canEdit
 * @param {boolean} options.canDelete
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
