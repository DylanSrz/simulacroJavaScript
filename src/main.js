// App entry point.
import './styles/main.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/projects.css';

import { initRouter } from './router.js';
import { getSession } from './auth/authService.js';

// On boot, point the user at the right place if no hash is present.
if (!location.hash) {
  location.hash = getSession() ? '#/dashboard' : '#/login';
}

initRouter();
