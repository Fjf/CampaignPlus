function login() {
    let username = document.forms[0].elements[0].value;
    let password = document.forms[0].elements[1].value;

    if (username.length == 0 || password.length == 0) {
        return false
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            location.href="http://localhost:5000/"
        else
            console.log("Something went wrong logging in.")
    }

    let data = {
        "name": username,
        "password": password
    }
    requestApiJsonData("api/login", "POST", data, func)
}


function register() {
    let username = document.forms[0].elements[0].value;
    let password = document.forms[0].elements[1].value;

    if (username.length == 0 || password.length == 0) {
        return false
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            location.href="http://localhost:5000/"
        else
            console.log("Something went wrong trying to register.")
    }

    let data = {
        "name": username,
        "password": password
    }
    requestApiJsonData("api/register", "POST", data, func)
}