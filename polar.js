var express = require('express'),
    bodyParser = require('body-parser'),
    mustache = require('mustache-express'),
    fs = require('fs'),
    execFile = require('child_process').execFile;

// -- Configuration
var LIRC_COMMAND = 'irsend',
    LIRC_ARGS = [ 'SEND_ONCE', 'air_conditioner' ],
    BUTTON_MAP = {
        power: 'BTN_0',
        mode: 'BTN_1',
        auto: 'BTN_2',
        temp_up: 'BTN_3',
        temp_dn: 'BTN_4',
        fan_up: 'BTN_5',
        fan_dn: 'BTN_6',
        delay: 'BTN_7',
        delay_up: 'BTN_8',
        delay_dn: 'BTN_9'
    },
    STREAMER_COMMAND = 'streamer',
    IMAGE_PATH = __dirname + '/static/webcam.jpeg',
    STREAMER_ARGS = [ '-f', 'jpeg', '-o' , IMAGE_PATH ];

// -- Global Instantiation
var app = express(),
    streamer_execute = false;
app.use(express.static(__dirname + '/static/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
    // Load new webcam image on page load
    getNewImage();

    res.render('index', {
        pageTitle: 'This is a title',
        imageDate: getImageUpdateDate(),
    });
});
app.post('/cmd', function(req, res) {
    var action = req.body.action;

    if (action == '') {
        res.send("error");
        return;
    }

    execute(action);
    res.send("OK");

});
app.post('/imageTime', function(req, res) {
    res.send(getImageUpdateDate());
});

app.listen(80);

// -- Execute the lirc send command for the given action
function execute(action) {
    var button = BUTTON_MAP[action],
        args = LIRC_ARGS.slice(); // Copy the args array by value

    if (typeof(button) === 'undefined') {
        console.log("Could not find action " + action + " in button map");
        return;
    }

    args.push(button);
    console.log("Calling: " + LIRC_COMMAND + " " + args.join(' '));
    execFile(LIRC_COMMAND, args, function(err, stdout, stderr) {
        if (err !== null) {
            console.log("LIRC ERROR: " + err);
        }

        // Update the webcam image
        getNewImage();
    });
}

// -- Execute the streamer command to retrieve a new image from the webcam
function getNewImage() {
    console.log("Updaing webcam");

    if (streamer_execute == true) {
        console.log("Skipped updating because streamer is already running");
        return;
    }

    streamer_execute = true;
    execFile(STREAMER_COMMAND, STREAMER_ARGS, function(err, stdout, stderr) {
        if (err !== null) {
            console.log("STREAMER ERROR: " + err);
        }
        streamer_execute = false;
    });
}

function getImageUpdateDate() {
    fs.exists(IMAGE_PATH, function(exists) {
        if (exists == false) {
            return 0;
        }

        var stat = fs.statSync(IMAGE_PATH);
        return stat['mtime'];
    });
}
