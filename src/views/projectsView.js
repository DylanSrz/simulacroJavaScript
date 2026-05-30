/**
 * @file views/projectsView.js
 * @description Vista de listado de proyectos. Carga los proyectos (todos para
 * manager, solo los asignados para collaborator), los pinta como tarjetas y
 * ofrece búsqueda por nombre y filtro por estado en el cliente (puntos extra).
 * También gestiona la navegación a editar y el borrado con modal de confirmación.
 */
import { getSession } from '../auth/authService.js';
import {
  getProjects,
  getProjectsByUser,
  getUsers,
  deleteProject,
} from '../api/api.js';
import { projectCard } from '../components/projectCard.js';
import { confirmModal } from '../components/modal.js';
import { showLoader } from '../components/loader.js';
import { showToast } from '../components/toast.js';
import { PROJECT_STATUSES } from '../utils/validators.js';

/**
 * Renderiza el listado de proyectos y engancha búsqueda, filtros y acciones.
 * El rol del usuario determina qué proyectos se cargan y qué botones se ven.
 * @returns {Promise<void>}
 */
export const projectsView = async () => {
  const container = document.getElementById('view-container');
  const session = getSession();
  const isManager = session.role === 'manager';
  showLoader(container, 'Loading projects…');

  // Se cargan proyectos y usuarios en paralelo (los usuarios sirven para
  // mostrar el nombre del responsable en cada tarjeta).
  let projects = [];
  let users = [];
  try {
    [projects, users] = await Promise.all([
      isManager ? getProjects() : getProjectsByUser(session.id),
      getUsers(),
    ]);
  } catch (err) {
    container.innerHTML = `<section class="page"><p class="error-state">Could not load projects. Is json-server running?</p></section>`;
    showToast('Failed to load projects.', 'error');
    return;
  }

  /**
   * Traduce un id de usuario a su nombre legible.
   * @param {number} id - ID del usuario responsable.
   * @returns {string} Nombre del usuario, o 'Unassigned' si no se encuentra.
   */
  const userName = (id) => users.find((u) => u.id === id)?.name || 'Unassigned';

  // Estado de los filtros del lado cliente (búsqueda + estado).
  const state = { search: '', status: 'All' };

  // Opciones del select de filtro: "All" + los estados válidos.
  const filterOptions = ['All', ...PROJECT_STATUSES]
    .map((s) => `<option value="${s}">${s}</option>`)
    .join('');

  container.innerHTML = `
    <section class="page">
      <div class="page__head">
        <h1 class="page__title">${isManager ? 'All Projects' : 'My Projects'}</h1>
        ${isManager ? '<a href="#/projects/new" class="btn btn--primary">+ New Project</a>' : ''}
      </div>
      <div class="toolbar">
        <input type="search" class="toolbar__search" placeholder="Search by name…" data-role="search" />
        <select class="toolbar__filter" data-role="status">${filterOptions}</select>
      </div>
      <div class="grid" data-role="grid"></div>
    </section>
  `;

  const grid = container.querySelector('[data-role="grid"]');

  /**
   * Aplica los filtros actuales (búsqueda + estado) y repinta solo la rejilla
   * de tarjetas. Decide por rol qué botones de acción mostrar en cada tarjeta.
   * @returns {void}
   */
  const renderGrid = () => {
    const filtered = projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(state.search.toLowerCase());
      const matchesStatus = state.status === 'All' || p.status === state.status;
      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="empty-state">No projects match your filters.</p>';
      return;
    }

    grid.innerHTML = filtered
      .map((p) =>
        projectCard(p, {
          assigneeName: userName(p.assignedTo),
          // Manager edita todos; collaborator edita (solo el estado) los suyos.
          canEdit: isManager || p.assignedTo === session.id,
          canDelete: isManager,
        })
      )
      .join('');
  };

  renderGrid();

  // Buscador: filtra por nombre conforme se escribe.
  container.querySelector('[data-role="search"]').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderGrid();
  });

  // Filtro de estado.
  container.querySelector('[data-role="status"]').addEventListener('change', (e) => {
    state.status = e.target.value;
    renderGrid();
  });

  // Delegación de eventos: un único listener en la rejilla maneja los botones
  // Editar/Eliminar de todas las tarjetas.
  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);

    if (btn.dataset.action === 'edit') {
      location.hash = `#/projects/edit/${id}`;
      return;
    }

    if (btn.dataset.action === 'delete') {
      const project = projects.find((p) => p.id === id);
      // Confirmación previa antes de una acción destructiva.
      const ok = await confirmModal({
        title: 'Delete project',
        message: `Delete "${project?.name}"? This cannot be undone.`,
        confirmText: 'Delete',
        danger: true,
      });
      if (!ok) return;

      try {
        await deleteProject(id);
        // Actualiza el estado local y repinta sin recargar la página.
        projects = projects.filter((p) => p.id !== id);
        renderGrid();
        showToast('Project deleted.', 'success');
      } catch {
        showToast('Failed to delete project.', 'error');
      }
    }
  });
};
