
function toggleChat() {
    let div = document.getElementById("chatbox")
    let animationSpeed = 60;
    if (div.style.display == "none") {
        div.style.display = "block";
        document.getElementById("chatbox_expand").style.display = "none";

        let pos = div.offsetWidth
        let id = setInterval(moveIn, 1000 / 30)

        function moveIn() {
            pos -= animationSpeed;
            if (pos <= 0)
                pos = 0

            div.style.right = -pos + "px";
            if (pos == 0)
                clearInterval(id);
        }
    } else {
        let pos = 0;
        let id = setInterval(moveOut, 1000 / 30) // 30 fps

        function moveOut() {
            if (pos >= div.offsetWidth) {
                clearInterval(id);
                div.style.display = "none";
                document.getElementById("chatbox_expand").style.display = "block";
            }
            else {
                pos += animationSpeed;
                div.style.right = -pos + "px";
            }
        }
    }
}

function getMessages() {
    let func = function(data) {
        if (!data.success) {
            console.log("Something went wrong retrieving chat messages.");
            console.log("Error message: " + data.error);
            return;
        }
        let chat = document.getElementById("chat_messages");
        chat.innerHTML = ""
        for (message of data.messages) {
            div = document.createElement("div");
            div.innerHTML = message.sender_name + " (" + message.player_name + "): " + message.message;
            chat.insertBefore(div, chat.firstChild);
        }
    }

    let data = {
        playthrough_id: PLAYTHROUGH_ID
    }

    requestApiJsonData("api/getmessages", "POST", data, func)
}
