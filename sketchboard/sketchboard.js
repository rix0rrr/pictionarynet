$(function() {

    var model = {
        screen: ko.observable('screen'),
        modalMessage: ko.observable('Please wait for a new round to start.'),
        secretWord: ko.observable('Word')
    };

    ko.applyBindings(model);

    var isDrawing = false;
    var last;
	
    var context = $('#draw-canvas').get(0).getContext('2d');
    context.strokeStyle = 'black';

    var drawing;
    var socket;

    function resetDrawing() {
      drawing = new Drawing(context.canvas.width, context.canvas.height, []);
      context.clearRect(0 ,0 ,context.canvas.width, context.canvas.height);  
      if (socket) socket.emit('drawing', drawing);
    }

    function redrawDrawing() {
        context.fillStyle = 'white';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);  

        context.beginPath();
        for (var i = 0; i < drawing.lines.length; i++) {
            drawLine(drawing.lines[i]);
        }
        context.closePath();
    }

    var pointFromEvent = function(e) {
        var x, y;

        if (e.originalEvent.targetTouches) {
            x = e.originalEvent.targetTouches[0].pageX;
            y = e.originalEvent.targetTouches[0].pageY;
        } else {
            x = e.pageX;
            y = e.pageY;
        }

        return new Point(x - $(e.target).offset().left, y - $(e.target).offset().top);
    }
    
    function drawLine(line) {
        if (!line) return;

        context.moveTo(line.x1, line.y1);
        context.lineTo(line.x2, line.y2);
        context.stroke();
    }

    function endLine() {
        drawing.lines.push(null);
    }

    $('#draw-area').on('mousedown touchstart', function(e) {
        isDrawing = true;

        last = pointFromEvent(e);
        context.lineWidth = 3;
        context.beginPath();

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mousemove touchmove', function(e) {
        if (!isDrawing) return;

        var pt   = pointFromEvent(e);
        var line = new Line(last.x, last.y, pt.x, pt.y);
        last = pt;
        
        drawing.lines.push(line);
        drawLine(line);
        sendLineToServer(line);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }).on('mouseup touchend', function(e) {
        if (!isDrawing) return;

        context.closePath();
        endLine();
        sendLineToServer(null);
        isDrawing = false;

        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    socket = io.connect();
    socket.on('connect', function() {
        context.canvas.width =  $('#draw-canvas').width();
        context.canvas.height = $('#draw-canvas').height();

        resetDrawing();

        socket.on('round', function(round) {
            model.screen('drawing');
            model.secretWord(round.word);
            resetDrawing();
        });

        socket.on('gameMessage', function(message) {
            if (message != '') {
                model.screen('modal');
                model.modalMessage(message);
            } else {
                model.screen('drawing');
                model.modalMessage(message);
            }
        });
    });

    function sendLineToServer(line) {
        socket.emit('line', line);
    }

    $('#doneButton').click(function() {
        socket.emit('finished');
    });

    $('#undoButton').click(function() {
        socket.emit('undo');
        undoLastDrawingMotion(drawing);
        redrawDrawing();
    });
});
