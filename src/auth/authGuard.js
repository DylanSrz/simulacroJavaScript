// Route protection based on session and role.
import { getSession } from './authService.js';

/**
 * Decides whether the current session may access a route.
 * @param {('authenticated'|'manager'|null)} requiredRole
 * @returns {boolean} true if access is allowed, false if a redirect happened.
 */
export const guard = (requiredRole = null) => {
  const session = getSession();

  // Public routes (guard === null) are always allowed.
  if (!requiredRole) return true;

  // Any protected route requires a session.
  if (!session) {
    location.hash = '#/login';
    return false;
  }

  // Manager-only routes block collaborators.
  if (requiredRole === 'manager' && session.role !== 'manager') {
    location.hash = '#/dashboard';
    return false;
  }

  return true;
};
