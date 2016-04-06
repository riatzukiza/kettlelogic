{
    var _ns_ = {
        id: 'kettlelogic.bin.routers.users',
        doc: 'socket.io handler for the user namespace'
    };
    var lib_lib_wrappers_object = require('lib/lib/wrappers/object');
    var obj = lib_lib_wrappers_object;
    var lib_lib_filesystem_Inode = require('lib/lib/filesystem/Inode');
    var Inode = lib_lib_filesystem_Inode;
    var lib_lib_functional_partialApplication = require('lib/lib/functional/partialApplication');
    var part = lib_lib_functional_partialApplication;
    var midiKeyboard_bin_db_connect = require('midi-keyboard/bin/db/connect');
    var db = midiKeyboard_bin_db_connect;
}
void 0;
void 0;
void 0;
var defEventListeners = exports.defEventListeners = function defEventListeners(socket, handlers) {
    return obj.mask(handlers).forEach(function (h, k) {
        console.log('adding listener', k, h);
        return socket.on(k, h);
    });
};
var userSession = exports.userSession = part.curry(function (io, users, userIo, socket) {
    var userEntity = void 0;
    var signup = function signup(username, email, password, callback) {
        'adds a user to the database with the given credentials';
        console.log('adding user', username, email, password);
        return db.users.signup({
            'username': username,
            'email': email,
            'password': password
        }).then(callback).catch(callback);
    };
    var login = function login(email, password, callback) {
        'verify given credentials against the database, if value add to list of online users';
        var respondSuccess = function respondSuccess(user) {
            console.log('login success', user);
            users.set(email, user);
            userEntity = user;
            return callback({
                'success': true,
                'user': user
            });
        };
        var respondFail = function respondFail(err) {
            console.log('login error', err.stack);
            return callback({
                'success': false,
                'message': err.stack
            });
        };
        console.log('loggin user in', email, password);
        return db.users.login(email, password).then(respondSuccess).catch(respondFail);
    };
    var logout = function logout(email) {
        'given an email, remove a user from the list of active/online users.';
        console.log('user logging out', email);
        return db.users.logout(email).then(function () {
            return void 0;
        });
    };
    var disconnect = function disconnect() {
        return users.delete(userEntity.email);
    };
    return defEventListeners(socket, {
        'signup': signup,
        'login': login
    });
});
var userIoHandler = exports.userIoHandler = function userIoHandler(dir, scope) {
    var io = scope.io;
    var users = new Map();
    var userIo = io.of('/user');
    scope.userIo = userIo;
    return userIo.on('connection', userSession(io, users, userIo));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFub255bW91cy53aXNwIl0sIm5hbWVzIjpbIl9uc18iLCJpZCIsImRvYyIsImRlZkV2ZW50TGlzdGVuZXJzIiwiZXhwb3J0cyIsInNvY2tldCIsImhhbmRsZXJzIiwib2JqIiwibWFzayIsImZvckVhY2giLCJoIiwiayIsImNvbnNvbGUiLCJsb2ciLCJvbiIsInVzZXJTZXNzaW9uIiwiaW8iLCJ1c2VycyIsInVzZXJJbyIsInVzZXJFbnRpdHkiLCJzaWdudXAiLCJ1c2VybmFtZSIsImVtYWlsIiwicGFzc3dvcmQiLCJjYWxsYmFjayIsImRiIiwidXNlcnMuc2lnbnVwIiwidGhlbiIsImNhdGNoIiwibG9naW4iLCJyZXNwb25kU3VjY2VzcyIsInVzZXIiLCJzZXQiLCJyZXNwb25kRmFpbCIsImVyciIsInN0YWNrIiwidXNlcnMubG9naW4iLCJsb2dvdXQiLCJ1c2Vycy5sb2dvdXQiLCJkaXNjb25uZWN0IiwiZGVsZXRlIiwidXNlcklvSGFuZGxlciIsInNjb3BlIiwib2YiXSwibWFwcGluZ3MiOiI7SUFBQSxJQUFDQSxJLEdBQUQ7QUFBQSxRQUFBQyxFLEVBQUksK0JBQUo7QUFBQSxRQUFBQyxHLEVBQ0ksMENBREo7QUFBQSxNOzs7Ozs7Ozs7Ozs7O0FBdUJBLElBQU1DLGlCQUFBLEdBQUFDLE9BQUEsQ0FBQUQsaUJBQUEsR0FBTixTQUFNQSxpQkFBTixDQUEyQkUsTUFBM0IsRUFBa0NDLFFBQWxDLEVBQ0U7QUFBQSxXQUFLQyxHQUFBLENBQUlDLElBQUwsQ0FBVUYsUUFBVixDQUNDLENBQUNHLE9BRE4sQ0FDYyxVQUFLQyxDQUFMLEVBQU9DLENBQVAsRUFDSTtBQUFBLFFBQUNDLE9BQUEsQ0FBUUMsR0FBVCxDQUFhLGlCQUFiLEVBQStCRixDQUEvQixFQUFpQ0QsQ0FBakM7QUFBQSxRQUNBLE9BQUNMLE1BQUEsQ0FBT1MsRUFBUixDQUFXSCxDQUFYLEVBQWFELENBQWIsRUFEQTtBQUFBLEtBRmxCO0FBQUEsQ0FERixDO0FBS0EsSUFBYUssV0FBQSxHQUFB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LEVBQVgsQ0FEQTtBQUFBLElBRUEsSUFBS0MsTUFBQSxHQUFRRixFQUFBLENBQUcyQixFQUFKLENBQU8sT0FBUCxDQUFaLENBRkE7QUFBQSxJQUdNRCxLQUFBLENBQU14QixNQUFaLEdBQW1CQSxNQUFuQixDQUhBO0FBQUEsSUFJQSxPQUFDQSxNQUFBLENBQU9KLEVBQVIsQyxZQUFBLEVBQ1lDLFdBQUQsQ0FBY0MsRUFBZCxFQUFpQkMsS0FBakIsRUFBdUJDLE1BQXZCLENBRFgsRUFKQTtBQUFBLENBREYiLCJzb3VyY2VzQ29udGVudCI6WyIobnMga2V0dGxlbG9naWMuYmluLnJvdXRlcnMudXNlcnNcbiAgICBcInNvY2tldC5pbyBoYW5kbGVyIGZvciB0aGUgdXNlciBuYW1lc3BhY2VcIlxuICAgICg6cmVxdWlyZVxuICAgICBbbGliLmxpYi53cmFwcGVycy5vYmplY3QgOmFzIG9ial1cbiAgICAgW2xpYi5saWIuZmlsZXN5c3RlbS5Jbm9kZSA6YXMgSW5vZGVdXG4gICAgIFtsaWIubGliLmZ1bmN0aW9uYWwucGFydGlhbEFwcGxpY2F0aW9uIDphcyBwYXJ0XVxuICAgICBbbWlkaS1rZXlib2FyZC5iaW4uZGIuY29ubmVjdCA6YXMgZGJdKSlcbihkZWZtYWNybyAtPiBbJiBvcGVyYXRpb25zXVxuICAocmVkdWNlXG4gICAoZm4gW2Zvcm0gb3BlcmF0aW9uXVxuICAgICAgIChjb25zIChmaXJzdCBvcGVyYXRpb24pXG4gICAgICAgICAgICAgKGNvbnMgZm9ybSAocmVzdCBvcGVyYXRpb24pKSkpXG4gICAoZmlyc3Qgb3BlcmF0aW9ucylcbiAgIChyZXN0IG9wZXJhdGlvbnMpKSlcblxuXG4oZGVmbWFjcm8gZGVmLWRpci1oYW5kbGVyIFtuICYgcmVzdF1cbiAgYChkZWZuIH5uIFtkaXIgc2NvcGVdIH5AcmVzdCkpXG5cbihkZWZtYWNybyBkZWYtY3VycmllZCBbbmFtZSAmIHJlc3RdXG4gIGAoZGVmIH5uYW1lIChwYXJ0LmN1cnJ5IChmbiB+QHJlc3QpKSkpXG5cblxuKGRlZm4gZGVmLWV2ZW50LWxpc3RlbmVycyBbc29ja2V0IGhhbmRsZXJzXVxuICAoLT4gKG9iai5tYXNrIGhhbmRsZXJzKVxuICAgICAgKC5mb3JFYWNoIChmbiBbaCBrXVxuICAgICAgICAgICAgICAgICAgICAoY29uc29sZS5sb2cgXCJhZGRpbmcgbGlzdGVuZXJcIiBrIGgpXG4gICAgICAgICAgICAgICAgICAgIChzb2NrZXQub24gayBoKSkpKSlcbihkZWYtY3VycmllZCB1c2VyU2Vzc2lvbiBbaW8gdXNlcnMgdXNlcklvIHNvY2tldF1cbiAgKGRlZiB1c2VyRW50aXR5KVxuXG4gIChkZWZuIHNpZ251cCBbdXNlcm5hbWUgZW1haWwgcGFzc3dvcmQgY2FsbGJhY2tdXG4gICAgXCJhZGRzIGEgdXNlciB0byB0aGUgZGF0YWJhc2Ugd2l0aCB0aGUgZ2l2ZW4gY3JlZGVudGlhbHNcIlxuXG4gICAgICAoY29uc29sZS5sb2cgXCJhZGRpbmcgdXNlclwiIHVzZXJuYW1lIGVtYWlsIHBhc3N3b3JkKVxuXG4gICAgICAoLT4gKGRiLnVzZXJzLnNpZ251cFxuICAgICAgICAgICB7IDp1c2VybmFtZSB1c2VybmFtZVxuICAgICAgICAgICAgIDplbWFpbCBlbWFpbFxuICAgICAgICAgICAgIDpwYXNzd29yZCBwYXNzd29yZCB9IClcblxuICAgICAgICAgICgudGhlbiBjYWxsYmFjaylcblxuICAgICAgICAgICguY2F0Y2ggY2FsbGJhY2spICkgKVxuXG4gIChkZWZuIGxvZ2luIFtlbWFpbCBwYXNzd29yZCBjYWxsYmFja11cbiAgICBcInZlcmlmeSBnaXZlbiBjcmVkZW50aWFscyBhZ2FpbnN0IHRoZSBkYXRhYmFzZSwgaWYgdmFsdWUgYWRkIHRvIGxpc3Qgb2Ygb25saW5lIHVzZXJzXCJcblxuICAgIChkZWZuIHJlc3BvbmQtc3VjY2VzcyBbdXNlcl1cbiAgICAgICAgKGNvbnNvbGUubG9nIFwibG9naW4gc3VjY2Vzc1wiIHVzZXIpXG4gICAgICAgICh1c2Vycy5zZXQgZW1haWwgdXNlcilcbiAgICAgICAgKHNldCEgdXNlckVudGl0eSB1c2VyKVxuICAgICAgICAoY2FsbGJhY2sgeyA6c3VjY2VzcyB0cnVlXG4gICAgICAgICAgICAgICAgICAgIDp1c2VyIHVzZXIgfSApIClcblxuICAgIChkZWZuIHJlc3BvbmQtZmFpbFtlcnJdXG4gICAgICAgIChjb25zb2xlLmxvZyBcImxvZ2luIGVycm9yXCIgZXJyLnN0YWNrKVxuICAgICAgICAoY2FsbGJhY2sgeyA6c3VjY2VzcyBmYWxzZVxuICAgICAgICAgICAgICAgICAgICA6bWVzc2FnZSBlcnIuc3RhY2sgfSApIClcblxuICAgIChjb25zb2xlLmxvZyBcImxvZ2dpbiB1c2VyIGluXCIgZW1haWwgcGFzc3dvcmQpXG5cbiAgICAoLT4gKGRiLnVzZXJzLmxvZ2luIGVtYWlsIHBhc3N3b3JkKVxuXG4gICAgICAgICgudGhlbiByZXNwb25kLXN1Y2Nlc3MgKVxuXG4gICAgICAgICguY2F0Y2ggcmVzcG9uZC1mYWlsICkgKSApXG5cbiAgKGRlZm4gbG9nb3V0IFtlbWFpbF1cbiAgICBcImdpdmVuIGFuIGVtYWlsLCByZW1vdmUgYSB1c2VyIGZyb20gdGhlIGxpc3Qgb2YgYWN0aXZlL29ubGluZSB1c2Vycy5cIlxuICAgIChjb25zb2xlLmxvZyBcInVzZXIgbG9nZ2luZyBvdXRcIiBlbWFpbClcbiAgICAoLT4gKGRiLnVzZXJzLmxvZ291dCBlbWFpbClcbiAgICAgICAgKC50aGVuIChmbiBbXSkpKSlcbiAgKGRlZm4gZGlzY29ubmVjdCBbXVxuICAgICh1c2Vycy5kZWxldGUgdXNlckVudGl0eS5lbWFpbCkpXG5cbiAgKGRlZi1ldmVudC1saXN0ZW5lcnMgc29ja2V0XG4gICAgeyA6c2lnbnVwIHNpZ251cFxuICAgICAgOmxvZ2luIGxvZ2luIH0gKSApXG5cbihkZWYtZGlyLWhhbmRsZXIgdXNlcklvSGFuZGxlclxuICAoZGVmIGlvIHNjb3BlLmlvKVxuICAoZGVmIHVzZXJzIChNYXAuKSlcbiAgKGRlZiB1c2VySW8gKGlvLm9mIFwiL3VzZXJcIikpXG4gIChzZXQhIHNjb3BlLnVzZXJJbyB1c2VySW8pXG4gICh1c2VySW8ub24gOmNvbm5lY3Rpb25cbiAgICAgICAgICAgICAodXNlci1zZXNzaW9uIGlvIHVzZXJzIHVzZXJJbykpKVxuIl19
