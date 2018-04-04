function buttonAddEnemy(){
    str = "Select the desired enemy you want to add and click 'Add'.<br>\
        <select id='content_selected'>";

    for (enemy of enemyList[0]){
        str += "<option value='" + enemy + "'>" + enemy + "</option>"
    }
    str += "</select><br><button onclick='addEnemy()'>Add</button>";

    document.getElementById("content_expanded").innerHTML = str;
}

function clearEncounter(){
    document.getElementById("encounter_list").innerHTML = "<tr><td>Name</td>\
        <td>Arbitrary Stats</td><td>Initiative</td></tr>"
}

function addEnemy(){
    e = document.getElementById("content_selected")
    enemy = e.options[e.selectedIndex].value;

    document.getElementById("encounter_list").insertRow(-1).innerHTML = "<tr><td>" + enemy +
        "</td><td>" + enemyList[1][enemyList[0].indexOf(enemy)] + "</td><td>" +
        Math.floor(Math.random() * 20 + 1) + "</td></tr>"
}

clearEncounter()


enemyList = [
    ["Banaan", "Komkommer"],
    ["3", "4"]
]
