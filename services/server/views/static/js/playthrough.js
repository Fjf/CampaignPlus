function buttonExpandCampaign() {
    document.getElementById("campaign_expanded").style.display = "block";

    document.getElementById("campaign_host").style.display = "block";
    document.getElementById("campaign_player").style.display = "none"
    loadCampaignList()
}

function buttonExpandJoinedCampaign() {
    document.getElementById("campaign_expanded").style.display = "block";

    document.getElementById("campaign_player").style.display = "block"
    document.getElementById("campaign_host").style.display = "none";
    loadJoinedCampaignList()
}


function loadJoinedCampaignList() {
    let func = function(data) {
        str = "";
        for (obj of data){
            str += "<option value='" + obj.code + "'>" + obj.name + "</option>"
        }

        document.getElementById("open_selected_campaign_overview").innerHTML = str
    }

    requestApiJsonData("api/getjoinedcampaigns", "GET", {}, func)
}

function loadCampaignList() {
    let func = function(data) {
        str = "";
        for (obj of data){
            str += "<option value='" + obj.id + "'>" + obj.name + "</option>"
        }

        document.getElementById("content_selected_campaign").innerHTML = str;
    }

    response = requestApiJsonData("api/getcampaigns", "GET", {}, func)
}

function buttonCreateCampaign() {

}

function createCampaign() {
    name = document.getElementById("new_campaign_name").value
    if (name == null || name == "")
        return 0

    let func = function(data) {

        // TODO: Error checking, for now assuming the creation went correctly.
        loadCampaignList()
        document.getElementById("new_campaign_name").value = "";
    }

    response = requestApiJsonData("api/createcampaign", "POST", {name: name}, func)
}

function loadCampaign() {
    let func = function(data) {
        if (data.url == null) {
            console.log("Something went wrong retrieving the url.")
            return
        }
        document.getElementById("campaign_link_url").value = data.url
        document.getElementById("campaign_map_url").value = data.url.replace("join", "map")
        document.getElementById("campaign_qr_image").src = data.image_src

        div = document.getElementById("content_selected_campaign");

        if (CAMPAIGN_ID == null)
            setInterval(getMessages, 5000);

        CAMPAIGN_ID = div.value
        getMessages()
    }

    let div = document.getElementById("content_selected_campaign");

    if (div.selectedIndex == -1)
        return null;

    name = div.options[div.selectedIndex].text;

    document.getElementById("campaign_name").innerHTML = "Campaign: " + name

    response = requestApiJsonData("api/getcampaignurl", "POST", {id: div.value}, func)
    updateCampaignPlayers(div.value)
    document.getElementById("campaign_content").style.display = "block";
}

function copyUrl(name) {
    let div = document.getElementById(name)
    copyTextToClipboard(div.value)
    div.style.borderColor = "green";
}

function updateCampaignPlayers(pid) {
    let func = function(data) {
        let src = ""
        let div;
        for (var i = 0; i < data.players.length; i++){
            player = data.players[i]
            src += "<div onclick='retrievePlayerData(" + player.id + ")'>" +
                            player.name + " - <i>" + player.class + "</i>(" + player.user_name + ")</div>"

        }
        document.getElementById("players").innerHTML = src;
    }

    response = requestApiJsonData("/api/campaign/" + pid + "/players", "GET", null, func)
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

    response = requestApiJsonData("/api/player/" + pid + "/data", "GET", null, func)
}