$(function() {

    var socket = io.connect('http://localhost');
    socket.on('message', function(data) {
        $('<div>' + data.data + '</div>').appendTo(document.body);

    });

});
