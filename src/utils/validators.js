/**
 * @file utils/validators.js
 * @description Validadores reutilizables de formularios. Convención: cada
 * función devuelve un STRING con el mensaje de error, o una cadena vacía `''`
 * cuando el valor es válido. Así, en las vistas basta con `if (error) {...}`.
 */

// Expresión regular sencilla para validar el formato de un email.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida un email: requerido y con formato correcto.
 * @param {string} value - Valor del campo email.
 * @returns {string} Mensaje de error, o '' si es válido.
 */
export const validateEmail = (value) => {
  const email = (value || '').trim();
  if (!email) return 'Email is required.';
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address.';
  return '';
};

/**
 * Valida una contraseña: requerida y de al menos 6 caracteres.
 * @param {string} value - Valor del campo contraseña.
 * @returns {string} Mensaje de error, o '' si es válida.
 */
export const validatePassword = (value) => {
  const password = value || '';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
};

/**
 * Valida que un campo no esté vacío.
 * @param {string} value - Valor a comprobar.
 * @param {string} [label='This field'] - Nombre del campo para el mensaje.
 * @returns {string} Mensaje de error, o '' si tiene contenido.
 */
export const validateRequired = (value, label = 'This field') => {
  if (!value || !value.trim()) return `${label} is required.`;
  return '';
};

/**
 * Valida la longitud de un texto dentro de un rango.
 * @param {string} value - Texto a validar.
 * @param {object} opts - Opciones.
 * @param {number} [opts.min=0] - Longitud mínima.
 * @param {number} [opts.max=Infinity] - Longitud máxima.
 * @param {string} [opts.label='This field'] - Nombre del campo para el mensaje.
 * @returns {string} Mensaje de error, o '' si la longitud es válida.
 */
export const validateLength = (value, { min = 0, max = Infinity, label = 'This field' }) => {
  const text = (value || '').trim();
  if (text.length < min) return `${label} must be at least ${min} characters.`;
  if (text.length > max) return `${label} must be at most ${max} characters.`;
  return '';
};

// Estados válidos para un proyecto. Fuente única de verdad para selects y validación.
const STATUSES = ['Pending', 'In Progress', 'Completed'];

/**
 * Valida que el estado sea uno de los permitidos.
 * @param {string} value - Estado a validar.
 * @returns {string} Mensaje de error, o '' si es un estado válido.
 */
export const validateStatus = (value) => {
  if (!STATUSES.includes(value)) return 'Select a valid status.';
  return '';
};

/**
 * Comprueba si un valor es un estado de proyecto válido.
 * @param {string} value - Estado a comprobar.
 * @returns {boolean} `true` si está dentro de los estados permitidos.
 */
export const isValidStatus = (value) => STATUSES.includes(value);

/**
 * Lista de estados de proyecto disponibles (para poblar selects/filtros).
 * @type {string[]}
 */
export const PROJECT_STATUSES = STATUSES;
