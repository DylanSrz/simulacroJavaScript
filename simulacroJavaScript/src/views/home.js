import { navigateTo } from "../router.js"

export function viewHome() {
    document.querySelector('#app').innerHTML =
    `
    <h1>ESTAS EN HOME</H1>

    <button type="submit" class="btn btn-primary">
            login
        </button>
    `
    document.querySelector(".btn-primary").addEventListener("click", () => {
            navigateTo("/login")
        })
}