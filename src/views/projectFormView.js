// Create / edit project form.
// Managers edit every field; collaborators may only change status of their own.
import { getSession } from '../auth/authService.js';
import {
  getUsers,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
} from '../api/api.js';
import {
  validateRequired,
  validateLength,
  validateStatus,
  PROJECT_STATUSES,
} from '../utils/validators.js';
import { showLoader } from '../components/loader.js';
import { showToast } from '../components/toast.js';
import { escapeHtml, todayISO } from '../utils/helpers.js';

/**
 * @param {object} params - route params, e.g. { id } when editing.
 */
export const projectFormView = async (params = {}) => {
  const container = document.getElementById('view-container');
  const session = getSession();
  const isManager = session.role === 'manager';
  const isEdit = Boolean(params.id);
  showLoader(container, 'Loading…');

  let users = [];
  let project = null;
  let allProjects = [];
  try {
    [users, allProjects] = await Promise.all([getUsers(), getProjects()]);
    if (isEdit) project = await getProjectById(params.id);
  } catch {
    container.innerHTML = `<section class="page"><p class="error-state">Could not load the form. Is json-server running?</p></section>`;
    showToast('Failed to load form.', 'error');
    return;
  }

  // Collaborators can only edit their own project, and only its status.
  if (isEdit && !isManager && project.assignedTo !== session.id) {
    location.hash = '#/projects';
    return;
  }
  if (!isEdit && !isManager) {
    // Collaborators cannot create projects.
    location.hash = '#/dashboard';
    return;
  }

  // Fields locked for collaborators on edit.
  const locked = isEdit && !isManager;

  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.id}" ${project?.assignedTo === u.id ? 'selected' : ''}>${escapeHtml(u.name)} (${escapeHtml(u.role)})</option>`
    )
    .join('');

  const statusOptions = PROJECT_STATUSES.map(
    (s) => `<option value="${s}" ${project?.status === s ? 'selected' : ''}>${s}</option>`
  ).join('');

  container.innerHTML = `
    <section class="page">
      <h1 class="page__title">${isEdit ? 'Edit Project' : 'New Project'}</h1>
      <form class="form-card" id="project-form" novalidate>
        <label class="field">
          <span class="field__label">Name</span>
          <input type="text" name="name" class="field__input" value="${escapeHtml(project?.name || '')}" ${locked ? 'disabled' : ''} />
          <small class="field__error" data-error="name"></small>
        </label>

        <label class="field">
          <span class="field__label">Description</span>
          <textarea name="description" class="field__input" rows="4" ${locked ? 'disabled' : ''}>${escapeHtml(project?.description || '')}</textarea>
          <small class="field__error" data-error="description"></small>
        </label>

        <label class="field">
          <span class="field__label">Status</span>
          <select name="status" class="field__input">${statusOptions}</select>
          <small class="field__error" data-error="status"></small>
        </label>

        <label class="field">
          <span class="field__label">Assigned to</span>
          <select name="assignedTo" class="field__input" ${locked ? 'disabled' : ''}>${userOptions}</select>
          <small class="field__error" data-error="assignedTo"></small>
        </label>

        ${locked ? '<p class="form-note">As a collaborator you can only update the status of your project.</p>' : ''}

        <div class="form-card__actions">
          <a href="#/projects" class="btn btn--ghost">Cancel</a>
          <button type="submit" class="btn btn--primary">${isEdit ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </section>
  `;

  const form = container.querySelector('#project-form');
  const setError = (field, msg) => {
    const el = form.querySelector(`[data-error="${field}"]`);
    if (el) el.textContent = msg;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const description = form.description.value.trim();
    const status = form.status.value;
    const assignedTo = Number(form.assignedTo.value);

    let hasError = false;
    if (!locked) {
      const nameErr =
        validateRequired(name, 'Name') ||
        validateLength(name, { min: 3, max: 60, label: 'Name' });
      const descErr =
        validateRequired(description, 'Description') ||
        validateLength(description, { min: 5, max: 300, label: 'Description' });

      // Advanced validation: no duplicate names (ignoring the project being edited).
      const duplicate = allProjects.some(
        (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== project?.id
      );
      const dupErr = duplicate ? 'A project with this name already exists.' : '';

      setError('name', nameErr || dupErr);
      setError('description', descErr);
      if (nameErr || dupErr || descErr) hasError = true;
    }

    const statusErr = validateStatus(status);
    setError('status', statusErr);
    if (statusErr) hasError = true;

    if (hasError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      if (isEdit) {
        // Collaborators only send status; managers send everything.
        const payload = locked
          ? { status }
          : { name, description, status, assignedTo };
        await updateProject(project.id, payload);
        showToast('Project updated.', 'success');
      } else {
        await createProject({
          name,
          description,
          status,
          assignedTo,
          createdAt: todayISO(),
        });
        showToast('Project created.', 'success');
      }
      location.hash = '#/projects';
    } catch {
      showToast('Failed to save project.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Save changes' : 'Create project';
    }
  });
};
