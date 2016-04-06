var musicGen = require("./musicGenerator.js");


function inputListener(midimessageEvent) {
    var port, portId,
        data = midimessageEvent.data,
        type = data[0],
        noten = data[1],
        velocity = data[2];
    var delay = 0; // play one note every quarter second
    //var note = 50; // the MIDI note
    //var velocity = 127; // how hard the note hits
    // play the note
    var note = {
        velocity: velocity,
        note: noten,
        delay: delay
    };
    musicGen.playNote(note);
    /*notes.push(playNote(note));
     if (notes.length == 5) {
     generateCompositeLanguage(notes);
     } else if ((notes.length % 5) == 0) {
     console.log("songlang", songlang)
     songlang.addNotes(notes.slice(-5));
     }*/
}

function loadMIDIHardwareReader(cb) {
    if (navigator.requestMIDIAccess !== undefined) {
        return navigator.requestMIDIAccess();
    }
    // browsers without WebMIDI API or Jazz plugin
    else {
        return Promise.reject(new Error("Browser doesnot support midi devices"))
    }
}

module.exports = function(cb) {

    'use strict';
    return new Promise(function(suc,fail) {
        MIDI.loadPlugin({
            soundfontUrl: "/MIDI/examples/soundfont/",
            instrument: "acoustic_grand_piano",
            onsuccess: function() {
                return loadMIDIHardwareReader().then(suc,fail)
            },
            onerror:fail
        });
    })

};
