function buttonExpandPlaythrough() {
    document.getElementById("playthrough_expanded").style.display = "block";

    document.getElementById("playthrough_host").style.display = "block";
    document.getElementById("playthrough_player").style.display = "none"
    loadPlaythroughList()
}

function buttonExpandJoinedPlaythrough() {
    document.getElementById("playthrough_expanded").style.display = "block";

    document.getElementById("playthrough_player").style.display = "block"
    document.getElementById("playthrough_host").style.display = "none";
    loadJoinedPlaythroughList()
}


function loadJoinedPlaythroughList() {
    let func = function(data) {
        str = "";
        for (obj of data){
            str += "<option value='" + obj.code + "'>" + obj.name + "</option>"
        }

        document.getElementById("open_selected_playthrough_overview").innerHTML = str
    }

    requestApiJsonData("api/getjoinedplaythroughs", "GET", {}, func)
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
        document.getElementById("playthrough_map_url").value = data.url.replace("join", "map")

        div = document.getElementById("content_selected_playthrough");

        if (PLAYTHROUGH_ID == null)
            setInterval(getMessages, 5000);

        PLAYTHROUGH_ID = div.value
        getMessages()
    }

    let div = document.getElementById("content_selected_playthrough");

    if (div.selectedIndex == -1)
        return null;

    name = div.options[div.selectedIndex].text;

    document.getElementById("playthrough_name").innerHTML = "Playthrough: " + name

    response = requestApiJsonData("api/getplaythroughurl", "POST", {id: div.value}, func)
    updatePlaythroughPlayers(div.value)
    document.getElementById("playthrough_content").style.display = "block";
}

function copyUrl(name) {
    let div = document.getElementById(name)
    copyTextToClipboard(div.value)
    div.style.borderColor = "green";
}

function updatePlaythroughPlayers(pid) {
    let func = function(data) {
        let src = ""
        let div;
        for (var i = 0; i < data.length; i++){
            player = data[i]
            src += "<div onclick='retrievePlayerData(" + player.id + ")'>" +
                            player.name + " - <i>" + player.class + "</i>(" + player.user_name + ")</div>"

        }
        document.getElementById("players").innerHTML = src;
    }

    response = requestApiJsonData("/api/getplayers", "POST", {playthrough_id: pid}, func)
}

function retrievePlayerData(pid) {
    let func = function(data) {
        if (!data.success){
            console.log("Something went wrong")
            return
        }
        document.getElementById("pc_name").innerHTML = data.name
        document.getElementById("pc_class").innerHTML = data.class
        document.getElementById("pc_owner").innerHTML = data.user_name
        document.getElementById("pc_backstory").innerHTML = data.backstory
    }
    console.log("Retrieving data for id: " + pid)
    response = requestApiJsonData("/api/getplayerdata", "POST", {player_id: pid}, func)
}