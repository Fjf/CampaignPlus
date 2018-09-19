function uploadCharacter() {
    let name = document.getElementById("name").value;
    let race = document.getElementById("race").value;
    let class_name = document.getElementById("class").value;
    let backstory = document.getElementById("backstory").innerHTML;

    if (name == "" || race == "" || class_name == "")
        return

    document.getElementById("submit_pc").disabled = true;

    let func = function (data) {
        document.getElementById("submit_pc").disabled = false;

        if (!data.success) {
            console.log("Creation of player character was unsuccessful.")
            console.log("The following error was thrown: " + data.error)
            return
        }

        cleanFields()

        console.log("Your player character was added successfully.")
        getGameCharacters()
    }

    data = {
        code: PLAYTHROUGH_ID,
        name: name,
        race: race,
        class_name: class_name,
        backstory: backstory
    }
    requestApiJsonData("/api/createplayer", "POST", data, func)
}

function cleanFields() {
    document.getElementById("name").value = "";
    document.getElementById("race").value = "";
    document.getElementById("class").value  = "";
    document.getElementById("backstory").innerHTML  = "";
}

function getGameCharacters() {
    let func = function(data) {
        let ul = document.getElementById("characters")
        ul.innerHTML = ""
        let li;

        if (data.length == 0)
            document.getElementById("charactertext").innerHTML = "Nobody has yet joined this game..."
        for (let i = 0; i < data.length; i++) {
            li = document.createElement("li")
            li.setAttribute("class", "custom_list")
            if (data[i].user_name == USERNAME)
                li.innerHTML = data[i].name + " - <i>" + data[i].class + "</i> (<b>You</b>)" +
                               "<button onclick='deleteCharacter(" + data[i].id + ")'>Del</button>" +
                               "<button onclick='editCharacter(" + data[i].id + ")'>Edit</button>"
            else
                li.innerHTML = data[i].name + " - <i>" + data[i].class + "</i> " + " (" + data[i].user_name + ")"
            ul.appendChild(li)
        }
    }

    response = requestApiJsonData("/api/getplayers", "POST", {playthrough_code: PLAYTHROUGH_ID}, func)
}

function toggleUpload() {
    if (document.getElementById("update").style.display == "none") {
        document.getElementById("login").style.display = "none";
        document.getElementById("update").style.display = "block";
    } else {
        document.getElementById("update").style.display = "none";
        document.getElementById("login").style.display = "block";
    }

}

function editCharacter(pid) {
    let func = function(data) {
        if (!data.success){
            console.log("Something went wrong")
            return
        }

        document.getElementById("up_id").innerHTML = pid;
        document.getElementById("up_name").value = data.name;
        document.getElementById("up_race").value = data.race;
        document.getElementById("up_class").value = data.class;
        document.getElementById("up_backstory").innerHTML = data.backstory;

        toggleUpload()
    }
    console.log("Retrieving data for id: " + pid)
    response = requestApiJsonData("/api/getplayerdata", "POST", {player_id: pid}, func)
}

function updateCharacter() {
    let name = document.getElementById("up_name").value;
    let pid = document.getElementById("up_id").innerHTML;
    let race = document.getElementById("up_race").value;
    let class_name = document.getElementById("up_class").value;
    let backstory = document.getElementById("up_backstory").innerHTML;

    if (name == "" || race == "" || class_name == "")
        return

    document.getElementById("update_pc").disabled = true;

    let func = function (data) {
        document.getElementById("update_pc").disabled = false;

        if (!data.success) {
            console.log("Updating of player character was unsuccessful.")
            console.log("The following error was thrown: " + data.error)
            return
        }

        cleanFields()

        console.log("Your player character was updated successfully.")
        getGameCharacters()
        toggleUpload()
    }

    data = {
        code: PLAYTHROUGH_ID,
        name: name,
        race: race,
        class_name: class_name,
        backstory: backstory,
        pid: pid
    }
    requestApiJsonData("/api/updateplayer", "POST", data, func)
}

function deleteCharacter(id) {
    let func = function(data) {
        if (!data.success)
            console.log(data.error)
        else
            getGameCharacters()
    }
    response = requestApiJsonData("/api/deleteplayer", "POST", {id: id}, func)
}

function getPlaythroughName(code) {
    let func = function(data) {
        if (data.success)
            document.getElementById("playthrough_name").innerHTML = "Add your player to game: " + data.name
        else
            console.log("Something went wrong retrieving the name of this playthrough.")
    }
    response = requestApiJsonData("/api/getplaythroughname", "POST", {code: code}, func)
}

getGameCharacters()
getPlaythroughName(PLAYTHROUGH_ID)
setUserData()