function toggleDisplays() {
    if (document.getElementById("content_log_wrapper").style.display == "none") {
        document.getElementById("content_log_wrapper").style.display = "flex";
        document.getElementById("character_chat_wrapper").style.display = "none";
    } else {
        document.getElementById("content_log_wrapper").style.display = "none";
        document.getElementById("character_chat_wrapper").style.display = "block";
    }

}

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

function sendMessage() {
    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong sending this message. Error message: " + data.error);
            return;
        }
        document.getElementById("chat_message").value = ""
    }

    let message = document.getElementById("chat_message").value;
    if (message == "")
        return;

    console.log(PLAYTHROUGH_ID)
    let data = {
        playthrough_code: PLAYTHROUGH_ID,
        message: message
    }

    requestApiJsonData("/api/createmessage", "POST", data, func)
}

function createLog() {
    let title = document.getElementById("create_log_title").value;
    let text = document.getElementById("create_log_text").value;

    if (title == "" || text == "")
        return;

    document.getElementById("create_log_submit").disabled = true;

    let func = function(data) {
        document.getElementById("create_log_submit").disabled = false;
        if (!data.success) {
            console.log("Something went wrong creating this log. Error message: " + data.error);
            return;
        }

        document.getElementById("create_log_title").value = ""
        document.getElementById("create_log_text").value = ""
        logBook.getLogs()
    }

    let data = {
        playthrough_code: PLAYTHROUGH_ID,
        title: title,
        text: text
    }

    requestApiJsonData("/api/createlog", "POST", data, func)
}

function LogBook() {
    this.allLogs = null;
    this.currentIndex = 0;
    this.init = true;

    this.getLogs = function(show) {
        let func = function(data) {

            if (!data.success) {
                console.log("Something went wrong retrieving logs. Error message: " + data.error);
                return;
            }

            logBook.allLogs = data.logs;
            logBook.currentIndex = data.logs.length - 1;
            logBook.updateOverview()
            logBook.showLog(logBook.currentIndex);
            this.init = false;
        }

        let data = {
            playthrough_code: PLAYTHROUGH_ID
        }

        requestApiJsonData("/api/getlogs", "POST", data, func);
    }

    this.updateOverview = function() {
        let ul = document.getElementById("latest_log_entries");
        ul.innerHTML = "";

        let li;
        let minimum = Math.max(0, this.allLogs.length - 15);
        minimum = 0;
        for (let i = this.allLogs.length - 1; i >= minimum; i--) {
            li = document.createElement("li");
            li.innerHTML = this.allLogs[i].title + " van " + this.allLogs[i].creator_name;
            li.classList.add("custom_button")
            li.addEventListener("click", this.createShowLog(i), false);

            ul.appendChild(li);
        }
    }

    this.createShowLog = function(index) {
        return function() { logBook.showLog(index); }
    }

    this.showLog = function(index) {
        if (this.allLogs == null)
            return;

        if (!this.init && document.getElementById("content_log_wrapper").style.display == "none") {
            toggleDisplays();
        }

        let logs = document.getElementById("content_log_entries");
        logs.innerHTML = "";

        let log = this.allLogs[index];

        let div = document.createElement("div");
        let header = document.createElement("div");
        let text = document.createElement("div");
        let footer = document.createElement("div");

        header.classList.add("log_entry_header");
        header.innerHTML = log.title;

        text.classList.add("log_entry_text");
        text.innerHTML = log.text.replace(/\n/g, '<br>');

        let date = new Date(log.time);
        let datum = formatDate(date, "dddd d MMM yyyy");
        let tijd = formatDate(date, "HH:mm")
        footer.classList.add("log_entry_footer");
        footer.innerHTML = "<br>Geschreven door  " + log.creator_name + " om " + tijd + " op " + datum;

        div.appendChild(header);
        div.appendChild(text);
        div.appendChild(footer);

        logs.appendChild(div);
    }

    this.prevPage = function() {
        this.currentIndex -= 1;
        if (this.currentIndex < 0)
            this.currentIndex = 0;

        this.showLog(this.currentIndex);
    }

    this.nextPage = function() {
        this.currentIndex += 1;
        if (this.currentIndex >= this.allLogs.length)
            this.currentIndex = this.allLogs.length - 1;

        this.showLog(this.currentIndex);
    }
}

logBook = new LogBook();
logBook.getLogs(true);

getGameCharacters()
getPlaythroughName(PLAYTHROUGH_ID)
setUserData()