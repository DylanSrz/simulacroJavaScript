/**
 * @file components/navbar.js
 * @description Barra de navegación superior. Muestra los enlaces según el rol,
 * el nombre del usuario, el botón de logout y el toggle de modo oscuro.
 * Se oculta por completo cuando no hay sesión (pantalla de login).
 */
import { getSession, logout } from '../auth/authService.js';
import { escapeHtml } from '../utils/helpers.js';

// Clave de localStorage donde se guarda la preferencia de tema (light/dark).
const THEME_KEY = 'theme';

/**
 * Aplica un tema añadiendo o quitando la clase `dark` en el <body>.
 * Las variables CSS de `:root` y `body.dark` hacen el resto.
 * @param {('light'|'dark')} theme - Tema a aplicar.
 * @returns {void}
 */
const applyTheme = (theme) => {
  document.body.classList.toggle('dark', theme === 'dark');
};

// Restaura el tema guardado en cuanto se carga el módulo (evita parpadeos).
applyTheme(localStorage.getItem(THEME_KEY) || 'light');

/**
 * Renderiza (o re-renderiza) la barra de navegación según la sesión actual.
 * Sin sesión, vacía y oculta la barra. Con sesión, pinta los enlaces (los de
 * manager solo si corresponde) y engancha los eventos de logout, menú móvil
 * y cambio de tema.
 * @returns {void}
 */
export const renderNavbar = () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const session = getSession();

  // Oculta la barra por completo en el login / cuando no hay sesión.
  if (!session) {
    nav.innerHTML = '';
    nav.classList.remove('navbar--visible');
    return;
  }

  const isManager = session.role === 'manager';
  const currentTheme = localStorage.getItem(THEME_KEY) || 'light';

  nav.classList.add('navbar--visible');
  nav.innerHTML = `
    <div class="navbar__inner">
      <a href="#/dashboard" class="navbar__brand">📁 ProjectHub</a>
      <button class="navbar__toggle" data-action="menu" aria-label="Toggle menu">☰</button>
      <div class="navbar__menu">
        <a href="#/dashboard" class="navbar__link">Dashboard</a>
        <a href="#/projects" class="navbar__link">Projects</a>
        ${isManager ? '<a href="#/projects/new" class="navbar__link">New Project</a>' : ''}
        <button class="navbar__theme" data-action="theme" aria-label="Toggle dark mode">
          ${currentTheme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span class="navbar__user">${escapeHtml(session.name)} <small>(${escapeHtml(session.role)})</small></span>
        <button class="btn btn--small btn--ghost" data-action="logout">Logout</button>
      </div>
    </div>
  `;

  // Botón de cerrar sesión.
  nav.querySelector('[data-action="logout"]').addEventListener('click', logout);

  // Botón hamburguesa: despliega/colapsa el menú en móvil.
  nav.querySelector('[data-action="menu"]').addEventListener('click', () => {
    nav.querySelector('.navbar__menu').classList.toggle('navbar__menu--open');
  });

  // Toggle de modo oscuro: alterna el tema, lo persiste y repinta la barra.
  nav.querySelector('[data-action="theme"]').addEventListener('click', () => {
    const next = (localStorage.getItem(THEME_KEY) || 'light') === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    renderNavbar();
  });
};
