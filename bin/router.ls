(include "../../lib/lib/macros.ls")
(var express (require "express"))
(var app (express))
(var Path (require "path"))

(var http (-> (require 'http')
              (.Server app)))
(var io ((require "socket.io") http))
(var lib (require "lib"))
(var maybe lib.functional.logical.maybe)
(var is lib.functional.predicates)
;(var Functor lib.functional.Functor)
;(var Identity lib.functional.Identity)

(var Inode lib.filesystem)
(defun Monad (mv) (defun unit (mf)(defun bind () (mf.call bind mv ...arguments))))

(defun DoMonad ()
  (var fns [...arguments])
  (lambda (bind)
    (-> fns
        (.map bind)
        (.reduce (lambda (scope m)
                   (m scope) scope) {}))))
(macro defDirHandler (name rest...)
       (defun ~name (dir scope) ~rest...))
(var print (console.log.bind console))

(defun defPrint ()
  (defer print [...arguments]))

(defDirHandler openIO
  (set scope.sessions {})
  (io.on "connection" (lambda (socket)
                        (print "user connected")
                        (var emit (socket.emit.bind socket))
                        (set socket.id scope.sessions socket)
                        (socket.once "disconnect"
                                     (defer print
                                       ["user disconnected"]))
                        (dir.on  "*" emit))))

(defDirHandler startHttpServer
  (-> app (.use (express.static "./static")))
  (http.listen 8080 (defPrint "http server listening on port 8080")))

(defDirHandler watchInode (dir.watch))

( -> (Inode.get "./static")
     (.then Monad)
     (.then (DoMonad openIO
                     startHttpServer
                     watchInode)))

