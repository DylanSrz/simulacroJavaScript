/**
 * @file views/projectFormView.js
 * @description Formulario de crear / editar proyecto. Es la vista más rica en
 * lógica de roles:
 *   - Manager: puede crear y editar todos los campos.
 *   - Collaborator: NO puede crear; al editar uno de SUS proyectos solo puede
 *     cambiar el campo `status` (el resto de campos quedan bloqueados).
 * Incluye validación avanzada (longitudes y nombres no duplicados).
 */
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
 * Renderiza el formulario de proyecto. Funciona en dos modos según `params`:
 * creación (sin id) o edición (con id). Aplica las restricciones de rol tanto
 * para acceder como para decidir qué campos se pueden editar.
 *
 * @param {object} [params={}] - Parámetros de ruta. `{ id }` cuando se edita.
 * @returns {Promise<void>}
 */
export const projectFormView = async (params = {}) => {
  const container = document.getElementById('view-container');
  const session = getSession();
  const isManager = session.role === 'manager';
  const isEdit = Boolean(params.id);
  showLoader(container, 'Loading…');

  // Se cargan usuarios (para el select de responsable) y todos los proyectos
  // (para detectar nombres duplicados). En edición, también el proyecto actual.
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

  // Guardas de rol a nivel de vista (además del authGuard del router):
  // un collaborator solo puede editar SU proyecto.
  if (isEdit && !isManager && project.assignedTo !== session.id) {
    location.hash = '#/projects';
    return;
  }
  // Un collaborator no puede crear proyectos.
  if (!isEdit && !isManager) {
    location.hash = '#/dashboard';
    return;
  }

  // `locked` = true cuando un collaborator edita: todos los campos salvo el
  // estado quedan deshabilitados.
  const locked = isEdit && !isManager;

  // Opciones del select de responsable (marca como seleccionado el actual).
  const userOptions = users
    .map(
      (u) =>
        `<option value="${u.id}" ${project?.assignedTo === u.id ? 'selected' : ''}>${escapeHtml(u.name)} (${escapeHtml(u.role)})</option>`
    )
    .join('');

  // Opciones del select de estado.
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

  /**
   * Escribe (o limpia) el mensaje de error de un campo del formulario.
   * @param {string} field - Nombre del campo (name, description, status…).
   * @param {string} msg - Mensaje de error ('' para limpiar).
   */
  const setError = (field, msg) => {
    const el = form.querySelector(`[data-error="${field}"]`);
    if (el) el.textContent = msg;
  };

  // Envío del formulario: valida según el rol y crea o actualiza el proyecto.
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const description = form.description.value.trim();
    const status = form.status.value;
    const assignedTo = Number(form.assignedTo.value);

    let hasError = false;

    // Los campos de texto solo se validan cuando NO están bloqueados
    // (es decir, manager creando o editando).
    if (!locked) {
      const nameErr =
        validateRequired(name, 'Name') ||
        validateLength(name, { min: 3, max: 60, label: 'Name' });
      const descErr =
        validateRequired(description, 'Description') ||
        validateLength(description, { min: 5, max: 300, label: 'Description' });

      // Validación avanzada: nombres no duplicados (ignorando el proyecto
      // que se está editando).
      const duplicate = allProjects.some(
        (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== project?.id
      );
      const dupErr = duplicate ? 'A project with this name already exists.' : '';

      setError('name', nameErr || dupErr);
      setError('description', descErr);
      if (nameErr || dupErr || descErr) hasError = true;
    }

    // El estado siempre se valida (es lo único editable por un collaborator).
    const statusErr = validateStatus(status);
    setError('status', statusErr);
    if (statusErr) hasError = true;

    if (hasError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      if (isEdit) {
        // Collaborator envía solo el estado (PATCH parcial); manager, todo.
        const payload = locked
          ? { status }
          : { name, description, status, assignedTo };
        await updateProject(project.id, payload);
        showToast('Project updated.', 'success');
      } else {
        // Creación: `createdAt` se genera automáticamente con la fecha de hoy.
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
