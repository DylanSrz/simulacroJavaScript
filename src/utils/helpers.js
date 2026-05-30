/**
 * @file utils/helpers.js
 * @description Funciones auxiliares de propósito general: fechas, escapado de
 * HTML y mapeo de estados a clases CSS. Sin dependencias de otros módulos.
 */

/**
 * Devuelve la fecha de hoy como string ISO de solo fecha (YYYY-MM-DD).
 * Se usa para rellenar `createdAt` al crear un proyecto.
 * @returns {string} Fecha actual en formato YYYY-MM-DD.
 */
export const todayISO = () => new Date().toISOString().split('T')[0];

/**
 * Formatea una fecha ISO a un formato legible (p. ej. "Jan 15, 2025").
 * Si el valor es inválido, devuelve el valor original; si falta, devuelve "—".
 * @param {string} isoDate - Fecha en formato ISO.
 * @returns {string} Fecha formateada para mostrar al usuario.
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Escapa texto del usuario antes de inyectarlo con innerHTML.
 * Previene inyección de HTML/XSS al renderizar nombres, descripciones, etc.
 * @param {*} value - Valor a escapar (se convierte a string).
 * @returns {string} Texto con los caracteres especiales escapados.
 */
export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Mapea un estado de proyecto a su clase CSS de badge (color del distintivo).
 * @param {string} status - Estado del proyecto.
 * @returns {string} Nombre de la clase CSS modificadora del badge.
 */
export const statusClass = (status) =>
  ({
    Pending: 'badge--pending',
    'In Progress': 'badge--progress',
    Completed: 'badge--completed',
  }[status] || 'badge--pending');

/**
 * Devuelve el hash actual de la URL, con `#/login` como valor por defecto.
 * @returns {string} Hash de la ruta actual (p. ej. "#/projects/edit/3").
 */
export const getHashPath = () => location.hash || '#/login';
