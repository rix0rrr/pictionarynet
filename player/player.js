var io   = require('socket.io-client');
var data = require('../shared/data.js');
var args = process.argv.splice(2);

// Make script run for a long time
setTimeout(function() { console.log('Your script took too long. I\'m bored. Bye!'); }, 10000000);

if (args.length !== 3) {
    console.log('Usage: node script.js TEAMNAME HTTP://SERVER:PORT/ EXECUTABLE');
    console.log('');
    console.log('Your executable will be called periodically with the PATH to an image file,');
    console.log('and is expected to produce the name of the corresponding image class on stdout.');

    process.exit(1);
}

var teamName      = args[0];
var serverAddress = args[1];
var executable    = args[2];

// var socket = new io.Socket('localhost');
// socket.connect();

var socket = io.connect(serverAddress);
socket.on('connect', function() {
    console.log('Connected to server.');
});
socket.on('error', function(e) {
    console.log("ERROR", e);
    process.exit(1);
});

socket.emit('guess', new data.Guess(teamName , 'asdfasdjkf', 'boobie'));
