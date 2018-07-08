function buttonAddPlayer(){
    refreshPlayers()
    hideAll()
    document.getElementById("content_expanded_player").style.display = "block";
}

function addPlayer(){
    e = document.getElementById("content_selected_player")
    player = e.options[e.selectedIndex].value;

    document.getElementById("encounter_list").insertRow(-1).innerHTML = "<tr><td><b>" + player +
        "</b></td><td>" + "iets" + "</td><td>" +
        prompt("What did " + player + " roll for initiative?") + "</td><td><input type='text' value='-1'</td></tr>"
}

function refreshPlayers(){
    let func = function(data) {
        console.log(data)
        str = "";
        for (player of data){
            str += "<option value='" + player.name + "'>" + player.name + " (" + player.class + ")</option>"
        }
        document.getElementById("content_selected_player").innerHTML = str;
    }

    response = requestApiJsonData("api/getplayers", "GET", {}, func)
}


function addNewPlayer(){
    let naam = document.getElementById("new_player_name").value;
    let klasse = document.getElementById("new_player_class").value;
    let rest = document.getElementById("new_player_rest").value;

    let data = {
        name: naam,
        class: klasse,
    }
    response = requestApiJsonData("api/createplayer", "POST", data, refreshPlayers)
}

function addNewEnemy(){
    let naam = document.getElementById("new_enemy_name").value;
    let maxhp = document.getElementById("new_enemy_maxhp").value;

    let data = {
        name: naam,
        maxhp: maxhp,
    }

    response = requestApiJsonData("api/createenemy", "POST", data, refreshEnemies)
}

var enemyObj = []
function refreshEnemies(){
    let func = function(data) {
        console.log(data)
        str = "";
        for (enemy of data){
            // Add enemies to a dictionary with their name as key.
            enemyObj[enemy.name] = {
                hp: enemy.hp
            }
            str += "<option value='" + enemy.name + "'>" + enemy.name + "</option>"
        }
        document.getElementById("content_selected_enemy").innerHTML = str;
    }

    response = requestApiJsonData("api/getenemies", "GET", {}, func)
}

function buttonAddEnemy(){
    refreshEnemies();
    hideAll();
    document.getElementById("content_expanded_enemy").style.display = "block";
}

function hideAll(){
    for (div of document.getElementById("content_expanded").getElementsByTagName("div")) {
        div.style.display = "none";
    }
}

function addEnemy(){
    e = document.getElementById("content_selected_enemy")
    enemyName = e.options[e.selectedIndex].value;
    enemyHp = enemyObj[enemyName].hp
    document.getElementById("encounter_list").insertRow(-1).innerHTML = "<tr><td>" + enemyName +
        "</td><td>" + enemyHp + "</td><td>" + Math.floor(Math.random() * 20 + 1) +
        "</td><td><input type='text' value='" + enemyHp + "'></td></tr>"
}

function clearEncounter(){
    document.getElementById("encounter_list").innerHTML = "<tr><td>Name</td>\
    <td>Max HP</td><td>Initiative</td><td>Current HP</td></tr>"
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
                shouldSwitch= true;
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


function setUserData() {
    let set_data = function(data) {
        if (data == null)
            return

        document.getElementById("header").innerHTML = "Logged in as " + data.name;
    }
    requestApiJsonData("api/session", "GET", {}, set_data)
}


setUserData()
