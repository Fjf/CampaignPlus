function setUserData() {
    let set_data = function(data) {
        if (data == null)
            return

        document.getElementById("currentuser").innerHTML = "Logged in as " + data.name;
    }
    requestApiJsonData("api/session", "GET", {}, set_data)
}

setUserData()
