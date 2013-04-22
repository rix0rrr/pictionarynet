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

var oneDay = 24 * 60 * 60 * 1000;
app.use('/sketchboard', express.static('../sketchboard', { maxAge: oneDay }));
app.use('/scoreboard', express.static('../scoreboard', { maxAge: oneDay }));

server.listen(3000);
console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
