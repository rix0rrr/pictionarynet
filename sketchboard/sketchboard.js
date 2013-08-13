$(function() {

    var model = {
        screen: ko.observable('drawing'),
        modalMessage: ko.observable('Please wait for a new round to start.'),
        secretWord: ko.observable('Boobie')
    };

    ko.applyBindings(model);

    var isDrawing = false;
    var last;
	
    var context = $('#draw-canvas').get(0).getContext('2d');
    context.strokeStyle = 'black';

    context.canvas.width = $('#draw-canvas').width();
    context.canvas.height = $('#draw-canvas').height();

    var drawing;

    function resetDrawing() {
      drawing = new Drawing(context.canvas.width, context.canvas.height, []);
      context.clearRect(0 ,0 ,context.canvas.width, context.canvas.height);  
    }

    resetDrawing();

    var pointFromEvent = function(e) {
        var x = e.pageX - $(e.target).offset().left;
        var y = e.pageY - $(e.target).offset().top;

        return new Point(x, y);
    }
    
    function drawLine(line) {
        drawing.lines.push(line);
        context.lineTo(line.x2, line.y2);
        context.stroke();
    }

    $('#draw-area').on('mousedown touchstart', function(e) {
        isDrawing = true;

        last = pointFromEvent(e);
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(last.x, last.y);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mousemove touchmove', function(e) {
        if (!isDrawing) return;

        var pt   = pointFromEvent(e);
        var line = new Line(last.x, last.y, pt.x, pt.y);
        last = pt;
        
        drawLine(line);
        sendLineToServer(line);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mouseup touchend', function(e) {
        if (!isDrawing) return;
        
        isDrawing = false;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    var socket = io.connect('http://localhost');
    socket.on('connect', function() {
        socket.emit('drawing', drawing);

        socket.on('round', function(round) {
            model.secretWord(round.word);
            resetDrawing();
        });
    });

    function sendLineToServer(line) {
        socket.emit('line', line);
    }

    $('#doneButton').click(function() {
        socket.emit('finished', drawing);
    });
    
});
