const form = document.getElementById('form')
const username_input = document.getElementById('username-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')
const error_message = document.getElementById('error-message')

//whenever the submit button is clicked...
form.addEventListener('submit', (e) =>{
    //prevents form from being submitted without input
    e.preventDefault()

    let errors = []

    if(repeat_password_input){
        errors = getSignupFormErrors(username_input.value, password_input.value, repeat_password_input.value)
    } else {
        errors = getLoginFormErrors(username_input.value, password_input.value)
    }

    //if there are errors in the erros array...
    if(errors.length > 0){
        e.preventDefault()
        error_message.innerText = errors.join(". ")
        return
    }

    const endpoint = repeat_password_input ? '/users' : '/users/login'
    const successPage = repeat_password_input ? 'login.html' : 'content.html'

    fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username_input.value,
                password: password_input.value
            })
        })
            .then(async response => {
                const responseText = await response.text()
                let data

                try {
                    data = responseText ? JSON.parse(responseText) : {}
                } catch {
                    throw new Error(`The server returned an unexpected response (${response.status}). Make sure this page is opened at http://localhost:3000/signup.html.`)
                }

                if(!response.ok){
                    throw new Error(data.message || 'Unable to process request')
                }

                if(!repeat_password_input){
                    localStorage.setItem('userId', data.userId)
                }

                window.location.href = successPage
            })
            .catch(error => {
                error_message.innerText = error.message
            })
})

function getSignupFormErrors(username, password, repeatPassword){
    let errors = []

    if(username === '' || username == null ){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')
    }
    if(password === '' || password == null ){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    if(repeatPassword === '' || repeatPassword == null ){
        errors.push('Password verification is required')
        repeat_password_input.parentElement.classList.add('incorrect')
    }
    if(password !== repeatPassword){
        errors.push('Passwords do not match')
        repeat_password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

function getLoginFormErrors(username, password){
    let errors = []

    if(username === '' || username == null ){
        errors.push('Username is required')
        username_input.parentElement.classList.add('incorrect')
    }
    if(password === '' || password == null ){
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }

    return errors;
}

const allInputs = [username_input, password_input, repeat_password_input].filter(input => input != null)

allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect')
            error_message.innerText = ''
        }
    })
})