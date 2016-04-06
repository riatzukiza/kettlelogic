"use strict";

var trie = require("./markovChain.js");
var notes = [];
var boardStates = [];
var songlang;
var boardState = {};
function saveCompositeModel(name,model,cb)  {
    socket.emit("saveJSON","./static/prob/models/"+name+".composite.json")
}

function playNote(obj) {
    console.log("playing note", obj);
    obj.time = Date.now();
    MIDI.setVolume(0, parseInt(obj.velocity));
    if (obj.velocity > 0) {
        MIDI.noteOn(0, parseInt(obj.note, 10), parseInt(obj.velocity), obj.delay);
    } else {
        MIDI.noteOff(0, parseInt(obj.note, 10), parseInt(obj.velocity, 10), obj.delay, 10);
    }
    return obj;
}

function compositeNote(lang, priors) {
    console.log("generating note from language", lang, songlang)
    var note = trie.emitWordGiven(lang)(priors);
    if (priors.length < 5) {
        priors.push(note);
    } else {
        priors.unshift();
        priors.push(note);
    }
    note = JSON.parse(note);
    return {
        velocity: note[0],
        note: note[1],
        delay: note[2],
        time: note[3]
    }
}

function playCompositeRandomSong(lang, length, priors) {
    console.log("playing random song", lang)
    priors = priors || [JSON.stringify([0, 0, 0, 0])];
    if (length > 0) {

        console.log("PLAYING NOTE", note)
        var time = 0;
        for (var i = 0; i < length; i++) {
            var note = compositeNote(lang, priors);
            time += note.time / 1000
            note.delay = time;
            playNote(note);
        }

        /*
        setTimeout(function() {
            playCompositeRandomSong(lang,length-1,priors);
        },note.time)
        */
    }
}

function generateCompositeLanguage(notes) {
    function mapNotes(notes) {
        console.log("mapping notes", notes)
        var lang = {
            velocity: [0],
            note: [0],
            delay: [0],
            time: [0],
            timeStamp: [0],
        };
        notes.forEach(function(note, i) {
            console.log("notess", i)
            i = i;
            lang.velocity[i] = note.velocity;
            lang.note[i] = note.note
            lang.delay[i] = note.delay;
            lang.timeStamp[i] = note.time
        });
        lang.time = lang.timeStamp.map(function(t, i, a) {
            if (i != a.length) {
                return a[i + 1] - t;
            } else {
                return 0;
            }
        });
        return lang.velocity.map(function(v, i) {
            return JSON.stringify([
                v,
                lang.note[i],
                lang.delay[i],
                lang.time[i]
            ]);
        });
    }

    function generateModel(map) {
        console.log("generating model from map", map);
        return trie.genProb(trie.createDictionary(map, 5));
    }
    songlang = generateModel(mapNotes(notes));
    songlang.addNotes = function(notes) {
        console.log("adding notes", notes);
        return songlang.updateProb(mapNotes(notes));
    }
    console.log("song lang", songlang)
    return songlang
}
module.exports = {
    playNote:playNote
}
