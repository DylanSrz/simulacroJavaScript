// Generic helper utilities.

/** Today's date as an ISO date string (YYYY-MM-DD). */
export const todayISO = () => new Date().toISOString().split('T')[0];

/** Human-friendly date formatting, falls back to the raw value. */
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

/** Escape user-provided text before injecting it into innerHTML. */
export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/** Maps a project status to a CSS modifier class for its badge. */
export const statusClass = (status) =>
  ({
    Pending: 'badge--pending',
    'In Progress': 'badge--progress',
    Completed: 'badge--completed',
  }[status] || 'badge--pending');

/** Returns the route id portion of the current hash, e.g. "#/projects/edit/3". */
export const getHashPath = () => location.hash || '#/login';
