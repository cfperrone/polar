// index.js

function updateWebcam() {
    $.get('/image', { }, function(data) {
        $('.cam').html(data);
        $('.webcam').on('click', function() {
            updateWebcam();
        });
    });
}

$(document).ready(function() {
    updateWebcam();
});

$('.remote button').click(function(event) {
    event.preventDefault();

    var action = $(this).data('action');

    $.post('/cmd', { action: action }, function(data) {
        updateWebcam();
    });
});
