// This code has been modified from James Long's code at 
// http://jlongster.com/2012/09/12/web-apps.html
var ctx;
var canvas;
var touch;
var audioCtx = null;
var soundBuffer = null;
var effect;
var loopLength = 16;

var majorArray = [196,220, 246.94,261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.26, 698.46, 783.99];
var minorArray = [277.18, 311.13, 329.63, 369.99, 415.3, 440, 493.88, 554.37, 622.25, 659.26, 739.99, 830.61];
var mouseNote = null;
var rhythmIndex = 0;
var mouseDown = false;
var instrument = 'piano';
var touchstart = 'mousedown';
var touchmove = 'mousemove';
var touchend = 'mouseup';
var soundaudio = 'piano.mp3';
var theArray = majorArray;
var counter = 0;
var timeoutId;
var startTime;

function playSound(x, y, quick, noteTime) {
    if (soundBuffer) {
        var sound = audioCtx.createBufferSource();
        var gain = audioCtx.createGainNode();
        sound.buffer = soundBuffer;
        sound.playbackRate.value = x / canvas.width * 2;
        sound.connect(gain);
        gain.connect(audioCtx.destination);

        var volume = 0.5;
        gain.gain.value = volume;

        if (quick) {
            sound.noteGrainOn(0., .2, .4);
        } else {
            sound.noteOn(noteTime);
        }
    }
}

function Note() {
    if (audioCtx) {
        this.node = audioCtx.createJavaScriptNode(1024, 1, 1);
        this.incr = 0;

        this.gain = audioCtx.createGainNode();
        this.node.connect(this.gain);
    }
}

Note.prototype.setFrequency = function (x, y) {
    if (audioCtx) {
        var freq = x / canvas.width * 2000 + 100;
        this.incr = 2 * Math.PI * freq / audioCtx.sampleRate;

        var volume = 0.5;
        this.gain.gain.value = volume;
    }
};

Note.prototype.playNote = function () {
    if (this.playing) {
        this.stopNote();
    }

    if (audioCtx) {
        var x = 0;

        var _this = this;
        this.node.onaudioprocess = function (e) {
            var data = e.outputBuffer.getChannelData(0);
            for (var i = 0; i < data.length; i++) {
                data[i] = Math.sin(x);
                x += _this.incr;
            }
        };

        this.gain.connect(audioCtx.destination);
        this.playing = true;
    }
};

Note.prototype.stopNote = function () {
    if (audioCtx) {
        this.node.disconnect();
        this.gain.disconnect();
        this.playing = false;
    }
};

var lastX = 0;
var lastY = 0;
var lastTime = 0;
var sticky = false;
var trigger = false;
var playing = false;

function bufferSound(event) {
    var request = event.target;

    soundBuffer = audioCtx.createBuffer(request.response, false);
    if (playing == true) {
        $("#start").click();
    }
}

function resetAudio(soundaudio) {
    soundBuffer = null;
    audioCtx = new webkitAudioContext();

    var request = new XMLHttpRequest();
    request.open('GET', soundaudio, true);
    request.responseType = 'arraybuffer';
    request.addEventListener('load', bufferSound, false);
    request.send();
}


function init() {

    canvas = document.getElementById(id);
    canvas.width = (document.body.clientWidth - 20);
    ctx = canvas.getContext('2d');

    function handle(x, y, touch) {

        var note = new Note();
        var closesti = null;
        var bestindex = null;
        var goal = x + Math.min.apply(null, theArray);
        $.each(theArray, function (index) {
            if (Math.abs(this - goal) < closesti || closesti == null) {
                closesti = Math.abs(this - goal);
                closest = this;
                bestindex = index;
            }
        });
        var set = Math.floor(y / 55);
        if (sticky == true) {
            if ($("." + set + ".bar" + bestindex).hasClass("selected")) {
                $("." + set + ".bar" + bestindex).removeClass("selected");
                localStorage.removeItem(set + "-" + bestindex);

            } else {
                $("." + set + ".bar" + bestindex).addClass("selected");
                localStorage.setItem(set + "-" + bestindex, 'selected');
            }
            //localStorage.setItem(set+"-"+bestindex, 'selected');
        } else {
            $("." + set + ".bar" + bestindex).addClass("selected");
        }
        $(".note").html(closest.toString());
        playSound(closest.toString(), y, 0);

        if (touch) {
            touch.note = note;
        } else {
            mouseNote = note;
        }

    }

    if ('ontouchstart' in window) {
        touchstart = 'touchstart';
        touchmove = 'touchmove';
        touchend = 'touchend';
    }


    canvas.addEventListener(touchstart, function (e) {
    	//console.log($("#barsarea").scrollTop());
        if (e.changedTouches) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i];
                handle(touch.pageX, touch.pageY+$("#barsarea").scrollTop(), touch);
            }
        } else {
            mouseDown = true;
            handle(e.pageX, e.pageY+$("#barsarea").scrollTop());
        }

    });

    canvas.addEventListener(touchmove, function (e) {

        if (e.changedTouches) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i];
                handle(touch.pageX, touch.pageY, touch);
            }
        } else if (mouseDown) {
            handle(e.pageX, e.pageY);
        }

    }, true);

    canvas.addEventListener(touchend, function (e) {

        if (e.changedTouches) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i];
                touch.note.stopNote();
            }
        } else if (mouseDown) {
            mouseNote.stopNote();
        }
        if (sticky != true) {
            $(".bar").removeClass("selected");
        }

        mouseDown = false;
    });


    if ('webkitAudioContext' in window) {
        resetAudio(soundaudio);
    }

    window.onresize = function () {
        canvas.width = (document.body.clientWidth - 20);
    };

    window.onhashchange = function () {
        effect = window.location.hash.slice(1);
    };

}

function advanceNote() {
    // Advance time by a 16th note...
    var secondsPerBeat = 60.0 / $("#tempo").slider("option", "value");

    rhythmIndex++;

    if (rhythmIndex == loopLength) {
        rhythmIndex = 0;
    }

    noteTime += secondsPerBeat;
}

function schedule() {
    var currentTime = audioCtx.currentTime;

    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
        var contextPlayTime = noteTime + startTime;

        for (var i = 0; i < theArray.length; i++) {
            if ($("." + rhythmIndex + ".bar" + i).hasClass("selected")) {
                $("." + rhythmIndex + ".bar" + i).effect("highlight", {}, 10);
                //console.log(contextPlayTime);
                playSound($("." + rhythmIndex + ".bar" + i).attr("freq"), 400, contextPlayTime);
            }
        }
        advanceNote();
    }

    timeoutId = setTimeout("schedule()", 0);
}

function bitstringEncode(bitstring) {
    var i, l = bitstring.length,
        retval = l.toString() + '|';
    for (i = 0; i < l; i += 5) {
        retval += parseInt((bitstring.substr(i, 5) + '0000').substr(0, 5), 2).toString(32);
    }
    return retval;
}

function bitstringDecode(lengthandhex) {
    var arr = lengthandhex.split('|'),
        l = parseInt(arr[0]),
        chars = arr[1].split(''),
        i, limit = chars.length,
        retval = '';
    for (i = 0; i < limit; i += 1) {
        retval += ('0000' + parseInt(chars[i], 32).toString(2)).substr(-5, 5);
    }
    allarr = retval.substr(0, l);
    for (var i = 0; i < loopLength; i++) {
        for (var j = 0; j < theArray.length; j++) {

            if (allarr[(i * theArray.length) + j] == "1") {
                //console.log("." + i + ".bar" + j);
                $("." + i + ".bar" + j).addClass("selected");
            }
        }
    }
}

function bitstringEncode2(bitstring) {
    var i, l = bitstring.length,
        retval = l.toString() + '|';
    for (i = 0; i < l; i += 10) {
        retval += parseInt((bitstring.substr(i, 10) + '000000000').substr(0, 10), 2).toString(32);
    }
    return retval;
}

function bitstringDecode2(lengthandhex) {
    var arr = lengthandhex.split('|'),
        l = parseInt(arr[0]),
        chars = arr[1], 
        i, limit = chars.length,
        retval = '';
    for (i = 0; i < limit; i += 2) {
        retval += ('000000000' + parseInt(chars.substr(i, 2), 32).toString(2)).substr(-10, 10);
    }
    return retval.substr(0, l);
}
function hexFromBitstring(bitstring) {
    var bits = bitstring.split(''),
        i, l = bits.length,
        collector = 0,
        retval = l.toString() + '|';
    l = Math.floor((l + 3) / 4) * 4;
    for (i = 0; i < l; i += 1) {
        collector *= 2;
        collector += parseInt(bits[i] || '0');
        if (i % 4 === 3) {
            retval += (collector < 10 ? collector.toString() : String.fromCharCode(collector + 55));
            collector = 0;
        }
    }
    return retval;
}

function bitstringFromHex(lengthandhex) {
    var arr = lengthandhex.split('|'),
        l = parseInt(arr[0]),
        hex = arr[1].split(''),
        i, char,
        retval = '';
    for (i = 0; i < l; i += 1) {
        if (i % 4 === 0) {
            char = hex[Math.floor(i / 4)];
            char = char < 'A' ? parseInt(char) : char.charCodeAt() - 55;
        }
        retval += (char & 8) !== 0 ? '1' : '0';
        char *= 2;
    }

    allarr = retval.substr(0, l);
    console.log(allarr);
    for (var i = 0; i < loopLength; i++) {
        for (var j = 0; j < theArray.length; j++) {

            if (allarr[(i * theArray.length) + j] == "1") {
                //console.log("." + i + ".bar" + j);
                $("." + i + ".bar" + j).addClass("selected");
            }
        }
    }
}

$(function () {
	if (localStorage.getItem('rows')) {
		loopLength = localStorage.getItem('rows');
		
	} 
	$("#rows").val(loopLength);
	
	

    

    var tempo = 100;
    if (localStorage.getItem('tempo')) {
        tempo = localStorage.getItem('tempo');
        $("#tempotext").val(tempo);
    }

    $("#tempo").slider({
        min: 50,
        value: tempo,
        max: 300
    });

    $(".bar" + (theArray.length - 1)).css("width", "20px");
    $(".bar" + (theArray.length - 1)).attr("freq", theArray[(theArray.length - 1)]);

    $("#minor").click(function () {
        theArray = minorArray;
        for (var j = 0; j < theArray.length - 1; j++) {
            $(".bar" + j).css("width", theArray[j + 1] - theArray[j] + "px");
            $(".bar" + j).attr("freq", theArray[j]);
        }
        $(".bar" + (theArray.length - 1)).css("width", "20px");
        $(".bar" + (theArray.length - 1)).attr("freq", theArray[(theArray.length - 1)]);
    });

    $("#major").click(function () {
        theArray = majorArray;
        for (var j = 0; j < theArray.length - 1; j++) {
            $(".bar" + j).css("width", theArray[j + 1] - theArray[j] + "px");
            $(".bar" + j).attr("freq", theArray[j]);
        }
        $(".bar" + (theArray.length - 1)).css("width", "20px");
        $(".bar" + (theArray.length - 1)).attr("freq", theArray[(theArray.length - 1)]);
    });


    $("#guitar").click(function () {
        soundaudio = 'guitar.mp3';
        instrument = 'guitar';
        $(".instrument").removeClass("selected");
        $(this).addClass("selected");
        localStorage.setItem('instrument', instrument);
        resetAudio(soundaudio);
    });

    $("#piano").click(function () {
        soundaudio = 'piano.mp3';
        instrument = 'piano';
        $(".instrument").removeClass("selected");
        $(this).addClass("selected");
        localStorage.setItem('instrument', instrument);
        resetAudio(soundaudio);
    });

    $("#violin").click(function () {
        soundaudio = 'violin.mp3';
        instrument = 'violin';
        $(".instrument").removeClass("selected");
        $(this).addClass("selected");
        localStorage.setItem('instrument', instrument);
        resetAudio(soundaudio);
    });

        $("#sticky").click(function () {

            if ($(this).hasClass("selected")) {
                sticky = false;
                $(this).removeClass("selected");
                localStorage.removeItem('sticky');
            } else {
                $(this).addClass("selected");
                sticky = true;
                localStorage.setItem('sticky', 'selected');
            }
        });
        // Post storage loading
        $("#sticky").addClass(localStorage.getItem('sticky'));
        if ($("#sticky").hasClass("selected")) {
            sticky = true;
        }
        if (localStorage.getItem('instrument')) {
            instrument = localStorage.getItem('instrument');
        }
        resetAudio(instrument + ".mp3");


    var counter = 0;
    var myVar = null;

    $("#tempo").bind("slide", function (event, ui) {

        $("#tempotext").val(ui.value);
        localStorage.setItem('tempo', $("#tempo").slider("option", "value"));

    });

    $("#tempotext").change(function () {
        $("#tempo").slider("value", parseInt($(this).val()));
    });
     $("#rows").change(function () {
        loopLength = $("#rows").val();
        localStorage.setItem('rows', $("#rows").val());
    });

    $("#save").click(function () {
        allarr = new Array();
        for (var i = 0; i < loopLength; i++) {
            arr = new Array();
            for (var j = 0; j < theArray.length; j++) {
                if ($("." + i + ".bar" + j).hasClass("selected")) {
                    arr[j] = 1;
                    allarr[(i * theArray.length) + j] = 1;
                } else {
                    arr[j] = 0;
                    allarr[(i * theArray.length) + j] = 0;
                }
            }
        }
        tempo = $("#tempo").slider("option", "value");
        $("#box").slideToggle();
        
        $("#twitter").attr("href", "http://twitter.com/intent/tweet?source=rioleoorg&text="+escape("I composed a new tune on") + "&url="+escape("http://www.rioleo.org/piano/?p=" + bitstringEncode(allarr.join("")) + "&i=" + instrument + "&t=" + tempo + "&r=" + loopLength));
        
        $("#googleplus").attr("href", "https://plus.google.com/share?url="+escape("http://www.rioleo.org/piano/?p=" + bitstringEncode(allarr.join("")) + "&i=" + instrument + "&t=" + tempo + "&r=" + loopLength));
        
        $("#facebook").attr("href", "https://www.facebook.com/sharer.php?u="+escape("http://www.rioleo.org/piano/?p=" + bitstringEncode(allarr.join("")) + "&i=" + instrument + "&t=" + tempo + "&r=" + loopLength)+"&t="+ escape("I composed a tune on Piano"));
        
        $("#url").html("<a href='http://www.rioleo.org/piano/?p=" + bitstringEncode(allarr.join("")) + "&i=" + instrument + "&t=" + tempo+"' target='_blank'>Share this link</a>");
        $("#data").val(bitstringEncode(allarr.join("")) + "&i=" + instrument + "&t=" + tempo + "&r=" + loopLength);
    });
    $("#box").hide();

    $("#clear").click(function () {
        $(".bar").removeClass("selected");
        clearTimeout(timeoutId);
        localStorage.clear();
    });

    $("#stop").click(function () {
    	rhythmIndex = 0;

        clearTimeout(timeoutId);
        playing = false;
        
    });

    $("#start").click(function () {
        noteTime = 0.0;
        playing = true;
        startTime = audioCtx.currentTime + 0.005;
        schedule();
    });
});