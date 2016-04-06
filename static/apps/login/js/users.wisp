(def userSocket (io.connect "/user"))
(defn signup [username email password ]
  (console.log "adding user" username password email)
      (userSocket.emit "signup" username email password
                       (fn [val] (console.log val))))
(signup "risuki" "foamy125@gmail.com" "RizuKiza42FortyTwo125")
