(ns kettlelogic.bin.routers.users
    "socket.io handler for the user namespace"
    (:require
     [lib.lib.wrappers.object :as obj]
     [lib.lib.filesystem.Inode :as Inode]
     [lib.lib.functional.partialApplication :as part]
     [midi-keyboard.bin.db.connect :as db]))
(defmacro -> [& operations]
  (reduce
   (fn [form operation]
       (cons (first operation)
             (cons form (rest operation))))
   (first operations)
   (rest operations)))


(defmacro def-dir-handler [n & rest]
  `(defn ~n [dir scope] ~@rest))

(defmacro def-curried [name & rest]
  `(def ~name (part.curry (fn ~@rest))))


(defn def-event-listeners [socket handlers]
  (-> (obj.mask handlers)
      (.forEach (fn [h k]
                    (console.log "adding listener" k h)
                    (socket.on k h)))))
(def-curried userSession [io users userIo socket]
  (def userEntity)

  (defn signup [username email password callback]
    "adds a user to the database with the given credentials"

      (console.log "adding user" username email password)

      (-> (db.users.signup
           { :username username
             :email email
             :password password } )

          (.then callback)

          (.catch callback) ) )

  (defn login [email password callback]
    "verify given credentials against the database, if value add to list of online users"

    (defn respond-success [user]
        (console.log "login success" user)
        (users.set email user)
        (set! userEntity user)
        (callback { :success true
                    :user user } ) )

    (defn respond-fail[err]
        (console.log "login error" err.stack)
        (callback { :success false
                    :message err.stack } ) )

    (console.log "loggin user in" email password)

    (-> (db.users.login email password)

        (.then respond-success )

        (.catch respond-fail ) ) )

  (defn logout [email]
    "given an email, remove a user from the list of active/online users."
    (console.log "user logging out" email)
    (-> (db.users.logout email)
        (.then (fn []))))
  (defn disconnect []
    (users.delete userEntity.email))

  (def-event-listeners socket
    { :signup signup
      :login login } ) )

(def-dir-handler userIoHandler
  (def io scope.io)
  (def users (Map.))
  (def userIo (io.of "/user"))
  (set! scope.userIo userIo)
  (userIo.on :connection
             (user-session io users userIo)))
