// Form validation helpers. Each returns an error string or '' when valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value) => {
  const email = (value || '').trim();
  if (!email) return 'Email is required.';
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address.';
  return '';
};

export const validatePassword = (value) => {
  const password = value || '';
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
};

export const validateRequired = (value, label = 'This field') => {
  if (!value || !value.trim()) return `${label} is required.`;
  return '';
};

export const validateLength = (value, { min = 0, max = Infinity, label = 'This field' }) => {
  const text = (value || '').trim();
  if (text.length < min) return `${label} must be at least ${min} characters.`;
  if (text.length > max) return `${label} must be at most ${max} characters.`;
  return '';
};

const STATUSES = ['Pending', 'In Progress', 'Completed'];
export const validateStatus = (value) => {
  if (!STATUSES.includes(value)) return 'Select a valid status.';
  return '';
};

export const isValidStatus = (value) => STATUSES.includes(value);
export const PROJECT_STATUSES = STATUSES;
