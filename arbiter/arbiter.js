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

function Player() {
	this.name = "";
	this.score = 0;
	this.latestGuess = "";
}

function GameState() {
    this.round = 1;
    this.players = [];
}

function Line(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
}

function Drawing() {
    this.width = 0;
    this.height = 0;
    this.lines = [];
}

function Game() {
	this.gameState = new GameState();
	this.drawing = new Drawing();
}

var game = new Game();

io.sockets.on('connection', function(socket) {
    socket.emit('gameState', game.gameState);
    socket.emit('drawing', game.drawing);

    socket.on('drawing', function(drawing) {
        game.drawing = drawing;
        socket.broadcast.emit('drawing', drawing);
    });

    socket.on('line', function(line) {
        game.drawing.lines.push(line);
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
