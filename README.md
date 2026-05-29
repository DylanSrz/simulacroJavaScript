# 📁 ProjectHub — Internal Projects Management SPA

A single-page application (SPA) for managing internal projects with
authentication, role-based access control, and a simulated REST API powered by
**json-server**. Built with **Vanilla JavaScript (ES Modules)** and **Vite** —
no front-end framework.

---

## ✨ Features

- 🔐 Email/password authentication with session persistence
- 👥 Role-based access control (Manager / Collaborator)
- 📋 Full CRUD for projects (Create, Read, Update, Delete)
- 🧭 Client-side hash routing with protected routes
- 📊 Role-specific dashboards
- 🌙 Dark mode toggle
- 🔍 Client-side search and status filtering
- 🔔 Toast notifications and loading spinners
- 📱 Responsive, mobile-first design

---

## 🛠️ Technologies

| Tool                       | Purpose                  |
| -------------------------- | ------------------------ |
| Vanilla JS (ES Modules)    | Application logic        |
| Vite                       | Bundler & dev server     |
| json-server                | Simulated REST API       |
| CSS variables              | Styling & theming        |
| localStorage               | Session persistence      |
| concurrently               | Run dev + API together   |

---

## 🚀 Installation

```bash
git clone <repository-url>
cd simulacroJavaScript
npm install
```

---

## ▶️ Running the project

You need **two** processes: the Vite dev server (front-end) and json-server
(API).

Run both at once:

```bash
npm run start
```

Or run them separately in two terminals:

```bash
# Terminal 1 — front-end (http://localhost:5173)
npm run dev

# Terminal 2 — API (http://localhost:3001)
npm run api
```

Then open the URL printed by Vite (default `http://localhost:5173`).

---

## 👤 Test Users

| Email              | Password | Role         |
| ------------------ | -------- | ------------ |
| manager@test.com   | 123456   | manager      |
| user@test.com      | 123456   | collaborator |

---

## 🗂️ Project Structure

```
simulacroJavaScript/
├── index.html
├── db.json                  # json-server database
├── package.json
├── README.md
├── planning.md
└── src/
    ├── main.js              # Entry point, boots the router
    ├── router.js            # SPA hash routing + guards
    ├── api/
    │   └── api.js           # All json-server fetch calls
    ├── auth/
    │   ├── authService.js   # Login, logout, session (localStorage)
    │   └── authGuard.js     # Route protection by role/session
    ├── views/
    │   ├── loginView.js
    │   ├── dashboardView.js
    │   ├── projectsView.js
    │   ├── projectFormView.js
    │   └── notFoundView.js
    ├── components/
    │   ├── navbar.js
    │   ├── projectCard.js
    │   ├── modal.js
    │   ├── toast.js
    │   └── loader.js
    ├── utils/
    │   ├── validators.js
    │   └── helpers.js
    └── styles/
        ├── main.css
        ├── auth.css
        ├── dashboard.css
        └── projects.css
```

---

## 🔑 Role Permissions

| Action                              | Manager | Collaborator        |
| ----------------------------------- | ------- | ------------------- |
| View all projects                   | ✅      | ❌ (only assigned)  |
| Create project                      | ✅      | ❌                  |
| Edit any project                    | ✅      | ❌                  |
| Update status of own project        | ✅      | ✅                  |
| Delete project                      | ✅      | ❌                  |
| View details of any project         | ✅      | ❌ (only assigned)  |

---

## 🧠 Technical Decisions

**Why hash routing instead of the History API?**
Hash routing (`window.location.hash`) works out of the box with any static file
host — there is no need to configure server-side rewrites to serve `index.html`
for every path. This keeps deployment trivial (GitHub Pages, Vercel static,
etc.) and the `hashchange` event gives us a simple, reliable navigation hook.

**Why localStorage instead of sessionStorage?**
The session must survive a full page refresh and browser restarts so the user
stays logged in across visits. `sessionStorage` is cleared when the tab closes,
which would force re-authentication too often. We store only non-sensitive data
(`id`, `name`, `email`, `role`) — never the password.

**How does route protection work?**
Each route declares a required access level (`null`, `authenticated`, or
`manager`). Before rendering, `authGuard.guard()` checks the current session:
no session → redirect to `#/login`; insufficient role → redirect to
`#/dashboard`. The router re-runs on every `hashchange`, so any redirect simply
triggers another guarded render.

**How are views differentiated by role?**
The session role drives both the data fetched (managers get all projects,
collaborators only their own via `?assignedTo=`) and the UI rendered (action
buttons and navbar links are shown conditionally). Collaborators editing a
project can only change its `status`; the rest of the form is locked.

**What would I do differently with more time?**
Add automated tests (unit + e2e), hash the passwords, replace json-server with
a real backend + JWT auth, add optimistic UI updates, and introduce pagination
for large project lists.

---

## 📦 Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```
