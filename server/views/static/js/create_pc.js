function uploadCharacter() {
    let name = document.getElementById("name").value;
    let race = document.getElementById("race").value;
    let class_name = document.getElementById("class").value;
    let backstory = document.getElementById("backstory").value;

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
        name: name,
        race: race,
        class: class_name,
        backstory: backstory
    }
    requestApiJsonData("/api/playthrough/" + PLAYTHROUGH_ID + "/players", "POST", data, func)
}

function cleanFields() {
    document.getElementById("name").value = "";
    document.getElementById("race").value = "";
    document.getElementById("class").value  = "";
    document.getElementById("backstory").value  = "";
}

function getGameCharacters() {
    let func = function(data) {
        let ul = document.getElementById("characters")
        ul.innerHTML = ""
        let li;

        if (data.length == 0)
            playerInfoText = "Nobody has yet joined this game..."
        else
            playerInfoText = "These players have already joined this game:"
        document.getElementById("charactertext").innerHTML = playerInfoText

        data = data.players
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

    response = requestApiJsonData("/api/playthrough/" + PLAYTHROUGH_ID + "/players", "GET", null, func)
}

function show(id) {
    if (id == "update" || id == "create") {
        document.getElementById("content_log_wrapper").style.display = "none";
        document.getElementById("character_chat_wrapper").style.display = "block";

        if (id == "update") {
            document.getElementById("create").style.display = "none";
            document.getElementById("update").style.display = "block";
        } else {
            document.getElementById("update").style.display = "none";
            document.getElementById("create").style.display = "block";
        }
    } else if (id == "log") {
        document.getElementById("content_log_wrapper").style.display = "flex";
        document.getElementById("character_chat_wrapper").style.display = "none";
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

        show("update")
    }
    response = requestApiJsonData("/api/player/" + pid + "/data", "GET", null, func)
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
        show("create")
    }

    data = {
        name: name,
        race: race,
        class: class_name,
        backstory: backstory,
    }
    requestApiJsonData("/api/player/" + pid, "PUT", data, func)
}

function deleteCharacter(id) {
    let func = function(data) {
        if (!data.success)
            console.log(data.error)
        else
            getGameCharacters()
    }

    response = requestApiJsonData("/api/player/" + id, "DELETE", null, func)
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

    let data = {
        playthrough_code: PLAYTHROUGH_CODE,
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
        playthrough_code: PLAYTHROUGH_CODE,
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
            logBook.init = false;
        }

        let data = {
            playthrough_code: PLAYTHROUGH_CODE
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
            li.classList.add("log_scroll_button")
            li.addEventListener("click", this.createShowLog(i), false);

            if (this.allLogs[i].creator_user_name == USERNAME) {
                trash = document.createElement("div");
                trash.classList.add("log_delete_button");
                trash.addEventListener("click", this.createDeleteLog(this.allLogs[i].id), false);

                li.appendChild(trash);
            }

            ul.appendChild(li);
        }
    }

    this.createShowLog = function(index) {
        return function() { logBook.showLog(index); }
    }

    this.createDeleteLog = function(index) {
        return function() { logBook.deleteLog(index); }
    }

    this.showLog = function(index) {
        if (this.allLogs == null || this.allLogs.length == 0)
            return;

        if (!this.init) {
            show("log");
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

    this.deleteLog = function(i) {
         let func = function(data) {
            if (!data.success) {
                console.log("Something went wrong deleting your log. Error message: " + data.error);
                return;
            }

            logBook.getLogs();
        }

        let data = {
            playthrough_code: PLAYTHROUGH_CODE,
            log_id: i
        }

        requestApiJsonData("/api/deletelog", "POST", data, func);
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