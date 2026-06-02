import { viewLogin } from "./view/login.js";

const routes = {
    'login' :{ view: viewLogin, role: null },    
}

function navigateTo(url) {
    history.pushState(null, null, url)
    render()
}

function render(){
    const path = location.pathname
    document.getElementById("app").innerHTML = routes[path] || "<h1>404</h1><p>Pagina no enncontrada</p>"
}

export const initRouter = () => {
    window.addEventListener()
}