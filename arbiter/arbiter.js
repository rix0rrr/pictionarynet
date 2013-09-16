var express = require('express');
var words = require('./words.json');

// Roundabout initialization of Socket.IO, required for express 3.0
var app    = express()
    http   = require('http'),
    data   = require('../shared/data.js'),
    server = http.createServer(app),
    _      = require('underscore'),
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

function sendGameMessage(message) {
    io.sockets.emit('gameMessage', message);
}

function alphaOnly(word) {
    return word.replace(/\W/g, '').toLowerCase();
}

function endRound(game) {
    var correct = _(game.gameState.players).filter(function(p) {
        return alphaOnly(p.latestGuess) == alphaOnly(game.round.word);
    });

    var who = _(correct).pluck('name').join(', ');
    if (!correct.length) who = 'NOBODY';

    _.each(correct, function(player) {
        player.score++;
    });

    sendGameMessage("Correct answer '" + game.round.word + "' was given by " + who);
    setTimeout(function() {
        _(game.gameState.players).each(function(p) { p.latestGuess = ''; });
        sendGameMessage('');
        sendGameState(io.sockets);
        switchToNextRound(game);
    }, 4000);

}

function switchToNextRound(game) {
    game.round.roundNr++;
    game.round.word = pickRandomWord();
    io.sockets.emit('round', game.round);
}

function startCountdown(socket) {
    sendCountdownMessage(socket, 5);
}

function sendCountdownMessage(socket, countdownTimer) {
    sendGameMessage('Round ends in ' + countdownTimer);

    console.log('Sent game message: ' + countdownTimer);

    if (countdownTimer > 0) {
        setTimeout(function() { sendCountdownMessage(socket, countdownTimer - 1); }, 1000);
    }
    else {
        endRound(game);
    }
}

function sendGameState(where) {
    where.emit('gameState', game.gameState);
}

var game = new data.Game();
switchToNextRound(game);

io.sockets.on('connection', function(socket) {
    sendGameState(socket);
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

    socket.on('undo', function() {
        data.undoLastDrawingMotion(game.drawing);
        console.log(game.drawing);
        socket.broadcast.emit('drawing', game.drawing);
    });

    socket.on('guess', function(guess) {
        var thePlayer = _(game.gameState.players).find(function(p) { return p.name == guess.teamName; });
        if (!thePlayer) { 
            thePlayer = new data.Player(guess.teamName);
            game.gameState.players.push(thePlayer);
        }

        // FIXME: Check password here if desired :)
        thePlayer.latestGuess = guess.word;

        sendGameState(io.sockets);
    });

    socket.on('finished', function() {
        socket.broadcast.emit('roundEnd', game.drawing);
        startCountdown(socket);
    });
});

var lines = [];
var playerCount = 0;

//var oneDay = 24 * 60 * 60 * 1000;
var oneDay = 0;
app.use('/sketchboard', express.static('../sketchboard', { maxAge: oneDay }));
app.use('/scoreboard', express.static('../scoreboard', { maxAge: oneDay }));
app.use('/shared', express.static('../shared', { maxAge: oneDay }));
app.use('/lib', express.static('../lib', { maxAge: oneDay }));

server.listen(3000);
console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
