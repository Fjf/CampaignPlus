function login() {
    let username = document.forms[0].elements[0].value;
    let password = document.forms[0].elements[1].value;

    let error = null;
    if (username.length == 0) {
        error = "Please enter a username.";
    } else if (password.length == 0) {
        error = "Please enter a password.";
    }

    if (error != null) {
        document.getElementById("login_errorbox").innerHTML = error;
        return;
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            location.href = data.refer
        else {
            document.getElementById("login_errorbox").innerHTML = data.error;
            console.log("Something went wrong logging in.")
        }
    }

    let data = {
        "name": username,
        "password": password,
        "redirect": redirect
    }
    requestApiJsonData("/api/login", "POST", data, func)
}


function register() {
    let username = document.getElementById("register_name").value;
    let password = document.getElementById("register_pass").value;
    let pass_confirm = document.getElementById("register_pass_confirm").value;

    let error = null;
    if (username.length == 0) {
        error = "Please enter a username.";
    } else if (password.length == 0) {
        error = "Please enter a password.";
    } else if (password != pass_confirm) {
        error = "Please confirm your password.";
    }

    if (error != null) {
        document.getElementById("register_errorbox").innerHTML = error;
        return;
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            location.href = data.refer
        else {
            document.getElementById("register_errorbox").innerHTML = data.error;
            console.log("Something went wrong trying to register.")
        }
    }

    let data = {
        "name": username,
        "password": password,
        "redirect": redirect
    }
    requestApiJsonData("/api/register", "POST", data, func)
}

function forgot() {
    let email = document.getElementById("forgot_email").value;

    let error = null;
    if (email.length == 0) {
        error = "Please enter an email.";
     }

    if (error != null) {
        document.getElementById("forgot_errorbox").innerHTML = error;
        return;
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            show('login')
        else {
            document.getElementById("forgot_errorbox").innerHTML = data.error;
            console.log("Something went wrong trying to request password reset.")
        }
    }

    let data = {
        "email": email
    }
    requestApiJsonData("/api/forgot_password", "POST", data, func)
}

function reset() {
    let password = document.getElementById("reset_pass").value;
    let confirm = document.getElementById("confirm_pass").value;

    let error = "";
    if (password.length == 0) {
        error += "Please enter a password.<br>";
    } if (confirm != password) {
        error += "Make sure your password matches.<br>"
    }

    if (error != "") {
        document.getElementById("reset_errorbox").innerHTML = error;
        return;
    }

    let func = function(data) {
        console.log(data)
        if (data.success)
            location.href = "/"
        else {
            document.getElementById("reset_errorbox").innerHTML = data.error;
            console.log("Something went wrong trying to reset password.")
        }
    }

    let data = {
        "password": password,
        "code": code
    }
    requestApiJsonData("/api/reset_password", "POST", data, func)
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

    document.getElementById("login_errorbox").innerHTML = "";
    document.getElementById("register_errorbox").innerHTML = "";
}