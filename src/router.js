/**
 * @file router.js
 * @description Router de la SPA basado en "hash routing" (`window.location.hash`).
 *
 * Decisión técnica: se usa hash routing (y no la History API) porque funciona
 * en cualquier hosting estático sin configurar reescrituras en el servidor: el
 * navegador nunca pide la ruta al servidor, solo cambia lo que va después de `#`.
 * El evento `hashchange` nos da un gancho simple y fiable para re-renderizar.
 *
 * Flujo: hashchange/load → guard(rol) → renderView() o redirect().
 */
import { guard } from './auth/authGuard.js';
import { getSession } from './auth/authService.js';
import { renderNavbar } from './components/navbar.js';
import { loginView } from './views/loginView.js';
import { dashboardView } from './views/dashboardView.js';
import { projectsView } from './views/projectsView.js';
import { projectFormView } from './views/projectFormView.js';
import { notFoundView } from './views/notFoundView.js';

/**
 * Tabla de rutas estáticas. Cada entrada asocia un hash con su vista y el rol
 * mínimo requerido. Las rutas dinámicas (editar/:id) se resuelven aparte.
 * @type {Object<string, {view: Function, role: ('authenticated'|'manager'|null)}>}
 */
const routes = {
  '#/login': { view: loginView, role: null },
  '#/dashboard': { view: dashboardView, role: 'authenticated' },
  '#/projects': { view: projectsView, role: 'authenticated' },
  '#/projects/new': { view: projectFormView, role: 'manager' },
};

/**
 * Resuelve el hash actual a una definición de ruta + parámetros.
 * Primero intenta la ruta dinámica de edición; si no, busca en la tabla estática.
 *
 * @param {string} hash - Hash actual (p. ej. "#/projects/edit/3").
 * @returns {{view: Function, role: string|null, params: object}|null}
 *   La ruta resuelta, o `null` si el hash no corresponde a ninguna ruta (404).
 */
const resolve = (hash) => {
  // Ruta dinámica de edición: #/projects/edit/:id
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

/**
 * Renderiza la vista correspondiente al hash actual.
 * Gestiona redirecciones de cortesía (raíz, login estando ya logueado),
 * el 404 y la aplicación del guardián de rutas antes de pintar.
 *
 * @returns {Promise<void>}
 */
const render = async () => {
  let hash = location.hash || '#/login';

  // Raíz → al dashboard (si hay sesión) o al login.
  if (hash === '#/' || hash === '#') {
    hash = getSession() ? '#/dashboard' : '#/login';
    location.hash = hash;
    return;
  }

  // Un usuario logueado no debería ver la pantalla de login.
  if (hash === '#/login' && getSession()) {
    location.hash = '#/dashboard';
    return;
  }

  const match = resolve(hash);

  // Ruta desconocida → 404.
  if (!match) {
    renderNavbar();
    notFoundView();
    return;
  }

  // Se aplica el guardián; guard() gestiona internamente las redirecciones.
  const role = match.role === 'authenticated' ? 'authenticated' : match.role;
  if (!guard(role)) return; // una redirección (hashchange) re-disparará render().

  renderNavbar();
  await match.view(match.params);
};

/**
 * Arranca el router: se suscribe a los eventos de navegación y hace el primer
 * render. Es lo único que `main.js` necesita llamar.
 * @returns {void}
 */
export const initRouter = () => {
  window.addEventListener('hashchange', render);
  window.addEventListener('load', render);
  // Por si el módulo se carga después de que 'load' ya se haya disparado.
  if (document.readyState === 'complete') render();
};
