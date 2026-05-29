// Top navigation bar. Shows links based on role and a logout button.
import { getSession, logout } from '../auth/authService.js';
import { escapeHtml } from '../utils/helpers.js';

const THEME_KEY = 'theme';

const applyTheme = (theme) => {
  document.body.classList.toggle('dark', theme === 'dark');
};

// Restore the saved theme as early as the navbar module loads.
applyTheme(localStorage.getItem(THEME_KEY) || 'light');

export const renderNavbar = () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const session = getSession();

  // Hide the navbar entirely on the login screen / when logged out.
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

  nav.querySelector('[data-action="logout"]').addEventListener('click', logout);

  nav.querySelector('[data-action="menu"]').addEventListener('click', () => {
    nav.querySelector('.navbar__menu').classList.toggle('navbar__menu--open');
  });

  nav.querySelector('[data-action="theme"]').addEventListener('click', () => {
    const next = (localStorage.getItem(THEME_KEY) || 'light') === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    renderNavbar();
  });
};
