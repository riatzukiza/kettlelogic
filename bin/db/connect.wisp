
(ns kettlelogic.bin.db.connect
    "database initialization"
    (:require [lib.lib.db :as DB]))

(def db (new DB.Database
         :kettlelogic
         :localhost
         :root
         "OgumSatyam_Om1216"
         10))

(db.on "*" (fn [event] (console.log "Db event" event)))
(def users (DB.schemas.user.create "users" db))
(db.on "query" (fn [err]
                   (console.log err.stack)) )

