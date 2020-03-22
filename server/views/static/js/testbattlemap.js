let socket = io();
socket.on('connect', function () { });

socket.on("message", function(json) {
    let message = JSON.parse(json);

    let div = document.createElement("div");
    div.className = "chat_message";
    div.innerHTML = message.message;

    let chat = document.getElementById("chat");
    chat.appendChild(div);
});

socket.emit("join", {
    "username": USERNAME,
    "campaign": CAMPAIGN_ID,
});

function sendMessage(e) {
    const div = document.getElementById("message_data");
    const msg = div.value;
    div.value = "";

    socket.emit("message", {
        "campaign": CAMPAIGN_ID,
        "message": msg,
    });

    return false;
}