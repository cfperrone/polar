// index.js

function updateWebcam() {
    var date = new Date();
    $.post('/imageTime', { }, function(data) {
        $('.webcam').attr('src', '/webcam.jpeg?' + date.getTime());
        $('.timestamp').html(data);
    });
}

$(document).ready(function() {
    setTimeout(updateWebcam, 3000);
});

$('.remote button').click(function(event) {
    event.preventDefault();

    var action = $(this).data('action');

    $.post('/cmd', { action: action }, function(data) {
        setTimeout(updateWebcam, 3000);
    });
});