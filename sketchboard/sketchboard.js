$(function() {

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function Line(begin, end) {
        this.begin = begin;
        this.end   = end;
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

    var pointFromEvent = function(e) {
        if (e.originalEvent.targetTouches) {

            var x = e.originalEvent.targetTouches[0].pageX - $(e.target).offset().left;
            var y = e.originalEvent.targetTouches[0].pageY - $(e.target).offset().top;

            return new Point(x, y);
        } else {
            return new Point(e.offsetX, e.offsetY);
        }
    }

    $('#draw-area').on('mousedown touchstart', function(e) {
        drawing = true;

        last = pointFromEvent(e);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mousemove touchmove', function(e) {
        if (!drawing) return;
        var pt   = pointFromEvent(e);
        var line = new Line(last, pt);
        last = pt;

        lines.push(line);
        drawLines([line]);
        sendLinesToServer();

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mouseup touchend', function(e) {
        drawing = false;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    var context = $('#draw-canvas').get(0).getContext('2d');
    context.strokeStyle = 'black';

    context.canvas.width = $('#draw-canvas').width();
    context.canvas.height = $('#draw-canvas').height();

    function drawLines(lines) {
        $.each(lines, function(i, line) {
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(line.begin.x, line.begin.y);
            context.lineTo(line.end.x, line.end.y);
            context.stroke();
        });
        context.closePath();
    }

    var socket = io.connect('http://localhost');

    function sendLinesToServer() {
        socket.emit('gameState', { drawing : {
            width: context.canvas.width,
            height: context.canvas.height,
            round: 0,
            'final': false,
            lines: $.map(lines, function(line) {
                return { x1: line.begin.x, y1: line.begin.y,
                         x2: line.end.x,   y2: line.end. y };
            })
        }});
    }

});
