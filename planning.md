# 📋 Planning — simulacroJavaScript

> SPA de gestión de proyectos internos con autenticación, roles y json-server.

-----

## 🗂️ Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
1. [Configuración inicial](#2-configuración-inicial)
1. [Base de datos (db.json)](#3-base-de-datos-dbjson)
1. [Arquitectura SPA](#4-arquitectura-spa)
1. [Módulos a implementar](#5-módulos-a-implementar)
1. [Flujo de autenticación](#6-flujo-de-autenticación)
1. [Manejo de roles](#7-manejo-de-roles)
1. [CRUD de proyectos](#8-crud-de-proyectos)
1. [Dashboard](#9-dashboard)
1. [Protección de rutas](#10-protección-de-rutas)
1. [Interfaz y estilos](#11-interfaz-y-estilos)
1. [Puntos extra](#12-puntos-extra)
1. [README](#13-readme)
1. [Orden de desarrollo sugerido](#14-orden-de-desarrollo-sugerido)
1. [Rúbrica y checklist final](#15-rúbrica-y-checklist-final)

-----

## 1. Estructura del proyecto

```
simulacroJavaScript/
├── index.html
├── db.json
├── package.json
├── README.md
├── planning.md
└── src/
    ├── main.js                  # Punto de entrada, inicializa el router
    ├── router.js                # Lógica de navegación SPA (hash routing)
    ├── api/
    │   └── api.js               # Todas las llamadas a json-server (Fetch API)
    ├── auth/
    │   ├── authService.js       # Login, logout, sesión (localStorage)
    │   └── authGuard.js         # Protección de rutas según rol y sesión
    ├── views/
    │   ├── loginView.js         # Vista: formulario de login
    │   ├── dashboardView.js     # Vista: dashboard por rol
    │   ├── projectsView.js      # Vista: listado de proyectos
    │   ├── projectFormView.js   # Vista: crear / editar proyecto
    │   └── notFoundView.js      # Vista: 404
    ├── components/
    │   ├── navbar.js            # Barra de navegación con logout
    │   ├── projectCard.js       # Card/fila de un proyecto
    │   ├── modal.js             # Modal genérico (confirmar eliminar, etc.)
    │   ├── toast.js             # Notificaciones toast (punto extra)
    │   └── loader.js            # Spinner de carga (punto extra)
    ├── utils/
    │   ├── validators.js        # Validaciones de formularios
    │   └── helpers.js           # Funciones auxiliares (formateo de fechas, etc.)
    └── styles/
        ├── main.css             # Estilos globales + variables CSS
        ├── auth.css             # Estilos del login
        ├── dashboard.css        # Estilos del dashboard
        └── projects.css         # Estilos del listado y formulario
```

-----

## 2. Configuración inicial

### Tecnologías

|Herramienta                         |Uso                   |
|------------------------------------|----------------------|
|Vanilla JS (ES Modules)             |Lógica de la SPA      |
|Vite                                |Bundler y dev server  |
|json-server                         |API REST simulada     |
|TailwindCSS o CSS puro con variables|Estilos               |
|localStorage                        |Persistencia de sesión|

### Instalación de dependencias

```bash
npm create vite@latest simulacroJavaScript -- --template vanilla
cd simulacroJavaScript
npm install
npm install -D json-server
```

### Scripts en `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "api": "json-server --watch db.json --port 3001",
  "start": "concurrently \"npm run dev\" \"npm run api\""
}
```

> Instalar `concurrently` para correr ambos servidores juntos:
> 
> ```bash
> npm install -D concurrently
> ```

-----

## 3. Base de datos (db.json)

```json
{
  "users": [
    {
      "id": 1,
      "name": "Manager",
      "email": "manager@test.com",
      "password": "123456",
      "role": "manager"
    },
    {
      "id": 2,
      "name": "Collaborator",
      "email": "user@test.com",
      "password": "123456",
      "role": "collaborator"
    }
  ],
  "projects": [
    {
      "id": 1,
      "name": "Website Redesign",
      "description": "Corporate website redesign",
      "status": "In Progress",
      "assignedTo": 2,
      "createdAt": "2025-01-15"
    }
  ]
}
```

### Campos del proyecto

|Campo        |Tipo  |Descripción                                  |
|-------------|------|---------------------------------------------|
|`id`         |number|Autogenerado por json-server                 |
|`name`       |string|Nombre del proyecto                          |
|`description`|string|Descripción del proyecto                     |
|`status`     |string|`"Pending"` / `"In Progress"` / `"Completed"`|
|`assignedTo` |number|ID del usuario responsable                   |
|`createdAt`  |string|Fecha ISO (autogenerada al crear)            |

-----

## 4. Arquitectura SPA

### Estrategia de routing: Hash Routing

Se usará `window.location.hash` para navegar sin recargar la página.

**Rutas definidas:**

|Hash                 |Vista               |Acceso                         |
|---------------------|--------------------|-------------------------------|
|`#/login`            |Login               |Público                        |
|`#/dashboard`        |Dashboard           |Autenticado                    |
|`#/projects`         |Listado de proyectos|Autenticado                    |
|`#/projects/new`     |Formulario crear    |Solo Manager                   |
|`#/projects/edit/:id`|Formulario editar   |Autenticado (con restricciones)|
|`*`                  |404 Not Found       |Público                        |

### Flujo del router (`router.js`)

```
hashchange / load
      │
      ▼
authGuard.check(route)
      │
   ┌──┴──┐
   │     │
 Permitido  Denegado
   │           │
renderView()  redirect()
```

### Renderizado dinámico

Todas las vistas se renderizan dentro de un contenedor principal:

```html
<!-- index.html -->
<div id="app">
  <nav id="navbar"></nav>
  <main id="view-container"></main>
</div>
```

Cada vista exporta una función `render()` que devuelve HTML y registra eventos.

-----

## 5. Módulos a implementar

### `api/api.js`

Centraliza todos los fetch hacia `http://localhost:3001`.

```js
const BASE_URL = 'http://localhost:3001';

export const getUsers = () => fetch(`${BASE_URL}/users`).then(r => r.json());
export const getProjects = () => fetch(`${BASE_URL}/projects`).then(r => r.json());
export const getProjectById = (id) => fetch(`${BASE_URL}/projects/${id}`).then(r => r.json());
export const createProject = (data) => fetch(`${BASE_URL}/projects`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
export const updateProject = (id, data) => fetch(`${BASE_URL}/projects/${id}`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
export const deleteProject = (id) => fetch(`${BASE_URL}/projects/${id}`, { method: 'DELETE' });
```

### `auth/authService.js`

Maneja login, logout y lectura de sesión.

```js
// Guardar sesión
const saveSession = (user) => localStorage.setItem('session', JSON.stringify(user));

// Leer sesión
export const getSession = () => JSON.parse(localStorage.getItem('session'));

// Login: buscar usuario en json-server
export const login = async (email, password) => { /* ... */ };

// Logout: limpiar localStorage
export const logout = () => { localStorage.removeItem('session'); location.hash = '#/login'; };
```

### `auth/authGuard.js`

Protege las rutas antes de renderizar.

```js
export const guard = (requiredRole = null) => {
  const session = getSession();
  if (!session) { location.hash = '#/login'; return false; }
  if (requiredRole && session.role !== requiredRole) { location.hash = '#/dashboard'; return false; }
  return true;
};
```

-----

## 6. Flujo de autenticación

```
Usuario ingresa email + contraseña
            │
            ▼
  GET /users?email=...&password=...
            │
     ┌──────┴──────┐
     │             │
  Encontrado    No encontrado
     │             │
saveSession()   Mostrar error
     │
location.hash = '#/dashboard'
```

### Validaciones del formulario de login

- Email: campo requerido, formato válido (`validators.js`)
- Contraseña: campo requerido, mínimo 6 caracteres
- Mostrar mensajes de error debajo de cada campo

### Persistencia

- Sesión guardada en `localStorage` como objeto `{ id, name, email, role }`
- Al cargar la app (`main.js`), verificar si existe sesión activa
- Si existe → redirigir a `#/dashboard`
- Si no existe → redirigir a `#/login`

-----

## 7. Manejo de roles

|Acción                            |Manager|Collaborator      |
|----------------------------------|-------|------------------|
|Ver todos los proyectos           |✅      |❌ (solo asignados)|
|Crear proyecto                    |✅      |❌                 |
|Editar cualquier proyecto         |✅      |❌                 |
|Actualizar estado de su proyecto  |✅      |✅                 |
|Eliminar proyecto                 |✅      |❌                 |
|Ver detalles de cualquier proyecto|✅      |❌ (solo asignados)|

### Implementación en vistas

- El navbar mostrará u ocultará opciones según el rol
- Los botones de “Crear”, “Editar”, “Eliminar” se renderizan condicionalmente
- El `authGuard` redirige si se intenta acceder a una ruta no permitida

-----

## 8. CRUD de proyectos

### GET — Listar proyectos

**Manager:** `GET /projects` → todos  
**Collaborator:** `GET /projects?assignedTo={userId}` → solo los suyos

Mostrar en tabla o cards con:

- Nombre, descripción, estado, responsable
- Botones de acción según rol

### POST — Crear proyecto (solo Manager)

Campos del formulario:

- Nombre (requerido)
- Descripción (requerido)
- Estado (select: `Pending` / `In Progress` / `Completed`)
- Responsable (select con usuarios cargados desde `GET /users`)
- `createdAt` generado automáticamente con `new Date().toISOString().split('T')[0]`

### PATCH — Editar proyecto

**Manager:** puede editar todos los campos  
**Collaborator:** solo puede actualizar el campo `status` de sus proyectos

### DELETE — Eliminar proyecto (solo Manager)

- Mostrar modal de confirmación antes de eliminar
- Recargar lista después de eliminar

-----

## 9. Dashboard

### Vista Manager

```
┌─────────────────────────────────────────┐
│  📁 Total proyectos: 12                 │
│  🟡 En progreso: 5                      │
│  ✅ Finalizados: 4                      │
│  ⏳ Pendientes: 3                       │
└─────────────────────────────────────────┘
```

Obtener stats: `GET /projects` → contar por `status`

### Vista Collaborator

```
┌─────────────────────────────────────────┐
│  📂 Mis proyectos asignados: 3          │
│  ─────────────────────────────          │
│  Website Redesign     → In Progress     │
│  Mobile App           → Pending         │
│  API Integration      → Completed       │
└─────────────────────────────────────────┘
```

Obtener: `GET /projects?assignedTo={userId}`

-----

## 10. Protección de rutas

```js
// router.js — lógica de guardias por ruta
const routes = {
  '#/login':          { view: loginView,       guard: null },
  '#/dashboard':      { view: dashboardView,   guard: 'authenticated' },
  '#/projects':       { view: projectsView,    guard: 'authenticated' },
  '#/projects/new':   { view: projectFormView, guard: 'manager' },
  '#/projects/edit':  { view: projectFormView, guard: 'authenticated' },
};
```

**Reglas:**

1. Sin sesión → siempre redirigir a `#/login`
1. Con sesión en `#/login` → redirigir a `#/dashboard`
1. Collaborator en ruta de manager → redirigir a `#/dashboard`

-----

## 11. Interfaz y estilos

### Paleta y diseño sugerido

- Usar CSS variables en `:root` para colores y tipografía
- Layout responsivo con CSS Grid o Flexbox
- Navbar fija con nombre del usuario y botón de logout

### Componentes UI

|Componente |Descripción                                            |
|-----------|-------------------------------------------------------|
|Navbar     |Logo, links según rol, nombre usuario, logout          |
|Cards/Tabla|Listado de proyectos con badges de estado coloreados   |
|Formulario |Inputs validados con mensajes de error inline          |
|Modal      |Confirmación antes de eliminar                         |
|Toast      |Notificaciones de éxito/error (punto extra)            |
|Loader     |Spinner mientras se carga datos de la API (punto extra)|

### Responsive

- Mobile-first
- Breakpoints: `768px` (tablet), `1024px` (desktop)
- Navbar colapsable en móvil

-----

## 12. Puntos extra

|Feature                 |Implementación sugerida                                                       |
|------------------------|------------------------------------------------------------------------------|
|🌙 Dark Mode             |Toggle en navbar, clase `dark` en `<body>`, variables CSS alternas            |
|🔍 Buscador              |Input que filtra proyectos por nombre en el cliente                           |
|🏷️ Filtros por estado    |Botones/select que filtran por `status`                                       |
|📄 Paginación            |Mostrar N proyectos por página, botones prev/next                             |
|🔔 Toasts                |Componente `toast.js` con auto-dismiss a los 3s                               |
|⏳ Loader                |Mostrar spinner durante cada llamada a la API                                 |
|🚀 Deploy                |Vite build + GitHub Pages / Vercel (frontend) + Railway / Render (json-server)|
|✅ Validaciones avanzadas|No nombres duplicados, longitud mínima/máxima, sanitización                   |

-----

## 13. README

El README debe redactarse **en inglés** e incluir:

- [ ] Project Name & Description
- [ ] Technologies used
- [ ] Installation steps
- [ ] Running the project (`npm run dev`)
- [ ] Running JSON Server (`npm run api`)
- [ ] Test Users (email + password + role)
- [ ] Project Structure (árbol de carpetas)
- [ ] Role Permissions (tabla)
- [ ] Technical Decisions (por qué hash routing, por qué localStorage, etc.)

-----

## 14. Orden de desarrollo sugerido

```
Día / Etapa 1 — Base
  ✅ Crear estructura de carpetas y archivos vacíos
  ✅ Configurar Vite + json-server
  ✅ Crear db.json con usuarios y proyecto de ejemplo
  ✅ Implementar router.js (hash routing básico)

Día / Etapa 2 — Autenticación
  ✅ Vista loginView.js con formulario
  ✅ authService.js: login, logout, getSession
  ✅ authGuard.js: protección de rutas
  ✅ Persistencia en localStorage
  ✅ Navbar con logout y datos del usuario

Día / Etapa 3 — Proyectos (Manager)
  ✅ api.js: todos los endpoints
  ✅ projectsView.js: listar todos los proyectos
  ✅ projectFormView.js: crear proyecto (POST)
  ✅ Editar proyecto (PATCH)
  ✅ Eliminar proyecto (DELETE) con modal de confirmación

Día / Etapa 4 — Roles (Collaborator)
  ✅ Filtrar proyectos por assignedTo
  ✅ Ocultar botones según rol
  ✅ Solo actualizar status desde collaborator
  ✅ Bloquear rutas administrativas

Día / Etapa 5 — Dashboard + Pulido
  ✅ dashboardView.js por rol
  ✅ Responsive design
  ✅ Validaciones de formularios
  ✅ Manejo de errores en todas las vistas
  ✅ README.md completo

Día / Etapa 6 — Puntos extra (opcionales)
  ☐ Dark mode
  ☐ Buscador
  ☐ Filtros
  ☐ Toasts y Loader
  ☐ Deploy
```

-----

## 15. Rúbrica y checklist final

|Criterio                      |%  |Checklist                                                     |
|------------------------------|---|--------------------------------------------------------------|
|Cumplimiento de requerimientos|15%|Login ✓, Roles ✓, CRUD ✓, Protección ✓, Dashboard ✓           |
|JavaScript                    |10%|Módulos ES6 ✓, Eventos ✓, DOM ✓, async/await ✓                |
|Arquitectura SPA              |15%|Hash routing ✓, sin recargas ✓, renderizado dinámico ✓        |
|CRUD y consumo API            |15%|GET ✓, POST ✓, PATCH ✓, DELETE ✓, json-server ✓               |
|Persistencia de sesión        |10%|localStorage ✓, logout limpia datos ✓, persiste al refrescar ✓|
|Documentación                 |10%|README en inglés ✓, todas las secciones ✓                     |
|Sustentación técnica          |25%|Saber explicar cada decisión técnica tomada                   |


> **Tip para la sustentación:** Preparar respuestas para preguntas como:
> 
> - ¿Por qué usaste hash routing y no History API?
> - ¿Por qué localStorage y no sessionStorage?
> - ¿Cómo funciona tu sistema de protección de rutas?
> - ¿Cómo diferencias las vistas según el rol del usuario?
> - ¿Qué harías diferente si tuvieras más tiempo?