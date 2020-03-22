let socket = io("http://localhost:5000/");
socket.on('connect', function () { });

let username = null;

socket.on("message", function(json) {
    let message = JSON.parse(json);

    let div = document.createElement("div");
    div.className = "chat_message";
    div.innerHTML = message.message;

    let chat = document.getElementById("chat");
    chat.appendChild(div);
});

function connect(username) {
    socket.emit("join", {
        "username": username,
        "campaign": CAMPAIGN_ID,
    })
}

function sendMessage() {
    const div = document.getElementById("message_data");
    const msg = div.value;
    div.value = "";
    if (username === null) {
        username = msg;
        connect(msg);
        return;
    }

    socket.emit("message", {
        "campaign": CAMPAIGN_ID,
        "username": username,
        "message": msg,
    })
}