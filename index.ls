(include "../lib/lib/macros.ls")
(var child_process (require "child_process"))
(var Path (require "path"))
(var fork child_process.fork)
(var Inode lib.filesystem)
(var print (console.log.bind console))
(defun Monad (mv)
  (defun unit (mf)
    (defun bind ()
      (mf.call bind mv ...arguments))))
(defun DoMonad ()
  (var fns [...arguments])
  (lambda (bind)
    (-> fns
        (.map bind)
        (.reduce (lambda (scope m)
                   (m scope) scope) {}))))


(macro defDirHandler (name rest...)
      (defun ~name (dir scope) ~rest...))

(var child (fork "main.js"))
(defun restartApp (path)
  (var ext (Path.extname path))
  (print "extension" ext)
  (when (= ext ".js")
    (if (! child.exiting)
        (child.once "exit" (lambda ()
                             (set child (fork "main.js")))))
    (set child.exiting true)
    (setTimeout (lambda () (child.kill)) 1500)))

(defDirHandler watchInode (dir.watch))
(defDirHandler listenForChanges
  (dir.on "change" restartApp))

( -> (Inode.get "./bin")
     (.then Monad)
     (.then (DoMonad listenForChanges watchInode)))

