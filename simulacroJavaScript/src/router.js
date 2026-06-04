import { viewLogin } from "./views/login.js";
import { viewDashboard } from "./views/dashboard.js";
import { viewNotFound } from "./views/notFound.js";
import { viewHome } from "./views/home.js";

const routes = {
    '/'     : viewHome,
    '/login': viewLogin,
    '/dashboard': viewDashboard
};

const render = () => {
    const path = window.location.pathname;

    const view = routes[path];

    if (!view) {
        document.querySelector('#app').innerHTML = viewNotFound();
        return;
    }
    view();
};

export const navigateTo = (path) => {
    history.pushState({}, '', path);
    render();
};

export const initRouter = () => {
    window.addEventListener('popstate', render);
    render();
};