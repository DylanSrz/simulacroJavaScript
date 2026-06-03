import { viewLogin } from "./views/login.js";

const routes = {
    'login' :{ view: viewLogin, role: null },    
}

function navigateTo(url) {
    history.pushState(null, null, url)
    render()
}

function render(){
    const path = location.pathname
    const route = routes[path]
    document.getElementById("app").innerHTML = route
}

export const initRouter = () => {
    window.addEventListener("popstate", render);    
    window.addEventListener('load', render);
    if (document.readyState === 'complete') render();
}

