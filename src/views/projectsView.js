// Projects listing view with search + status filters.
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

export const projectsView = async () => {
  const container = document.getElementById('view-container');
  const session = getSession();
  const isManager = session.role === 'manager';
  showLoader(container, 'Loading projects…');

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

  const userName = (id) => users.find((u) => u.id === id)?.name || 'Unassigned';

  // Client-side filter state (extra features: search + status filter).
  const state = { search: '', status: 'All' };

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
          // Managers can edit all; collaborators can edit (status only) their own.
          canEdit: isManager || p.assignedTo === session.id,
          canDelete: isManager,
        })
      )
      .join('');
  };

  renderGrid();

  container.querySelector('[data-role="search"]').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderGrid();
  });

  container.querySelector('[data-role="status"]').addEventListener('change', (e) => {
    state.status = e.target.value;
    renderGrid();
  });

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
      const ok = await confirmModal({
        title: 'Delete project',
        message: `Delete "${project?.name}"? This cannot be undone.`,
        confirmText: 'Delete',
        danger: true,
      });
      if (!ok) return;

      try {
        await deleteProject(id);
        projects = projects.filter((p) => p.id !== id);
        renderGrid();
        showToast('Project deleted.', 'success');
      } catch {
        showToast('Failed to delete project.', 'error');
      }
    }
  });
};
