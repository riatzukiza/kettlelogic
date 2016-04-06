'use strict'
(include "../../../../lib/lib/macros.ls")
(require "angular")

(var part (require "/home/aaron/node_modules/lib/lib/functional/partialApplication.js"))
(var curry (get "curry" part))
(var defer (get "defer" part))
(var midi (require "./midi.js"))
(var app (angular.module "pianojs" []))

;(var evented (require "/home/aaron/node_modules/lib/lib/async/eventedInterface.js"))

(macro defController (name dep rest...)
       (do (defun ~name ($scope ~@dep) ~rest...)
           (app.controller (get "name" ~name) ~name)))

(macro defFactory (name dep rest...)
       (do (defun ~name (~@dep) ~rest...)
           (app.factory (get "name" ~name) ~name)))

(macro defIdentity (value)
  (lambda () ~value))
(defFactory midiDevices ($q)
  (console.log "midiDevices")
  (var inputs null)
  (var outputs null)
  (var midiAccess null)

  (var objInter null)
  (-> ($q.resolve (midi))
      (.then (lambda (access)
               (set midiAccess midiAccess)
               (set inputs access.inputs)
               (set outputs access.outputs)
               access)))
  (set objInter (object
                   on (lambda (event handler)
                        (access.addEventListener
                         event
                         handler false) this)
                   getInputs (defIdentity inputs)
                   getOutputs (defIdentity outputs)
                   getAccess (defIdentity midiAccess))))
(defFactory modelFiles ()
  (console.log "model files"))
(defController devicesController ()
  (console.log "devices controller"))
(defController fileController ()
  (console.log "file controller"))
(defController playerController (midiDevices)
  (console.log "player controller"))
(defController modelController ()
  (console.log "model controller"))
