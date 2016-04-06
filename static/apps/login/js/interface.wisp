(def Users (require "./users.js"))

(defn getValue [id]
  (.val ($ id)))
(defn getListOfValues []
  (.map (Array.prototype.slice.call arguments 0) getValue ))
(defn signup [user-field email-field password-field password-repeat-field]
  (Users.signup.apply null (getListOfValues
                           user-field
                           email-field
                           password-field
                           password-repeat-field)))
