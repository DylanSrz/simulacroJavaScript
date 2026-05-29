// Hash-based SPA router with per-route guards.
import { guard } from './auth/authGuard.js';
import { getSession } from './auth/authService.js';
import { renderNavbar } from './components/navbar.js';
import { loginView } from './views/loginView.js';
import { dashboardView } from './views/dashboardView.js';
import { projectsView } from './views/projectsView.js';
import { projectFormView } from './views/projectFormView.js';
import { notFoundView } from './views/notFoundView.js';

// Static routes. Dynamic ones (edit/:id) are handled separately below.
const routes = {
  '#/login': { view: loginView, role: null },
  '#/dashboard': { view: dashboardView, role: 'authenticated' },
  '#/projects': { view: projectsView, role: 'authenticated' },
  '#/projects/new': { view: projectFormView, role: 'manager' },
};

/**
 * Resolves the current hash to a route definition + params.
 * @returns {{ view: Function, role: string|null, params: object }}
 */
const resolve = (hash) => {
  // Dynamic edit route: #/projects/edit/:id
  const editMatch = hash.match(/^#\/projects\/edit\/(\w+)$/);
  if (editMatch) {
    return {
      view: projectFormView,
      role: 'authenticated',
      params: { id: editMatch[1] },
    };
  }

  const route = routes[hash];
  if (route) return { ...route, params: {} };

  return null;
};

const render = async () => {
  let hash = location.hash || '#/login';

  // Root → send to dashboard (if logged) or login.
  if (hash === '#/' || hash === '#') {
    hash = getSession() ? '#/dashboard' : '#/login';
    location.hash = hash;
    return;
  }

  // Logged-in users shouldn't see the login page.
  if (hash === '#/login' && getSession()) {
    location.hash = '#/dashboard';
    return;
  }

  const match = resolve(hash);

  // Unknown route → 404.
  if (!match) {
    renderNavbar();
    notFoundView();
    return;
  }

  // Guard the route; guard() handles redirects internally.
  const role = match.role === 'authenticated' ? 'authenticated' : match.role;
  if (!guard(role)) return; // a redirect (hashchange) will re-trigger render.

  renderNavbar();
  await match.view(match.params);
};

export const initRouter = () => {
  window.addEventListener('hashchange', render);
  window.addEventListener('load', render);
  // In case the module loads after 'load' already fired.
  if (document.readyState === 'complete') render();
};
