# 🧭 Guía del Proyecto — ProjectHub (recorrido del flujo completo)

> Documento de apoyo para **explicar el proyecto a tus compañeros**.
> Recorre la aplicación de principio a fin: arquitectura, arranque, navegación,
> autenticación, roles, CRUD y las decisiones técnicas que hay detrás.

---

## 📑 Índice

1. [¿Qué es y cómo está organizado?](#1-qué-es-y-cómo-está-organizado)
2. [Las dos piezas que corren a la vez](#2-las-dos-piezas-que-corren-a-la-vez)
3. [Arranque de la app (paso a paso)](#3-arranque-de-la-app-paso-a-paso)
4. [El router: el corazón de la SPA](#4-el-router-el-corazón-de-la-spa)
5. [Flujo de autenticación (login)](#5-flujo-de-autenticación-login)
6. [Protección de rutas (authGuard)](#6-protección-de-rutas-authguard)
7. [Manejo de roles](#7-manejo-de-roles)
8. [CRUD de proyectos (las 4 operaciones)](#8-crud-de-proyectos-las-4-operaciones)
9. [Capa de datos (api.js)](#9-capa-de-datos-apijs)
10. [Recorrido visual: 3 escenarios completos](#10-recorrido-visual-3-escenarios-completos)
11. [Decisiones técnicas (preguntas de defensa)](#11-decisiones-técnicas-preguntas-de-defensa)
12. [Glosario rápido](#12-glosario-rápido)

---

## 1. ¿Qué es y cómo está organizado?

**ProjectHub** es una **SPA** (Single Page Application) de gestión de proyectos
internos. "Single Page" significa que la página **nunca se recarga**: el
JavaScript intercambia el contenido del `<main>` según la URL.

La arquitectura separa responsabilidades en capas. Cada archivo tiene un único
trabajo:

```
src/
├── main.js          → Punto de entrada. Importa estilos y arranca el router.
├── router.js        → Decide qué vista mostrar según la URL (#hash).
│
├── api/api.js       → CAPA DE DATOS. Únicas llamadas HTTP a json-server.
│
├── auth/
│   ├── authService.js → Login, logout y sesión (localStorage).
│   └── authGuard.js   → ¿Puede esta sesión ver esta ruta? Sí/No.
│
├── views/           → PANTALLAS. Cada una devuelve HTML y engancha eventos.
│   ├── loginView.js
│   ├── dashboardView.js
│   ├── projectsView.js
│   ├── projectFormView.js
│   └── notFoundView.js
│
├── components/      → PIEZAS REUTILIZABLES usadas por las vistas.
│   ├── navbar.js
│   ├── projectCard.js
│   ├── modal.js
│   ├── toast.js
│   └── loader.js
│
└── utils/           → FUNCIONES AUXILIARES sin estado.
    ├── validators.js
    └── helpers.js
```

> 💡 **Idea clave para explicar:** el flujo de dependencias va siempre en una
> dirección: `vistas → componentes/utils → api`. Las vistas no hablan entre
> sí; el **router** es quien las coordina.

---

## 2. Las dos piezas que corren a la vez

El proyecto necesita **dos procesos** levantados simultáneamente:

| Proceso | Comando | Puerto | Qué es |
| --- | --- | --- | --- |
| Frontend | `npm run dev` | `5173` | El servidor de desarrollo de **Vite** (sirve la SPA). |
| API | `npm run api` | `3001` | **json-server**, que convierte `db.json` en una API REST. |

El comando `npm run start` los arranca a la vez con `concurrently`.

```
┌──────────────────┐        fetch (HTTP)        ┌──────────────────┐
│  Navegador        │  ───────────────────────▶ │  json-server      │
│  (SPA en :5173)   │ ◀───────────────────────  │  (API en :3001)   │
│                   │        JSON                │   lee/escribe      │
└──────────────────┘                            │   db.json          │
                                                 └──────────────────┘
```

> 🗣️ Si la API no está levantada, las vistas muestran el mensaje
> *"Is json-server running?"*. Es el error más común al presentar: **levanta
> los dos procesos**.

---

## 3. Arranque de la app (paso a paso)

Qué ocurre desde que abres `http://localhost:5173`:

1. El navegador carga **`index.html`**, que tiene tres contenedores clave:
   ```html
   <nav id="navbar"></nav>           <!-- la barra de navegación -->
   <main id="view-container"></main> <!-- aquí se pintan las vistas -->
   <div id="modal-root"></div>       <!-- modales -->
   <div id="toast-root"></div>       <!-- notificaciones -->
   ```
2. `index.html` carga **`main.js`** como módulo (`<script type="module">`).
3. **`main.js`**:
   - Importa los 4 archivos CSS (Vite los empaqueta).
   - Si la URL no tiene hash, decide el destino inicial: `#/dashboard` si ya
     hay sesión guardada, o `#/login` si no.
   - Llama a **`initRouter()`**.
4. **`initRouter()`** se suscribe a los eventos `hashchange` y `load`, y dispara
   el primer **`render()`**.

A partir de aquí, **toda la navegación la maneja el router**.

---

## 4. El router: el corazón de la SPA

`router.js` es el cerebro. Cada vez que cambia el hash de la URL (porque el
usuario hace clic en un enlace `#/...` o se redirige por código), se ejecuta
`render()`:

```
        Cambia el hash (#/...)  ──►  se dispara render()
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 ▼                         ▼                        ▼
        ¿Es la raíz (#/)?         ¿Es #/login con          resolve(hash):
        → redirige a              sesión activa?           ¿qué vista toca?
        dashboard o login         → redirige a dashboard         │
                                                    ┌─────────────┴─────────────┐
                                                    ▼                           ▼
                                          No coincide ninguna ruta      Coincide una ruta
                                          → notFoundView() (404)              │
                                                                  guard(rol): ¿permitido?
                                                                    ┌─────────┴─────────┐
                                                                    ▼                   ▼
                                                                  Sí                  No
                                                          renderNavbar()        guard ya redirigió
                                                          + view(params)        (otro render se dispara)
```

**Tabla de rutas** (en `router.js`):

| Hash | Vista | Rol requerido |
| --- | --- | --- |
| `#/login` | `loginView` | `null` (público) |
| `#/dashboard` | `dashboardView` | `authenticated` |
| `#/projects` | `projectsView` | `authenticated` |
| `#/projects/new` | `projectFormView` | `manager` |
| `#/projects/edit/:id` | `projectFormView` | `authenticated` |
| cualquier otra | `notFoundView` | — |

> 💡 La ruta de edición es **dinámica**: `resolve()` usa una expresión regular
> `/^#\/projects\/edit\/(\w+)$/` para extraer el `:id` y pasárselo a la vista
> como `params.id`.

---

## 5. Flujo de autenticación (login)

Qué pasa cuando el usuario rellena el formulario y pulsa *Sign in*:

```
loginView (formulario)
      │  submit
      ▼
1. Validación en cliente (validators.js)
   - validateEmail()    → ¿requerido y con formato válido?
   - validatePassword() → ¿requerido y mínimo 6 caracteres?
      │  si hay errores → se muestran bajo cada campo y se detiene
      ▼
2. authService.login(email, password)
      │
      ▼
3. api.getUserByCredentials() → GET /users?email=...&password=...
      │
   ┌──┴───────────────┐
   ▼                  ▼
Sin coincidencias   Coincide un usuario
   │                  │
throw Error         saveSession() guarda en localStorage
"Invalid..."        { id, name, email, role }   ← ¡sin la contraseña!
   │                  │
mensaje de error    location.hash = '#/dashboard'
+ toast rojo          │
                    El router detecta el cambio de hash y renderiza el dashboard
```

**Puntos para destacar en la presentación:**
- La sesión se guarda **sin la contraseña** (solo datos no sensibles).
- La validación ocurre **antes** de llamar a la API (mejor UX, menos peticiones).
- Tras el login no hay recarga: solo cambia el hash y el router repinta.

---

## 6. Protección de rutas (authGuard)

Antes de pintar cualquier vista protegida, el router llama a
`guard(requiredRole)`. Su lógica es un árbol de decisión muy simple:

```
guard(requiredRole)
   │
   ├─ requiredRole === null  ───────────────► ✅ permitido (ruta pública)
   │
   ├─ no hay sesión          ───────────────► ❌ redirige a #/login
   │
   ├─ requiredRole === 'manager'
   │     y la sesión NO es manager ─────────► ❌ redirige a #/dashboard
   │
   └─ en cualquier otro caso ───────────────► ✅ permitido
```

**Las 3 reglas de oro:**
1. Sin sesión → siempre a `#/login`.
2. Con sesión intentando ver `#/login` → a `#/dashboard` (lo maneja el router).
3. Collaborator en ruta de manager → a `#/dashboard`.

> 🗣️ Cuando `guard()` redirige, simplemente cambia el hash. Eso dispara otro
> `render()`, así que **no hace falta llamar a la vista manualmente**: el ciclo
> se reinicia solo.

---

## 7. Manejo de roles

Hay **dos roles** y el rol vive dentro del objeto de sesión (`session.role`).

| Acción | Manager | Collaborator |
| --- | :---: | :---: |
| Ver todos los proyectos | ✅ | ❌ (solo asignados) |
| Crear proyecto | ✅ | ❌ |
| Editar todos los campos | ✅ | ❌ |
| Actualizar el `status` de su proyecto | ✅ | ✅ |
| Eliminar proyecto | ✅ | ❌ |

El rol influye en **3 niveles** (esto suele preguntarse):

1. **Datos:** qué se pide a la API.
   - Manager → `getProjects()` (todos).
   - Collaborator → `getProjectsByUser(id)` (solo los suyos).
2. **Interfaz:** qué se pinta.
   - Los botones *Crear / Editar / Eliminar* y los enlaces del navbar se
     renderizan **condicionalmente** según el rol.
3. **Acceso:** a qué rutas puede entrar (lo controla `authGuard`).

Ejemplo concreto en `projectsView.js`:
```js
canEdit:   isManager || p.assignedTo === session.id,  // collaborator solo los suyos
canDelete: isManager,                                  // solo manager borra
```

Y en `projectFormView.js`, cuando un collaborator edita su proyecto, todos los
campos quedan **bloqueados (`disabled`) salvo `status`**, y al guardar solo se
envía ese campo:
```js
const payload = locked ? { status } : { name, description, status, assignedTo };
```

---

## 8. CRUD de proyectos (las 4 operaciones)

Las 4 operaciones del CRUD mapean directamente a métodos HTTP:

| Operación | Método HTTP | Función en `api.js` | Quién puede |
| --- | --- | --- | --- |
| **C**rear | `POST` | `createProject()` | Manager |
| **R**eer (leer) | `GET` | `getProjects()` / `getProjectsByUser()` | Ambos |
| **U**pdate (actualizar) | `PATCH` | `updateProject()` | Manager (todo) / Collaborator (solo status) |
| **D**elete (eliminar) | `DELETE` | `deleteProject()` | Manager |

### Crear / Editar (`projectFormView.js`)
La **misma vista** sirve para crear y editar. Distingue el modo según reciba o
no un `id`:
- **Sin id** → modo creación → `POST`, y genera `createdAt` con la fecha de hoy.
- **Con id** → modo edición → `PATCH`.

Antes de guardar valida: campos requeridos, longitudes mín/máx y **nombres no
duplicados** (validación avanzada, comparando contra todos los proyectos
existentes salvo el que se edita).

### Eliminar (`projectsView.js`)
Flujo de borrado seguro:
```
clic en "Delete"
      ▼
confirmModal()  → modal de confirmación (Promise<boolean>)
      │
   ┌──┴──┐
 Cancela  Confirma
   │         │
 nada      deleteProject(id)  → DELETE /projects/:id
             │
             se quita del array local + se repinta la rejilla (sin recargar)
             + toast "Project deleted."
```

> 💡 **Detalle elegante:** el borrado actualiza el array en memoria y repinta
> solo la rejilla, en lugar de volver a pedir todo a la API. Más rápido y sin
> parpadeos.

---

## 9. Capa de datos (api.js)

Todas las peticiones HTTP están **centralizadas** aquí. Ninguna otra parte del
código usa `fetch` directamente. Ventaja: si mañana cambia la URL del backend o
se añade autenticación por token, **solo se toca este archivo**.

Hay un envoltorio interno, `request()`, que:
- Lanza un `Error` si la respuesta no es exitosa (así las vistas usan
  `try/catch` en vez de comprobar `response.ok` por todos lados).
- Devuelve `null` en respuestas sin cuerpo (HTTP 204, típico de `DELETE`).

```js
getUsers()               → GET    /users
getUserByCredentials()   → GET    /users?email=...&password=...
getProjects()            → GET    /projects
getProjectsByUser(id)    → GET    /projects?assignedTo=id
getProjectById(id)       → GET    /projects/:id
createProject(data)      → POST   /projects
updateProject(id, data)  → PATCH  /projects/:id
deleteProject(id)        → DELETE /projects/:id
```

> 🗣️ El filtrado por rol (`?assignedTo=`) lo hace **json-server** en el
> servidor, no el cliente. El cliente solo decide qué función llamar.

---

## 10. Recorrido visual: 3 escenarios completos

### 🟦 Escenario A — Manager crea un proyecto

```
1. Login con manager@test.com / 123456
   → loginView valida → login() guarda sesión → #/dashboard
2. El dashboard de manager pide GET /projects y muestra los contadores
   (Total / In Progress / Completed / Pending).
3. Clic en "New Project" (#/projects/new).
   → authGuard comprueba rol 'manager' → permitido.
4. projectFormView en modo creación. Rellena nombre, descripción, estado,
   responsable.
5. Submit → valida (incluye "no duplicados") → createProject() → POST /projects.
   → toast "Project created." → redirige a #/projects.
```

### 🟩 Escenario B — Collaborator actualiza el estado de su proyecto

```
1. Login con user@test.com / 123456 → #/dashboard
2. El dashboard de collaborator pide GET /projects?assignedTo=2
   y lista solo SUS proyectos.
3. Va a "Projects" (#/projects): solo ve los suyos. Sin botón "New Project".
4. Clic en "Edit" de uno de sus proyectos (#/projects/edit/1).
   → projectFormView detecta: es collaborator + su proyecto → modo "locked".
   → Todos los campos están deshabilitados SALVO "Status".
5. Cambia el estado → Submit → updateProject(1, { status }) → PATCH.
   → toast "Project updated." → vuelve a #/projects.
```

### 🟥 Escenario C — Collaborator intenta entrar a una ruta de manager

```
1. Estando logueado como collaborator, escribe a mano la URL .../#/projects/new
2. render() → resolve() encuentra la ruta (rol 'manager').
3. guard('manager') → la sesión NO es manager → redirige a #/dashboard.
4. El usuario nunca ve el formulario de creación. 🔒
```

---

## 11. Decisiones técnicas (preguntas de defensa)

Respuestas listas para la sustentación:

**¿Por qué hash routing y no la History API?**
Porque el hash routing funciona en **cualquier hosting estático** sin configurar
reescrituras en el servidor. Con la History API, al recargar una ruta como
`/projects` el servidor buscaría ese archivo y daría 404; habría que configurar
que todo redirija a `index.html`. Con el hash (`#/projects`), el navegador nunca
pide esa ruta al servidor: todo se resuelve en el cliente. Además, el evento
`hashchange` da un gancho simple y fiable para repintar.

**¿Por qué localStorage y no sessionStorage?**
Porque queremos que la sesión **sobreviva a recargas y al cierre del navegador**.
`sessionStorage` se borra al cerrar la pestaña, lo que obligaría a re-loguearse
constantemente. Guardamos solo datos **no sensibles** (id, name, email, role),
nunca la contraseña.

**¿Cómo funciona tu sistema de protección de rutas?**
Cada ruta declara un nivel de acceso (`null`, `authenticated` o `manager`).
Antes de renderizar, `authGuard.guard()` revisa la sesión: sin sesión redirige a
login; con rol insuficiente redirige al dashboard. Como el router se ejecuta en
cada `hashchange`, cualquier redirección simplemente dispara otro render
protegido.

**¿Cómo diferencias las vistas según el rol?**
El rol de la sesión decide **tres cosas**: los datos que pido a la API (todos vs.
asignados), la interfaz que pinto (botones y enlaces condicionales) y las rutas
a las que se puede acceder. Por ejemplo, un collaborator que edita su proyecto
solo puede tocar el campo `status`; el resto va `disabled` y al guardar solo se
envía ese campo.

**¿Qué harías diferente con más tiempo?**
Añadiría tests automatizados, hashearía las contraseñas, cambiaría json-server
por un backend real con JWT, y agregaría paginación para listas grandes.

**¿Por qué centralizar las llamadas en `api.js`?**
Para tener un único punto de cambio. Si cambia la URL del backend o se añade
autenticación por token, solo se modifica ese archivo, no las 5 vistas.

**¿Cómo evitas inyección de HTML (XSS)?**
Todo texto del usuario (nombres, descripciones) pasa por `escapeHtml()` antes de
inyectarse con `innerHTML`.

---

## 12. Glosario rápido

| Término | En una frase |
| --- | --- |
| **SPA** | Aplicación de una sola página: el contenido cambia sin recargar. |
| **Hash routing** | Navegar usando lo que va después de `#` en la URL. |
| **json-server** | Herramienta que crea una API REST falsa a partir de un `db.json`. |
| **localStorage** | Almacén del navegador que persiste hasta borrarlo manualmente. |
| **Guard** | Función que decide si una ruta puede mostrarse según la sesión. |
| **Vista** | Pantalla completa (login, dashboard, etc.). Devuelve HTML. |
| **Componente** | Pieza reutilizable usada por las vistas (navbar, modal…). |
| **Delegación de eventos** | Un único listener en el contenedor padre gestiona los clics de muchos hijos. |
| **CRUD** | Create, Read, Update, Delete: las 4 operaciones sobre datos. |
| **PATCH vs PUT** | PATCH actualiza solo algunos campos; PUT reemplaza el recurso entero. |

---

> 📌 **Resumen en una frase:** el usuario navega cambiando el `#hash` → el
> **router** lo intercepta → el **guard** decide si puede pasar → la **vista**
> pide datos a **`api.js`** → se pinta el HTML en `#view-container`, todo sin
> recargar la página.
