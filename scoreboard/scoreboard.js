$(function() {
    var canvas = document.getElementById('drawingCanvas');
    var context = canvas.getContext('2d');

    function drawLines(lines) {
        context.lineWidth = 3;
        context.beginPath();
        $.each(lines, function(index, line) {
            context.moveTo(line.x1, line.y1);
            context.lineTo(line.x2, line.y2);
        });
        context.stroke();
    }

    function ScoreBoardViewModel() {
        var self = this;

        self.players = ko.observableArray();
        self.drawingWidth = ko.observable();
        self.drawingHeight = ko.observable();
        self.drawingLines = ko.observableArray();
        self.drawingLines.subscribe(function(lines) {
            context.clearRect(0 ,0 ,context.canvas.width, context.canvas.height);
            drawLines(lines);
        });
        self.gameMessage = ko.observable();
    };

    var scoreBoardViewModel = new ScoreBoardViewModel();

    var socket = io.connect();
    socket.on('gameState', function(gameState) {
        scoreBoardViewModel.players(gameState.players);
    });

    socket.on('drawing', function(drawing) {
        scoreBoardViewModel.drawingWidth(drawing.width);
        scoreBoardViewModel.drawingHeight(drawing.height);
        scoreBoardViewModel.drawingLines(drawing.lines);
    });
    
    socket.on('line', function(line) {
        drawLines([line]);
    });

    socket.on('gameMessage', function(gameMessage) {
        scoreBoardViewModel.gameMessage(gameMessage);
    });

    ko.applyBindings(scoreBoardViewModel);

    var resize = function() {
        $(canvas).height($(window).height() * 0.85);
    }
    $(window).resize(resize);
    resize();
});

