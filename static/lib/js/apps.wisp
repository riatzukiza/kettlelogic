(def Files (require "./files.js"))
(def Path (require "path"))
(def apps (new Set))
(defn getApp [name cb]
  (defn handle-response [err file]
    (if err
        (cb err)
        (cb (-> ["<script src='"
                (Path.join "/apps" name "index.js") "'></script>"]
                (.join)))))
  (Files.readFile (Path.join "apps" name "index.html") handle-response))
(defn insertv [panel name cb]
  (defn insertAppPanel [text]
    (def split (panel.splitv))
    (apps.add split)
    (set! split.innerHTML text)
    (cb split))
  (getApp name insertAppPanel))
(defn change [panel name cb]
  (defn changeAppPanel [text]
    (set! panel.innerHTML text)
    (cb panel))
  (getApp name changeAppPanel))
