function uploadCharacter() {
    let name = document.getElementById("name").value;
    let race = document.getElementById("race").value;
    let class_name = document.getElementById("class").value;
    let backstory = document.getElementById("backstory").innerHTML;

    let func = function (data) {
        if (!data.success) {
            console.log("Creation of player character was unsuccessful.")
            console.log("The following error was thrown: " + data.error)
            return
        }

        console.log("Your player character was added successfully.")
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
                               "<button onclick='deleteCharacter(" + data[i].id + ")'>Remove</button>"
            else
                li.innerHTML = data[i].name + " - <i>" + data[i].class + "</i> " + " (" + data[i].user_name + ")"
            ul.appendChild(li)
        }
    }

    response = requestApiJsonData("/api/getplayers", "POST", {playthrough_code: PLAYTHROUGH_ID}, func)
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