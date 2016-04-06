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
    var midiKeyboard_bin_db_connect = require('kettlelogic/bin/db/connect');
    var db = midiKeyboard_bin_db_connect;
}
void 0;
void 0;
void 0;
function defEventListeners(socket, handlers) {
    return obj
        .mask(handlers)
        .forEach(function (h, k) {
            console.log('adding listener', k, h);
            return socket.on(k, h);
        });
};
var userSession = part.curry(function (io, users, userIo, socket) {
    var userEntity = void 0;
    var signup = function signup(username, email, password, callback) {
        'adds a user to the database with the given credentials';
        console.log('adding user', username, email, password);
        return db
            .users
            .signup({
                'username': username,
                'email': email,
                'password': password
            })
            .then(callback)
            .catch(callback);
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
        return db
            .users
            .login(email, password)
            .then(respondSuccess)
            .catch(respondFail);
    };
    var logout = function logout(email) {
        'given an email, remove a user from the list of active/online users.';
        console.log('user logging out', email);
        return db
            .users
            .logout(email)
    };
    var disconnect = function disconnect() {
        return users
            .delete(userEntity.email);
    };
    return defEventListeners(socket, {
        'signup': signup,
        'login': login
    });
});
var io = scope.io;
var users = new Map();
var userIo = io.of('/user');
scope.userIo = userIo;
userIo.on('connection', userSession(io, users, userIo));
