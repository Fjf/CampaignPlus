function login() {
    let username = document.forms[0].elements[0].value;
    let password = document.forms[0].elements[1].value;

    if (username.length == 0 || password.length == 0) {
        return false
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            location.href="/"
        else {
            document.getElementById("errorboxlogin").innerHTML = data.error;
            console.log("Something went wrong logging in.")
        }
    }

    let data = {
        "name": username,
        "password": password
    }
    requestApiJsonData("api/login", "POST", data, func)
}


function register() {
    console.log("Test123")
    let username = document.forms[0].elements[0].value;
    let password = document.forms[0].elements[1].value;

    if (username.length == 0 || password.length == 0) {
        return false
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            location.href="/"
        else {
            document.getElementById("errorboxregister").innerHTML = data.error;
            console.log("Something went wrong trying to register.")
        }
    }

    let data = {
        "name": username,
        "password": password
    }
    requestApiJsonData("api/register", "POST", data, func)
}


function show(divId) {
    let divs = document.getElementsByClassName("logindiv")
    for (let i = 0; i < divs.length; i++) {
        if (divs[i] == document.getElementById(divId)) {
            divs[i].style.display = "block";
        }
        else {
            divs[i].style.display = "none";
        }
    }

    document.getElementById("errorboxlogin").innerHTML = "";
    document.getElementById("errorboxregister").innerHTML = "";
}