/**
 * @file views/loginView.js
 * @description Vista de login. Pinta el formulario de credenciales, valida los
 * campos en el cliente y, si todo es correcto, delega en `authService.login`.
 */
import { login } from '../auth/authService.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { showToast } from '../components/toast.js';

/**
 * Renderiza la vista de login dentro de #view-container y engancha el submit.
 * Es una ruta pública: el router la muestra cuando NO hay sesión.
 * @returns {void}
 */
export const loginView = () => {
  const container = document.getElementById('view-container');
  container.innerHTML = `
    <section class="auth">
      <form class="auth__card" id="login-form" novalidate>
        <h1 class="auth__title">📁 ProjectHub</h1>
        <p class="auth__subtitle">Sign in to manage your projects</p>

        <label class="field">
          <span class="field__label">Email</span>
          <input type="email" name="email" class="field__input" autocomplete="username" placeholder="manager@test.com" />
          <small class="field__error" data-error="email"></small>
        </label>

        <label class="field">
          <span class="field__label">Password</span>
          <input type="password" name="password" class="field__input" autocomplete="current-password" placeholder="••••••" />
          <small class="field__error" data-error="password"></small>
        </label>

        <button type="submit" class="btn btn--primary btn--block">Sign in</button>

        <div class="auth__hint">
          <strong>Test users</strong>
          <span>manager@test.com / 123456</span>
          <span>user@test.com / 123456</span>
        </div>
      </form>
    </section>
  `;

  const form = container.querySelector('#login-form');

  /**
   * Escribe (o limpia) el mensaje de error de un campo concreto.
   * @param {('email'|'password')} field - Campo objetivo.
   * @param {string} msg - Mensaje de error ('' para limpiar).
   */
  const setError = (field, msg) => {
    form.querySelector(`[data-error="${field}"]`).textContent = msg;
  };

  // Maneja el envío del formulario: valida, llama al login y redirige.
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    // Validación en cliente antes de tocar la API.
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setError('email', emailErr);
    setError('password', passErr);
    if (emailErr || passErr) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      location.hash = '#/dashboard';
    } catch (err) {
      // Credenciales inválidas: se muestra el error bajo el campo de contraseña.
      setError('password', err.message);
      showToast('Login failed.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';
    }
  });
};
