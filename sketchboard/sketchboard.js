$(function() {

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function Line(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    var lines = [];

    var model = {
        screen: ko.observable('drawing'),
        modalMessage: ko.observable('Please wait for a new round to start.'),
        secretWord: ko.observable('Boobie')
    };

    ko.applyBindings(model);

    var drawing = false;
    var last;
	
    var context = $('#draw-canvas').get(0).getContext('2d');
    context.strokeStyle = 'black';

    context.canvas.width = $('#draw-canvas').width();
    context.canvas.height = $('#draw-canvas').height();

    var pointFromEvent = function(e) {
        var x = e.pageX - $(e.target).offset().left;
        var y = e.pageY - $(e.target).offset().top;

        return new Point(x, y);
    }
    
    function drawLine(line) {
        lines.push(line);
        context.lineTo(line.x2, line.y2);
        context.stroke();
    }

    $('#draw-area').on('mousedown touchstart', function(e) {
        drawing = true;

        last = pointFromEvent(e);
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(last.x, last.y);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mousemove touchmove', function(e) {
        if (!drawing) return;

        var pt   = pointFromEvent(e);
        var line = new Line(last.x, last.y, pt.x, pt.y);
        last = pt;
        
        drawLine(line);
        sendLineToServer(line);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mouseup touchend', function(e) {
        if (!drawing) return;
        
        drawing = false;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    var socket = io.connect('http://localhost');
    
    function sendLineToServer(line) {
        socket.emit('line', line);
    }
    
    function sendLinesToServer() {
        socket.emit('gameState', { drawing : {
            width: context.canvas.width,
            height: context.canvas.height,
            round: 0,
            'final': false,
            lines: lines
        }});
    }

});
