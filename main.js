// Utilities
var audioElement
var DEBUG = true;
var myPlayer;
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubePlayerAPIReady() {
      log('im here');
      myPlayer = new YT.Player('ytdiv', {
         height: '390',
         width: '640',
         id: "ytplayer",
         videoId: 'u1zgFlCw8Aw',
         playerVars: {
             controls: "0",
             'start': 10
        },
        events: {
            "onReady": bufferVideo
        }
    });
}

function bufferVideo(){
    console.log("here")
    myPlayer.mute();
    myPlayer.seekTo();
    myPlayer.pauseVideo();
    myPlayer.seekTo();
    myPlayer.unMute();
    $("#ytdiv").show();
    console.log($("#ytdiv").attr("style"));
}

function print(entry) {
    return log(entry);
}
function log(entry) {
    if (DEBUG) {
	console.log(entry);
    }
}
function now() {
  return (new Date()).getTime();
}

function at(datetime) {
  return datetime - now();
}

// Init

$(function() {
  log('starting init...');
  var socket, startTime, offset;

  audioElement = document.createElement('audio');
  audioElement.id = "audio";
  audioDiv = $("#forAudio");
  console.log(audioDiv);
  audioDiv.append(audioElement);

  socket = io.connect();//'http://' + window.location.hostname + ':8080');
  log(window.location.hostname);

  socket.on('connect', function(data) {
	log('connected; starting clock sync');
    startTime = now();
    socket.json.send({'startClockSync': true});
  });

  socket.on('message', function(data) {
    if ('src' in data) {
	  log('audio src received:' + data.src);
      audioElement.setAttribute('src', data.src);
      audioElement.load();
    } else if ('play' in data) {
      log("data.play =" + data.play);
	  log('received play message; playing in ' + (at(data.play+offset)/1000) +"seconds");
      setTimeout(function() {log("here"); myPlayer.playVideo(); },
				 at(data.play + offset));
    } else if ('clockSyncServerTime' in data) {
	  log('server clock sync received; setting offset');
      if (startTime == null) {
        throw "clock sync failed: startTime didn't get set.";
      }
      offset = now() - ((now() - startTime)/2 + data.clockSyncServerTime)
      log("heres your offset:" + offset);
    }
  });
  socket.on('stop', function(data) {
	  log('stopping');
      myPlayer.stopVideo()
	window.location.href = window.location.href;
      });
  socket.on('disconnect', function() {
    log('client disconnect');
  });
  
  $('#play').click(function() {
    log('sending play message');
	socket.json.send({'start': true});
  });
  $('#stop').click(function() {
	  log('sending stop message');
	  socket.emit('stopall');
      });
});
