/**
 * @file api/api.js
 * @description Capa de acceso a datos. Centraliza TODAS las llamadas HTTP a
 * json-server (la API REST simulada). Ningún otro módulo debería usar `fetch`
 * directamente: así, si cambia la URL base o el backend, solo se toca aquí.
 *
 * json-server expone automáticamente endpoints REST a partir de las colecciones
 * de `db.json` (`/users`, `/projects`), incluyendo filtros por query string
 * (p. ej. `/projects?assignedTo=2`).
 */

// URL base donde corre json-server (ver script "api" en package.json).
const BASE_URL = 'http://localhost:3001';

/**
 * Envoltorio sobre `fetch` que lanza un error en respuestas no exitosas (no-2xx)
 * para que quien llame pueda confiar en try/catch en lugar de comprobar
 * `response.ok` en cada sitio.
 *
 * @param {string} url - URL completa a la que hacer la petición.
 * @param {RequestInit} [options={}] - Opciones de fetch (método, headers, body…).
 * @returns {Promise<any|null>} El cuerpo parseado como JSON, o `null` si la
 *   respuesta no tiene contenido (HTTP 204, típico de DELETE).
 * @throws {Error} Si la respuesta HTTP no es exitosa (status fuera de 2xx).
 */
const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  // DELETE devuelve un cuerpo vacío en json-server.
  if (response.status === 204) return null;
  return response.json();
};

// Cabeceras reutilizables para peticiones que envían JSON en el body.
const jsonHeaders = { 'Content-Type': 'application/json' };

// --- Usuarios ---

/**
 * Obtiene la lista completa de usuarios.
 * Se usa para resolver nombres de responsables y poblar selects.
 * @returns {Promise<Array<object>>} Array de usuarios.
 */
export const getUsers = () => request(`${BASE_URL}/users`);

/**
 * Busca usuarios que coincidan con un email y contraseña exactos.
 * Es la consulta base del login (json-server filtra por query string).
 * @param {string} email - Email a buscar.
 * @param {string} password - Contraseña a buscar.
 * @returns {Promise<Array<object>>} Array (vacío si no hay coincidencias).
 */
export const getUserByCredentials = (email, password) =>
  request(
    `${BASE_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  );

// --- Proyectos ---

/**
 * Obtiene TODOS los proyectos (vista de manager).
 * @returns {Promise<Array<object>>} Array de proyectos.
 */
export const getProjects = () => request(`${BASE_URL}/projects`);

/**
 * Obtiene solo los proyectos asignados a un usuario (vista de collaborator).
 * @param {number} userId - ID del usuario responsable.
 * @returns {Promise<Array<object>>} Proyectos cuyo `assignedTo` coincide.
 */
export const getProjectsByUser = (userId) =>
  request(`${BASE_URL}/projects?assignedTo=${userId}`);

/**
 * Obtiene un único proyecto por su ID (para la pantalla de edición).
 * @param {number|string} id - ID del proyecto.
 * @returns {Promise<object>} El proyecto solicitado.
 */
export const getProjectById = (id) => request(`${BASE_URL}/projects/${id}`);

/**
 * Crea un nuevo proyecto (POST).
 * @param {object} data - Datos del proyecto (name, description, status,
 *   assignedTo, createdAt). json-server genera el `id` automáticamente.
 * @returns {Promise<object>} El proyecto creado, ya con su `id`.
 */
export const createProject = (data) =>
  request(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

/**
 * Actualiza parcialmente un proyecto (PATCH).
 * Se usa PATCH (no PUT) para poder enviar solo los campos que cambian
 * (p. ej. un collaborator que solo modifica `status`).
 * @param {number|string} id - ID del proyecto a actualizar.
 * @param {object} data - Campos a modificar.
 * @returns {Promise<object>} El proyecto ya actualizado.
 */
export const updateProject = (id, data) =>
  request(`${BASE_URL}/projects/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });

/**
 * Elimina un proyecto (DELETE).
 * @param {number|string} id - ID del proyecto a eliminar.
 * @returns {Promise<null>} `null` (json-server responde sin cuerpo).
 */
export const deleteProject = (id) =>
  request(`${BASE_URL}/projects/${id}`, { method: 'DELETE' });
