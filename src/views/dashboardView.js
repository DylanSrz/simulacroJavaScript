// Dashboard view: stats for managers, assigned list for collaborators.
import { getSession } from '../auth/authService.js';
import { getProjects, getProjectsByUser } from '../api/api.js';
import { showLoader } from '../components/loader.js';
import { showToast } from '../components/toast.js';
import { escapeHtml, statusClass } from '../utils/helpers.js';

const managerDashboard = (projects) => {
  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === 'In Progress').length;
  const completed = projects.filter((p) => p.status === 'Completed').length;
  const pending = projects.filter((p) => p.status === 'Pending').length;

  return `
    <h1 class="page__title">Manager Dashboard</h1>
    <div class="stats">
      <div class="stat stat--total"><span class="stat__icon">📁</span><span class="stat__value">${total}</span><span class="stat__label">Total projects</span></div>
      <div class="stat stat--progress"><span class="stat__icon">🟡</span><span class="stat__value">${inProgress}</span><span class="stat__label">In progress</span></div>
      <div class="stat stat--completed"><span class="stat__icon">✅</span><span class="stat__value">${completed}</span><span class="stat__label">Completed</span></div>
      <div class="stat stat--pending"><span class="stat__icon">⏳</span><span class="stat__value">${pending}</span><span class="stat__label">Pending</span></div>
    </div>
    <a href="#/projects" class="btn btn--primary">View all projects</a>
  `;
};

const collaboratorDashboard = (projects) => {
  const rows = projects
    .map(
      (p) => `
      <li class="mylist__item">
        <span class="mylist__name">${escapeHtml(p.name)}</span>
        <span class="badge ${statusClass(p.status)}">${escapeHtml(p.status)}</span>
      </li>`
    )
    .join('');

  return `
    <h1 class="page__title">My Dashboard</h1>
    <div class="stat stat--total stat--wide">
      <span class="stat__icon">📂</span>
      <span class="stat__value">${projects.length}</span>
      <span class="stat__label">My assigned projects</span>
    </div>
    <ul class="mylist">
      ${rows || '<li class="mylist__item mylist__empty">No projects assigned yet.</li>'}
    </ul>
    <a href="#/projects" class="btn btn--primary">View my projects</a>
  `;
};

export const dashboardView = async () => {
  const container = document.getElementById('view-container');
  const session = getSession();
  showLoader(container, 'Loading dashboard…');

  try {
    const projects =
      session.role === 'manager'
        ? await getProjects()
        : await getProjectsByUser(session.id);

    container.innerHTML = `<section class="page">${
      session.role === 'manager'
        ? managerDashboard(projects)
        : collaboratorDashboard(projects)
    }</section>`;
  } catch (err) {
    container.innerHTML = `<section class="page"><p class="error-state">Could not load the dashboard. Is json-server running?</p></section>`;
    showToast('Failed to load dashboard.', 'error');
  }
};
