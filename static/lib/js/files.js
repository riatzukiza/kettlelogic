var socket = exports.socket = io.connect('/files');
var readFile = exports.readFile = function readFile(path, cb) {
    return socket.emit('readFile', path, cb);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFub255bW91cy53aXNwIl0sIm5hbWVzIjpbInNvY2tldCIsImV4cG9ydHMiLCJpbyIsImNvbm5lY3QiLCJyZWFkRmlsZSIsInBhdGgiLCJjYiIsImVtaXQiXSwibWFwcGluZ3MiOiJBQUFBLElBQUtBLE1BQUEsR0FBQUMsT0FBQSxDQUFBRCxNQUFBLEdBQVFFLEVBQUEsQ0FBR0MsT0FBSixDQUFZLFFBQVosQ0FBWjtBQUNBLElBQU1DLFFBQUEsR0FBQUgsT0FBQSxDQUFBRyxRQUFBLEdBQU4sU0FBTUEsUUFBTixDQUFnQkMsSUFBaEIsRUFBcUJDLEVBQXJCLEVBQ0U7QUFBQSxXQUFDTixNQUFBLENBQU9PLElBQVIsQ0FBYSxVQUFiLEVBQXdCRixJQUF4QixFQUE2QkMsRUFBN0I7QUFBQSxDQURGIiwic291cmNlc0NvbnRlbnQiOlsiKGRlZiBzb2NrZXQgKGlvLmNvbm5lY3QgXCIvZmlsZXNcIikpXG4oZGVmbiByZWFkRmlsZSBbcGF0aCBjYl1cbiAgKHNvY2tldC5lbWl0IFwicmVhZEZpbGVcIiBwYXRoIGNiKSlcbiJdfQ==