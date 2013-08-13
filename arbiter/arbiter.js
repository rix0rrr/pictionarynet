var express = require('express');
var words = require('./words.json');

// Roundabout initialization of Socket.IO, required for express 3.0
var app    = express()
    http   = require('http'),
    data   = require('../shared/data.js'),
    server = http.createServer(app),
    io     = require('socket.io').listen(server);

app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/', function(req, res) {
    res.send('<html><body><ul><li><a href="/sketchboard/index.html">Sketchboard</a></li>' +
        '<li><a href="/scoreboard/index.html">Scoreboard</a></li></ul></body></html>');
});

function pickRandomWord() {
    var index = Math.floor(Math.random() * words.length);

    return words[index];
}

function switchToNextRound(game) {
    game.round++;
    game.word = pickRandomWord();
}

var game = new data.Game();
game.round = 1;
switchToNextRound(game);

io.sockets.on('connection', function(socket) {
    socket.emit('gameState', game.gameState);
    socket.emit('drawing', game.drawing);
    socket.emit('round', game.round);

    socket.on('drawing', function(drawing) {
        game.drawing = drawing;
        socket.broadcast.emit('drawing', drawing);
    });

    socket.on('line', function(line) {
        game.drawing.lines.push(line);
        socket.broadcast.emit('line', line);
    });

    socket.on('guess', function(guess) {
        console.log(guess.teamName);
    });

    socket.on('finished', function(drawing) {
        console.log('Finished');
    });
});

var players = new Array();
var lines = new Array();
var playerCount = 0;

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
app.use('/shared', express.static('../shared', { maxAge: oneDay }));
app.use('/lib', express.static('../lib', { maxAge: oneDay }));

server.listen(3000);
console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);