let socket = io();
socket.on('connect', function () {
    socket.emit('my event', {data: 'I\'m connected!'});
});

function sendMessage() {
    const msg = document.getElementById("message_send").value;

    socket.emit()
}