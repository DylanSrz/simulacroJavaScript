/**
 * @file auth/authService.js
 * @description Servicio de autenticación. Gestiona el login, el logout y la
 * persistencia de la sesión en `localStorage`.
 *
 * Decisión técnica: se usa `localStorage` (y no `sessionStorage`) para que la
 * sesión sobreviva a recargas de página y reinicios del navegador. Solo se
 * guardan datos NO sensibles (id, name, email, role); nunca la contraseña.
 */
import { getUserByCredentials } from '../api/api.js';

// Clave bajo la que se guarda la sesión en localStorage.
const SESSION_KEY = 'session';

/**
 * Guarda la sesión en localStorage, quedándonos solo con los campos necesarios.
 * Importante: se descarta la contraseña antes de persistir.
 * @param {object} user - Usuario devuelto por la API.
 * @returns {void}
 */
const saveSession = (user) => {
  const { id, name, email, role } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id, name, email, role }));
};

/**
 * Lee la sesión activa desde localStorage.
 * Si el dato está corrupto, lo limpia y devuelve null para no romper la app.
 * @returns {{id:number, name:string, email:string, role:string}|null}
 *   El objeto de sesión, o `null` si no hay sesión iniciada.
 */
export const getSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

/**
 * Indica si hay un usuario autenticado.
 * @returns {boolean} `true` si existe una sesión activa.
 */
export const isAuthenticated = () => getSession() !== null;

/**
 * Indica si el usuario actual tiene rol de manager.
 * @returns {boolean} `true` si el rol de la sesión es "manager".
 */
export const isManager = () => getSession()?.role === 'manager';

/**
 * Inicia sesión: busca al usuario en json-server por email + contraseña.
 * Si lo encuentra, guarda la sesión; si no, lanza un error.
 * @param {string} email - Email introducido.
 * @param {string} password - Contraseña introducida.
 * @returns {Promise<object>} El usuario autenticado.
 * @throws {Error} "Invalid email or password." si no hay coincidencias.
 */
export const login = async (email, password) => {
  const matches = await getUserByCredentials(email, password);
  if (!matches || matches.length === 0) {
    throw new Error('Invalid email or password.');
  }
  const user = matches[0];
  saveSession(user);
  return user;
};

/**
 * Cierra la sesión: borra los datos de localStorage y redirige al login.
 * @returns {void}
 */
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  location.hash = '#/login';
};
