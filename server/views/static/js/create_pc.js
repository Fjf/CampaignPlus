function uploadCharacter() {
    let name = document.getElementById("name").value;
    let race = document.getElementById("race").value;
    let class_name = document.getElementById("class").value;
    let backstory = document.getElementById("backstory").value;

    let func = function (data) {
        if (!data.success) {
            console.log("Creation of player character was unsuccessful.")
            console.log("The following error was thrown: " + data.error)
            return
        }

        console.log("Your player character was added successfully.")
    }

    data = {
        code: code,
        name: name,
        race: race,
        class_name: class_name,
        backstory: backstory
    }
    requestApiJsonData("/api/createplayer", "POST", data, func)
}