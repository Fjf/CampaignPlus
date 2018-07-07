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
            str += "<option value='" + player + "'>" + player.name + " (" + player.class + ")</option>"
        }
        document.getElementById("content_selected_player").innerHTML = str;
    }

    response = requestApiJsonData("api/getplayers", "GET", {}, func)
}


function requestApiJsonData(api, requestType, data, callback) {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4) {
            callback(JSON.parse(xmlHttp.response));
        }
    }

    xmlHttp.open(requestType, api, true)
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify(data))
}

function addNewPlayer(){
    var naam = document.getElementById("new_player_name").value;
    var klasse = document.getElementById("new_player_class").value;
    var rest = document.getElementById("new_player_rest").value;

    let data = {
        name: naam,
        class: klasse,
    }
    response = requestApiJsonData("api/createplayer", "POST", data, null)

    refreshPlayers()
}

function addNewEnemy(){
    naam = document.getElementById("new_enemy_name").value;
    maxhp = document.getElementById("new_enemy_maxhp").value;

    var d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();

    document.cookie = "enemy_" + naam + "=" + maxhp + ";" + expires + ";";

    enemyList[0].push(naam)
    enemyList[1].push(maxhp)
    refreshEnemies()
}

function refreshEnemies(){
    str = "";
    for (enemy of enemyList[0]){
        str += "<option value='" + enemy + "'>" + enemy + "</option>"
    }

    document.getElementById("content_selected_enemy").innerHTML = str;

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
    enemy = e.options[e.selectedIndex].value;
    enemyIdx = enemyList[0].indexOf(enemy)
    document.getElementById("encounter_list").insertRow(-1).innerHTML = "<tr><td>" + enemy +
        "</td><td>" + enemyList[1][enemyIdx] + "</td><td>" +
        Math.floor(Math.random() * 20 + 1) + "</td><td><input type='text' value='" + enemyList[1][enemyIdx] + "'></td></tr>"
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

enemyList = [
    ["Banaan", "Komkommer"],
    ["30", "40"]
]

function loadPersonalEnemies(){
    for (cookieStr of document.cookie.split(';')){
        cookieStr = cookieStr.trim()
        if (cookieStr.length == 0 || !cookieStr.startsWith("enemy"))
            continue;
        keyval = cookieStr.split("=")
        enemyList[0].push(keyval[0].split("_")[1])
        enemyList[1].push(keyval[1])
    }
}

function gandalfBg(){
    for (div of document.getElementsByTagName('*')){
        div.style.backgroundImage = "url('https://m.popkey.co/d7e3ff/EjVpv.gif')";
    }

    var audio = new Audio('sax.mp3');
    audio.currentTime = 31
    audio.play();
     if (document.getElementById("content_right").style.backgroundImage == "")
         document.getElementById("content_right").style.backgroundImage = "url('https://m.popkey.co/d7e3ff/EjVpv.gif')";
     else {
         document.getElementById("content_right").style.backgroundImage = "";
     }
}

loadPersonalEnemies()

//setTimeout(gandalfBg, 2000)