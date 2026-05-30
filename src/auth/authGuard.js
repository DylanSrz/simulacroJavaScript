/**
 * @file auth/authGuard.js
 * @description Guardián de rutas. Decide, antes de renderizar una vista, si la
 * sesión actual puede acceder a ella. Si no puede, redirige (cambiando el hash)
 * y el router se vuelve a ejecutar automáticamente.
 *
 * Reglas:
 *   1. Ruta pública (sin rol requerido) → siempre permitida.
 *   2. Ruta protegida sin sesión → redirige a #/login.
 *   3. Ruta de manager con un collaborator → redirige a #/dashboard.
 */
import { getSession } from './authService.js';

/**
 * Comprueba si la sesión actual puede acceder a una ruta.
 *
 * @param {('authenticated'|'manager'|null)} [requiredRole=null] - Nivel de
 *   acceso exigido por la ruta:
 *   - `null`: ruta pública (login, 404).
 *   - `'authenticated'`: requiere sesión, cualquier rol.
 *   - `'manager'`: requiere sesión con rol manager.
 * @returns {boolean} `true` si se permite el acceso; `false` si se ha
 *   disparado una redirección (el router reaccionará al cambio de hash).
 */
export const guard = (requiredRole = null) => {
  const session = getSession();

  // Las rutas públicas (guard === null) siempre se permiten.
  if (!requiredRole) return true;

  // Cualquier ruta protegida requiere una sesión.
  if (!session) {
    location.hash = '#/login';
    return false;
  }

  // Las rutas solo-manager bloquean a los collaborators.
  if (requiredRole === 'manager' && session.role !== 'manager') {
    location.hash = '#/dashboard';
    return false;
  }

  return true;
};
