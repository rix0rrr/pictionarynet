var express = require('express');

// Roundabout initialization of Socket.IO, required for express 3.0
var app    = express()
    http   = require('http'),
    server = http.createServer(app),
    io     = require('socket.io').listen(server);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/', function(req, res) {
    res.send('<html><body><ul><li><a href="/sketchboard/index.html">Sketchboard</a></li>' +
        '<li><a href="/scoreboard/index.html">Scoreboard</a></li></ul></body></html>');
});

io.sockets.on('connection', function(socket) {
    socket.on('gameState', function(state) {
    	state.players = [];
        socket.broadcast.emit('gameState', state);
    });
    
    socket.on('line', function(line) {
        socket.broadcast.emit('line', line);
    });
});

var players = new Array();
var lines = new Array();
var playerCount = 0;
var words = [
	"Superfluous",
	"Catastrophe",
	"Tree",
	"Hug",
	"Banana",
	"Apple",
	"Supercoder"
	];

/*
setInterval(function() {
	playerCount++;
	var score = Math.floor(Math.random() * 100 + 1);
	var guess = words[Math.floor(Math.random() * words.length)];
	var line = new Object();
	var width = 768;
	var height = 1024;
	line.x1 = Math.floor(Math.random() * width);
	line.y1 = Math.floor(Math.random() * height);
	line.x2 = Math.floor(Math.random() * width);
	line.y2 = Math.floor(Math.random() * height);
	players.push({ name: "Player " + playerCount, score: score, latestGuess: guess});
	lines.push(line);
	io.sockets.emit('gameState', { round: 1, drawing: { width: 768, height: 1024 , lines: lines }, players: players });
}, 5000);
*/

var oneDay = 24 * 60 * 60 * 1000;
app.use('/sketchboard', express.static('../sketchboard', { maxAge: oneDay }));
app.use('/scoreboard', express.static('../scoreboard', { maxAge: oneDay }));
app.use('/lib', express.static('../lib', { maxAge: oneDay }));

server.listen(3000);
console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
