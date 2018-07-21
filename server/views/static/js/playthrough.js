function buttonExpandPlaythrough() {
    document.getElementById("playthrough_expanded").style.display = "block";
    loadPlaythroughList()
}

function loadPlaythroughList() {
    let func = function(data) {
        str = "";
        for (obj of data){
            str += "<option value='" + obj.id + "'>" + obj.name + "</option>"
        }
        document.getElementById("content_selected_playthrough").innerHTML = str;
    }

    response = requestApiJsonData("api/getplaythroughs", "GET", {}, func)

}

function buttonCreatePlaythrough() {

}

function createPlaythrough() {
    name = document.getElementById("new_playthrough_name").value
    if (name == null || name == "")
        return 0

    let func = function(data) {
        // TODO: Error checking, for now assuming the creation went correctly.
        loadPlaythroughList()
    }

    response = requestApiJsonData("api/createplaythrough", "POST", {name: name}, func)
}

function loadPlaythrough() {
    let func = function(data) {
        if (data.url == null) {
            console.log("Something went wrong retrieving the url.")
            return
        }
        document.getElementById("playthrough_link_url").value = data.url
    }

    let div = document.getElementById("content_selected_playthrough");

    if (div.selectedIndex == -1)
        return null;

    name = div.options[div.selectedIndex].text;

    document.getElementById("playthrough_name").innerHTML = "Playthrough: " + name

    response = requestApiJsonData("api/getplaythroughurl", "POST", {id: div.value}, func)

    document.getElementById("playthrough_content").style.display = "block";
}

function copyPlaythroughUrl() {
    let div = document.getElementById("playthrough_link_url")
    copyTextToClipboard(div.value)
    div.style.borderColor = "green";
}