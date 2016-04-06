(def socket (io.connect "/user"))
(defn signup [username email password ]
  (console.log "adding user" username password email)
      (socket.emit "signup" username email password
                       (fn [val] (console.log val))))
(defn login [email password f]
  (console.log "loggin in user" password email)
  (socket.emit "login" email password f))
