function setUserData() {
    let set_data = function(data) {
        if (data == null)
            return

        document.getElementById("currentuser").innerHTML = "Logged in as " + data.name;
    }
    requestApiJsonData("api/session", "GET", {}, set_data)
}

function toggleViews() {
    let opts = ["block", "none"]


    let divs = document.getElementsByClassName("encounter")

    let index = (divs[0].style.display == "block") + 0
    for (let i = 0; i < divs.length; i++) {
        divs[i].style.display = opts[index];
    }

    divs = document.getElementsByClassName("playthrough")
    for (let i = 0; i < divs.length; i++) {
        divs[i].style.display = opts[(!index) + 0];
    }
}

var PLAYTHROUGH_ID = null
setUserData()

