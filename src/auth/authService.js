// Handles login, logout and session persistence in localStorage.
import { getUserByCredentials } from '../api/api.js';

const SESSION_KEY = 'session';

// Store only what we need; never persist the password.
const saveSession = (user) => {
  const { id, name, email, role } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id, name, email, role }));
};

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

export const isAuthenticated = () => getSession() !== null;

export const isManager = () => getSession()?.role === 'manager';

/**
 * Looks up the user in json-server by email + password.
 * Returns the user on success, throws on invalid credentials.
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

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  location.hash = '#/login';
};
