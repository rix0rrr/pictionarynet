var io = require('socket.io-client');

var args = process.argv.splice(2);


// Make script run for a long time
setTimeout(function() { console.log('Your script took too long. I\'m bored. Bye!'); }, 50000);

if (args.length !== 3) {
  console.log('Please provide team name, server address and path to executable.')
  process.exit(1);
}

var teamName = args[0];
var serverAddress = args[1];
var executable = args[2];

function Guess(teamName, passWord, word) {
  this.teamName = teamName;
  this.passWord = passWord;
  this.word = word;
}

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



socket.emit('guess', new Guess(teamName , 'asdfasdjkf', 'boobie'));
