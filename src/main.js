/**
 * @file main.js
 * @description Punto de entrada de la aplicación. Importa los estilos globales,
 * decide el hash inicial según haya sesión o no, y arranca el router.
 * Es el archivo que `index.html` carga como módulo.
 */
import './styles/main.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/projects.css';

import { initRouter } from './router.js';
import { getSession } from './auth/authService.js';

// Al arrancar, si no hay hash en la URL, mandamos al usuario al sitio correcto:
// al dashboard si ya tiene sesión, o al login si no.
if (!location.hash) {
  location.hash = getSession() ? '#/dashboard' : '#/login';
}

// A partir de aquí, el router se encarga de toda la navegación.
initRouter();
