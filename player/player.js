var io   = require('socket.io-client');
var data = require('../shared/data.js');
var args = process.argv.splice(2);
var Canvas = require('canvas');
var _    = require('underscore');
var fs   = require('fs');
var Q    = require('q');
var child_process = require('child_process');
var util = require('util');
var path = require('path');

var trim = function(x) {return x.replace(/^\s+|\s+$/g, '');};

// Make script run for a long time
setTimeout(function() { console.log('Your script took too long. I\'m bored. Bye!'); }, 10000000);

if (args.length !== 3) {
    console.log('Usage: node player.js <HTTP://SERVER:PORT/> <TEAMNAME> <EXECUTABLE>');
    console.log('');
    console.log('Your executable will be called periodically with the PATH to an image file,');
    console.log('and is expected to produce the name of the corresponding image class on stdout.');

    process.exit(1);
}

var serverAddress = args[0];
var teamName      = args[1];
var executable    = args[2];

var latestDrawing = new data.Drawing(0, 0, []);

var socket = io.connect(serverAddress);
socket.on('connect', function() {
    console.log('Connected to server.');
});
socket.on('error', function(e) {
    console.log("ERROR", e);
    process.exit(1);
});

var canvas;
var canvasContext;

function drawEntireCanvas() {
    canvas = new Canvas(latestDrawing.width, latestDrawing.height)
    console.log("Creating canvas of", latestDrawing.width, "x", latestDrawing.height)

    canvasContext = canvas.getContext('2d')

    canvasContext.rect(0, 0, latestDrawing.width, latestDrawing.height);
    canvasContext.lineWidth = 0;
    canvasContext.fillStyle = "white";
    canvasContext.fill();
    
    canvasContext.strokeStyle = 'black';
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();

    _.each(latestDrawing.lines, drawLineToCanvas);

    canvasContext.stroke();
}

function drawLineToCanvas(line) {
    if (!canvasContext) return;

    canvasContext.moveTo(line.x1, line.y1);
    canvasContext.lineTo(line.x2, line.y2);
}

/**
 * Write the current state of the canvas to a file
 *
 * Returns a promise with the filename.
 */
function writeCanvasToFile() {
    var deferred = Q.defer();

    var filename = 'state.png';

    if (canvasContext.saveToFile) {
        // Canvas-win, use sync call
        ctx.saveToFile(filename, 'image/png');
        deferred.resolve(filename);
    }
    else {
        // Cairo Canvas, use stream interface
        var out = fs.createWriteStream(filename);
        var stream = canvas.createPNGStream();

        stream.on('data', function(chunk) {
            out.write(chunk);
        });
        stream.on('end', function() {
            out.end();
            deferred.resolve(filename);
        });
    }

    return deferred.promise;
}

var guesserRunning = false;
var dirty = false;

/**
 * Invoke the guesser with the given filename
 *
 * Return a promise for the process' stdout.
 */
function invokeGuesser(filename) {
    var deferred = Q.defer();

    guesserRunning = true;
    var dir = path.dirname(executable);
    var commandline = './' + path.basename(executable) + ' "' + path.resolve(filename) + '"';
    console.log('Running: ' + commandline);
    var proc = child_process.exec(commandline, { cwd: dir }, function(error, stdout, stderr) {
        guesserRunning = false;
        if (error)
            deferred.reject(error);
        else {
            if (stderr.toString()) {
                deferred.reject(stderr.toString());
            }
            else {
                deferred.resolve(trim(stdout.toString()));
            }
        }
    });

    return deferred.promise;
}

// FIXME: Incoming lines after running are not triggered properly

/**
 * Called when the drawing has changed
 *
 * Rasterizes the image, calls the executable, and sends its output back
 * as a guess.
 */
var callClient = function() {
    if (!latestDrawing.lines.length) return;

    if (guesserRunning) { // No two calls at a time, but record for later use
        dirty = true;
        return;
    }
    guesserRunning = true;

    writeCanvasToFile()
        .then(invokeGuesser)
        .then(function(guess) {
            guesserRunning = false;
            console.log('Sending guess:', guess);
            socket.emit('guess', new data.Guess(teamName, '', guess));
            if (dirty) {
                dirty = false;
                callClient();
            }
        })
        .catch(function(error) {
            guesserRunning = false;
            console.log('ERROR:', error);
            if (dirty) {
                dirty = false;
                callClient();
            }
        });
};

// Update drawing based on information from server
socket.on('drawing', function(drawing) {
    latestDrawing = drawing;
    drawEntireCanvas();
    callClient();
});
socket.on('line', function(line) {
    latestDrawing.lines.push(line);
    drawLineToCanvas(line);
    canvasContext.stroke();
    callClient();
});

