function buttonAddPlayer(){
    refreshPlayers()
    hideAll()
    document.getElementById("content_expanded_player").style.display = "block";
}

function addPlayer(){
    e = document.getElementById("content_selected_player")
    player = e.options[e.selectedIndex].value;

    msg = ""
    while (true) {
        input = prompt(msg + " What did " + player + " roll for initiative?")
        if (isInt(input))
            break
        else
            msg = "Please enter a valid number."
    }

    addTableRow(player, "-", input, "player")
}

function refreshPlayers(){
    let func = function(data) {
        console.log(data)
        str = "";
        for (player of data){
            str += "<option value='" + player.name + "'>" + player.name + " (" + player.class + ")</option>"
        }

        for (player of localPlayers) {
            str += "<option value='" + player.name + "'>" + player.name + " (" + player.class + ")</option>"
        }
        document.getElementById("content_selected_player").innerHTML = str;
    }

    response = requestApiJsonData("api/getplayers", "POST", {playthrough_id: PLAYTHROUGH_ID}, func)
}

let localPlayers = []
function addNewPlayer(){
    let naam = document.getElementById("new_player_name").value;
    let klasse = document.getElementById("new_player_class").value;

    let data = {
        name: naam,
        class: klasse,
    }
    localPlayers.push(data)
    document.getElementById("new_player_name").value = "";
    document.getElementById("new_player_class").value = "";

    refreshPlayers()
}

function addNewEnemy(){
    let name = document.getElementById("new_enemy_name").value;
    let maxhp = document.getElementById("new_enemy_maxhp").value;
    let ac = document.getElementById("new_enemy_armorclass").value;
    let stre = document.getElementById("new_enemy_str").value;
    let dex = document.getElementById("new_enemy_dex").value;
    let con = document.getElementById("new_enemy_con").value;
    let wis = document.getElementById("new_enemy_wis").value;
    let inte = document.getElementById("new_enemy_int").value;
    let cha = document.getElementById("new_enemy_cha").value;

    let data = {
        name: name,
        maxhp: maxhp,
        ac: ac,
        stre: stre,
        dex: dex,
        wis: wis,
        con: con,
        inte: inte,
        cha: cha,
    }

    let func = function (data) {
        if (!data.success) {
            console.log("Something went wrong uploading this enemey.")
            return
        }

        clearNewItems()
        enemyList.update()
    }

    response = requestApiJsonData("api/createenemy", "POST", data, func)
}

function clearNewItems() {
    let divs = document.getElementsByClassName("new_item");
    for (div of divs) {
        div.value = "";
    }
}


function addTableRow(name, hp, initiative, type) {
    let rows = document.getElementById("encounter_list").getElementsByTagName("tr");
    let lastId = rows[rows.length - 1].id
    let id = lastId + 1
    if (!isInt(id))
        id = 0

    extra = ""
    if (type == "enemy") {
        extra = "<button onclick='showStats(\"" + name + "\")'>Stats</button>"
    } else if (type == "player") {
        name = "<b>" + name + "</b>"
    }

    document.getElementById("encounter_list").insertRow(-1).innerHTML = "<tr><td>" + name +
        "</td><td>" + hp + "</td><td>" + initiative +
        "</td><td><input type='text' value='" + hp + "'</td><td><button onclick='removeTableRow(this)'>Del</button>" +
        extra + "</td></tr>"
}

function showStats(name) {
    let obj = enemyList.enemies[name];

    document.getElementById("stats_name").innerHTML = "<b>" + name + "</b>"

    document.getElementById("stats_dex").value = obj.dex
    document.getElementById("stats_stre").value = obj.stre
    document.getElementById("stats_wis").value = obj.wis
    document.getElementById("stats_con").value = obj.con
    document.getElementById("stats_inte").value = obj.inte
    document.getElementById("stats_cha").value = obj.cha
    document.getElementById("stats_ac").value = obj.ac

    document.getElementById("stats_id").value = obj.id

    console.log(obj)

    updateAbilities(obj.id)

    document.getElementById("stats_popup").style.display = "block";
}

function removeTableRow(n) {
    var i = n.parentNode.parentNode.rowIndex;
    document.getElementById("encounter_list").deleteRow(i);
}

function addAbility() {
    let text = document.getElementById("new_ability").value;
    let id = document.getElementById("stats_id").value;

    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong adding this ability.")
            return
        }
        document.getElementById("new_ability").value = "";
        updateAbilities(id)
    }

    let data = {
        text: text,
        id: id
    }

    requestApiJsonData("api/addability", "POST", data, func)
}

function updateAbilities(id) {
    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong updating abilities.")
            return
        }
        let ul = document.getElementById("stats_abilities_list")
        ul.innerHTML = ""


        let li, removeButton;
        for (var i = 0; i < data.fields.length; i++) {
            li = document.createElement("li");

            removeButton = "<button onclick='removeAbility(" + data.fields[i].id + ")'>Del</button>"

            li.innerHTML = data.fields[i].text + removeButton;
            ul.appendChild(li)
        }
    }

    let data = {
        id: id
    }

    requestApiJsonData("api/getabilities", "POST", data, func)
}

function removeAbility(id) {
    let enemy_id = document.getElementById("stats_id").value;

    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong deleting this ability.")
            return
        }

        updateAbilities(enemy_id)
    }

    let data = {
        enemy_id: enemy_id,
        id: id
    }

    requestApiJsonData("api/deleteability", "POST", data, func)
}

function EnemyList() {
    this.enemies = new Object();

    this.update = function() {
        var self = this;
        let func = function(data) {
            str = "";
            for (enemy of data){
                // Add enemies to a dictionary with their name as key.
                self.enemies[enemy.name] = new Enemy(enemy)

                str += "<option value='" + enemy.name + "'>" + enemy.name + "</option>"
            }
            document.getElementById("content_selected_enemy").innerHTML = str;
        }

        response = requestApiJsonData("api/getenemies", "GET", {}, func)
    };

    this.deleteEnemy = function() {
        let enemy = this.getSelectedEnemy();
        enemy.requestDelete();
    };

    this.getSelectedEnemy = function() {
        let e = document.getElementById("content_selected_enemy");
        let enemyName = e.options[e.selectedIndex].value;
        return this.enemies[enemyName];
    };

    this.addEnemy = function() {
        let enemy = this.getSelectedEnemy();

        addTableRow(enemy.name, enemy.hp, Math.floor(Math.random() * 20 + 1), "enemy")
    };
}

function Enemy(enemy) {
    this.name = enemy.name;
    this.hp = enemy.hp;
    this.ac = enemy.ac;
    this.stre = enemy.stre;
    this.dex = enemy.dex;
    this.wis = enemy.wis;
    this.con = enemy.con;
    this.inte = enemy.inte;
    this.cha = enemy.cha;
    this.id = enemy.id;

    this.requestDelete = function() {
        let func = function(data) {
            if (!data.success) {
                console.log("Something went wrong deleting this enemy.")
                return
            }

            enemyList.update()
        }
        let data = {
            enemy_id: this.id
        }

        requestApiJsonData("api/deleteenemy", "POST", data, func)
    }
}

enemyList = new EnemyList();
enemyList.update()


function buttonAddEnemy(){
    enemyList.update()
    hideAll();
    document.getElementById("content_expanded_enemy").style.display = "block";
}

function hideAll(){
    for (div of document.getElementById("encounter_expanded").getElementsByTagName("div")) {
        div.style.display = "none";
    }
}


function addEnemy(){
    e = document.getElementById("content_selected_enemy")
    enemyName = e.options[e.selectedIndex].value;
    enemyHp = enemyObj[enemyName].hp
    addTableRow(enemyName, enemyHp, Math.floor(Math.random() * 20 + 1), "enemy")
}

function clearEncounter(){
    document.getElementById("encounter_list").innerHTML = "<tr><td>Name</td>" +
    "<td>Max HP</td><td>Initiative</td><td>Current HP</td></tr>"
}

function sortInitiative(){
    //Function from W3Schools
    //Sorts the table on the n-th element.
    //Converts the string to a number first.
    n = 2;

    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("encounter_list");
    switching = true;
    while (switching) {
        switching = false;
        rows = table.getElementsByTagName("TR");
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (x.innerHTML.toLowerCase() - 0 < y.innerHTML.toLowerCase() - 0) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

clearEncounter()
