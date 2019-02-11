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

function loadPlaythroughOverview() {
    let selected_code = document.getElementById("open_selected_playthrough_overview").value

    if (selected_code == null)
        return;

//    console.log(HOST_ADDRESS + "/join/" + selected_code)
    location.href = "http://" + HOST_ADDRESS + "/join/" + selected_code
}

var PLAYTHROUGH_ID = null
setUserData()

