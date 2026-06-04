import { navigateTo } from "../router.js"

export function viewLogin() {
    document.querySelector('#app').innerHTML =
    `
    <form id="form">
        <div class="mb-3">
            <label class="form-label">Email address</label>
            <input type="email" name="email" class="form-control" id="form-email">
        </div>

        <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" name="password" class="form-control" id="form-password">
        </div>

        <button type="submit" class="btn btn-primary">
            Submit
        </button>
    </form>
`
const form = document.querySelector("#form")

form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = form.email.value
    const password = form.password.value
    
    const byUser = request(`http://localhost:5173/users`)
    console.log(byUser)
})


}