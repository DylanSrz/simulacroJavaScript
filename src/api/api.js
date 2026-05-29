// Centralizes all fetch calls to json-server.
const BASE_URL = 'http://localhost:3001';

/**
 * Small wrapper around fetch that throws on non-2xx responses so callers
 * can rely on try/catch instead of manually checking response.ok everywhere.
 */
const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  // DELETE returns an empty body in json-server.
  if (response.status === 204) return null;
  return response.json();
};

const jsonHeaders = { 'Content-Type': 'application/json' };

// --- Users ---
export const getUsers = () => request(`${BASE_URL}/users`);

export const getUserByCredentials = (email, password) =>
  request(
    `${BASE_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );

// --- Projects ---
export const getProjects = () => request(`${BASE_URL}/projects`);

export const getProjectsByUser = (userId) =>
  request(`${BASE_URL}/projects?assignedTo=${userId}`);

export const getProjectById = (id) => request(`${BASE_URL}/projects/${id}`);

export const createProject = (data) =>
  request(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

export const updateProject = (id, data) =>
  request(`${BASE_URL}/projects/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

export const deleteProject = (id) =>
  request(`${BASE_URL}/projects/${id}`, { method: 'DELETE' });
