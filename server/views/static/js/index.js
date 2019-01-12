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

