(def socket (io.connect "/files"))
(defn readFile [path cb]
  (socket.emit "readFile" path cb))
