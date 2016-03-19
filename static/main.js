console.log("midi");
socket.on("change",function() {
    location.reload();
})
function midiStateChange(
    checkboxMIDIInOnChange,
    checkboxMIDIOutOnChange,
    activeInputs,activeOutputs
){
    return function(e) {
        console.log("stateChange")
        var port = e.port;
        var listener = port.type === 'input' ? checkboxMIDIInOnChange : checkboxMIDIOutOnChange;
        var activePorts = port.type === 'input' ? activeInputs : activeOutputs;

        // device disconnected
        if(port.state === 'disconnected'){
            port.close();
            console.log("disconnected",port)
            delete activePorts[port.type + port.id];
        }
    }
}
window.onload = function () {


    var
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
            midiAccess.onstatechange = midiStateChange(
                checkboxMIDIInOnChange,
                checkboxMIDIOutOnChange,
                activeOutputs
            );
            console.log("api loaded",access)
        },
        function onRejected(e){
            console.log("ERROR",e)
        });
    }

    // browsers without WebMIDI API or Jazz plugin
    else{
    }


    function showMIDIPorts(){
        var
        inputs, outputs,
        i, maxi;

        inputs = midiAccess.inputs;
        console.log("inputs",inputs);
        /*inputs.forEach(function(port){
            //console.log('in', port.name, port.id);
            html += '<label><input type="checkbox" id="' + port.type + port.id + '">' + port.name + ' (' + port.state + ', ' +  port.connection + ')</label><br>';
        });*/

        outputs = midiAccess.outputs;
        /*outputs.forEach(function(port){
            //console.log('out', port.name, port.id);
            html += '<label><input type="checkbox" id="' + port.type + port.id + '">' + port.name + ' (' + port.state + ', ' +  port.connection + ')</label><br>';
        });*/
    }


    // handle incoming MIDI messages
    function inputListener(midimessageEvent){
        var port, portId,
        data = midimessageEvent.data,
        type = data[0],
        midikey = data[1],
        eventLabel = data[2];
        console.log("type",type,"midikey",midikey,"eventLabel",eventLabel);


        for(portId in activeOutputs){
            if(activeOutputs.hasOwnProperty(portId)){
                port = activeOutputs[portId];
                port.send(data);
            }
        }
    }


    checkboxMIDIInOnChange = function(){
        // port id is the same a the checkbox id
        console.log("in on change")
        var id = this.id;
        var port = midiAccess.inputs.get(id.replace('input', ''));
        //if(this.checked === true){
            activeInputs[id] = port;
            // implicitly open port by adding an onmidimessage listener
            port.onmidimessage = inputListener;
        //}else{
            delete activeInputs[id];
            port.close();
        //}
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
	  MIDI.loadPlugin({
		    soundfontUrl: "./MIDI/examples/soundfont/",
		    instrument: "acoustic_grand_piano",
		    onprogress: function(state, progress) {
			      console.log(state, progress);
		    },
		    onsuccess: function() {
			      var delay = 0; // play one note every quarter second
			      var note = 50; // the MIDI note
			      var velocity = 127; // how hard the note hits
			      // play the note
			      MIDI.setVolume(0, 127);
			      MIDI.noteOn(0, note, velocity, delay);
			      MIDI.noteOff(0, note, delay + 0.75);
		    }
	  });
};
