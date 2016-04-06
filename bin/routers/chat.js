module.exports = function openChatIo(dir, scope) {
    var io = scope.io;
    var chatIo = scope.chatIo = io.of("/chat");
    var users = new Map();
    chatIo.on("connection", function(socket) {
        var user;
        function listUsers(respond) {
            var list = [];
            users.forEach((user) => {
                list.push(user.name);
            });
            respond(list);
        }
        function connectUser(u, done) {
            if (users.has(u)) {
                console.log("user exists", u);
                socket.emit("user exists", u, done);
            } else {
                user = {
                    socket: socket,
                    name: u,
                };
                users.set(u, user);

                chatIo.emit("user connected", u);

                chatIo.emit(
                    "broadcast message",
                    "system", "user " + u + " connected",
                    Date.now()
                );
            }
        }
        function transmitMessage(u, d, ts, respond) {
            console.log("message transmitted");
            chatIo.emit("broadcast message", u, d, ts);
            respond();
        }
        function disconnect() {
            users.delete(user.name);
            chatIo.emit (
                "broadcast message",
                "system", "user " + user.name + " disconnected", Date.now()
            );
        }
        console.log("user connected to chat");
        socket.on("disconnect", disconnect);
        socket
            .on("list users", listUsers)
            .on("transmit message", transmitMessage)
            .on("user connect", connectUser);
    });
}
