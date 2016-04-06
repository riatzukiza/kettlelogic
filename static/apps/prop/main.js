'use strict';


var notes = [];
var boardStates = [];
var songlang;
var boardState = {};
function copyObject(o) {


    var x = {};
    Object.keys(o).forEach(function(k) {
        x = o[k];
    });
    return x;
}

function playNote(obj) {
    console.log("playing note",obj);
    obj.time = Date.now();
    MIDI.setVolume(0, parseInt(obj.velocity));
    if(obj.velocity > 0) {
        MIDI.noteOn(0, parseInt(obj.note,10), parseInt(obj.velocity), obj.delay);
    } else {
        MIDI.noteOff(0, parseInt(obj.note,10), parseInt(obj.velocity,10), obj.delay,10);
    }
    return obj;
}
function nonDeterministicNote(lang,priors) {
    return {
        velocity:emitWordGiven(lang.velocity)(priors),
        note:emitWordGiven(lang.note)(priors),
        delay:emitWordGiven(lang.delay)(priors),
        time:emitWordGiven(lang.time)(priors),
    };
}
function compositeNote(lang,priors) {
    console.log("generating note from language",lang,songlang)
    var note = emitWordGiven(lang)(priors);
    if(priors.length < 5) {
        priors.push(note);
    } else {
        priors.unshift();
        priors.push(note);
    }
    note = JSON.parse(note);
    return {
        velocity:note[0],
        note:note[1],
        delay:note[2],
        time:note[3]
    }
}
function playCompositeRandomSong(lang,length,priors) {
    console.log("playing random song",lang)
    priors = priors||[JSON.stringify([0,0,0,0])];
    if(length > 0) {

        console.log("PLAYING NOTE",note)
        var time = 0;
        for(var i = 0; i <length;i++) {
            var note = compositeNote(lang,priors);
            time += note.time/1000
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
function playNaiveRandomSong(lang,length,priors) {
    console.log("playing random song",lang)
    priors = priors||[{
        velocity:1,
        note:0,
        delay:0,
        time:0
    }];
    if(length > 0) {
        var note = nonDeterministicNote(lang,priors);
        console.log("PLAYING NOTE",note)
        setTimeout(function() {
            if(priors.length < 5) {
                priors.push(note);
            } else {
                priors.unshift();
                priors.push(note);
            }
            playNote(note);
            playNaiveRandomSong(lang,length-1,priors);
        },note.time)
    }
}
function emitState(lang,priors) {
    return emitWordGiven(lang)(priors);
}
function playFromStates(lang,length,priors) {
    priors = priors||[{}];
    if(length > 0) {
        var state = emitState(lang,priors);
        setTimeout(function() {
        })
    }
}
function generateStateLanguage() {

    var lang = boardStates.map(function(s,i) {
        return JSON.stringify(s);
    })
    songlang = genProb (createDictionary( lang),10);
    return songlang;
}
function generateCompositeLanguage() {
    var songlang;
    var lang = {
        velocity:[],
        note:[],
        delay:[],
        time:[]
    };
    notes.forEach(function(note,i) {
        console.log("notess",i)
        i = i;
        lang.velocity[i] = note.velocity;
        lang.note[i] = note.note
        lang.delay[i] = note.delay;
        lang.time[i] = note.time
    });
    lang.time = lang.time.map(function(t,i,a) {
        if(i != a.length) {
            return a[i+1]-t;
        } else {
            return 0;
        }
    });
    songlang = genProb
    (createDictionary( lang.velocity.map(function(v,i) {
        return JSON.stringify([
            v,
            lang.note[i],
            lang.delay[i],
            lang.time[i]
        ]);
    }),5));
    return songlang;
}
function generateLanguageNieve() {
    console.log("building language",notes);
    var lang = {
        velocity:[0],
        note:[0],
        delay:[0],
        time:[0]
    };
    notes.forEach(function(note,i) {
        console.log("notess",i)
        i = i+1;
        lang.velocity[i] = note.velocity;
        lang.note[i] = note.note
        lang.delay[i] = note.delay;
        lang.time[i] = note.time
    });
    lang.time = lang.time.map(function(t,i,a) {
        if(i != a.length) {
            return a[i+1]-t;
        } else {
            return 0;
        }
    });
    songlang = {
        velocity:genProb(createDictionary(lang.velocity,5)),
        note:genProb(createDictionary(lang.note,5)),
        delay:genProb(createDictionary(lang.delay,5)),
        time:genProb(createDictionary(lang.time,5)),
    }
    console.log("done building language",songlang);
    return songlang
}
function loadMIDIHardwareReader(MIDI) {
  var
    divInputs = document.getElementById('inputs'),
    divOutputs = document.getElementById('outputs'),
    midiAccess,
    checkboxMIDIInOnChange,
    checkboxMIDIOutOnChange,
    activeInputs = {},
    activeOutputs = {};


  if(navigator.requestMIDIAccess !== undefined){
    navigator.requestMIDIAccess().then(

      function onFulfilled(access){
        midiAccess = access;

        // create list of all currently connected MIDI devices
        showMIDIPorts();

        // update the device list when devices get connected, disconnected, opened or closed
        midiAccess.onstatechange = function(e){
          var port = e.port;
          var div = port.type === 'input' ? divInputs : divOutputs;
            var listener = port.type === 'input' ?
                    checkboxMIDIInOnChange :
                    checkboxMIDIOutOnChange;
            var activePorts = port.type === 'input' ?
                    activeInputs :
                    activeOutputs;
          var checkbox = document.getElementById(port.type + port.id);
          var label;

          // device disconnected
          if(port.state === 'disconnected'){
            port.close();
            label = checkbox.parentNode;
            checkbox.nextSibling.nodeValue =
                  port.name +
                  ' (' + port.state + ', ' +  port.connection + ')';
                checkbox.disabled = true;
                checkbox.checked = false;
                delete activePorts[port.type + port.id];

          // new device connected
          }else if(checkbox === null){
            label = document.createElement('label');
            checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = port.type + port.id;
            checkbox.addEventListener('change', listener, false);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(port.name + ' (' + port.state + ', ' +  port.connection + ')'));
            div.appendChild(label);
            div.appendChild(document.createElement('br'));

          // device opened or closed
          }else if(checkbox !== null){
            label = checkbox.parentNode;
            checkbox.disabled = false;
            checkbox.nextSibling.nodeValue = port.name + ' (' + port.state + ', ' +  port.connection + ')';
          }
        };
      },

      function onRejected(e){
        divInputs.innerHTML = e.message;
        divOutputs.innerHTML = '';
      }
    );
  }

  // browsers without WebMIDI API or Jazz plugin
  else{
    divInputs.innerHTML = 'No access to MIDI devices: browser does not support WebMIDI API, please use the WebMIDIAPIShim together with the Jazz plugin';
    divOutputs.innerHTML = '';
  }


  function showMIDIPorts(){
    var
      html,
      checkbox,
      checkboxes,
      inputs, outputs,
      i, maxi;

    inputs = midiAccess.inputs;
    html = '<h4>midi inputs:</h4>';
    inputs.forEach(function(port,i){
      //console.log('in', port.name, port.id);
        html += '<label><input type="checkbox" id="' + port.type + port.id + '">' + port.name + ' (' + port.state + ', ' +  port.connection + ')</label><br>';
    });
    divInputs.innerHTML = html;

    outputs = midiAccess.outputs;
    html = '<h4>midi outputs:</h4>';
    outputs.forEach(function(port){
      //console.log('out', port.name, port.id);
      html += '<label><input type="checkbox" id="' + port.type + port.id + '">' + port.name + ' (' + port.state + ', ' +  port.connection + ')</label><br>';
    });
    divOutputs.innerHTML = html;

    checkboxes = document.querySelectorAll('#inputs input[type="checkbox"]');
    for(i = 0, maxi = checkboxes.length; i < maxi; i++){
      checkbox = checkboxes[i];
      checkbox.addEventListener('change', checkboxMIDIInOnChange, false);
    }
    checkboxes[0].checked = true;
      checkboxMIDIInOnChange.call(checkboxes[0])

    checkboxes = document.querySelectorAll('#outputs input[type="checkbox"]');
    for(i = 0, maxi = checkboxes.length; i < maxi; i++){
      checkbox = checkboxes[i];
      checkbox.addEventListener('change', checkboxMIDIOutOnChange, false);
    }
  }


  // handle incoming MIDI messages
    function inputListener(midimessageEvent){
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
            velocity:velocity,
            note:noten,
            delay:delay
        };
        notes.push(playNote(note));

        boardState = copyObject(boardState);
        boardState.time = note.time;
        if(note.note > 0) {
            boardState[note.note] = note.velocity;
        } else {
            delete boardState[note.note]
        }
        boardStates.push(boardState);


    }


  checkboxMIDIInOnChange = function(){
    // port id is the same a the checkbox id
      console.log("check box changed");
    var id = this.id;
    var port = midiAccess.inputs.get(id.replace('input', ''));
    if(this.checked === true){
      activeInputs[id] = port;
      // implicitly open port by adding an onmidimessage listener
      port.onmidimessage = inputListener;
    }else{
      delete activeInputs[id];
      port.close();
    }
  };


  checkboxMIDIOutOnChange = function(){
    // port id is the same a the checkbox id
    var id = this.id;
    var port = midiAccess.outputs.get(id.replace('output', ''));
    if(this.checked === true){
      activeOutputs[id] = port;
      port.open();
    }else{
      delete activeOutputs[id];
      port.close();
    }
  };
}
window.onload = function(){

  'use strict';

	  MIDI.loadPlugin({
		    soundfontUrl: "/MIDI/examples/soundfont/",
		    instrument: "acoustic_grand_piano",
		    onprogress: function(state, progress) {
			      console.log(state, progress);
		    },
		    onsuccess: function() {
            loadMIDIHardwareReader(MIDI);
		    }
	  });

};
