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
    res.render('index', {
        pageTitle: 'Air Conditioner Remote',
        imageDate: getImageUpdateDate()
    });
});
// -- Sends a command
app.post('/cmd', function(req, res) {
    var action = req.body.action;

    if (action == '') {
        res.send("error");
        return;
    }

    execute(action);
    res.send("OK");

});
// -- Captures a new image and renders the cam template
app.get('/image', function(req, res) {
    execFile(STREAMER_COMMAND, STREAMER_ARGS, function(err, stdout, stderr) {
        if (err !== null) {
            console.log("STREAMER ERROR:" + err);
            return;
        }

        var date = new Date();
        res.render('cam-image', {
            timestamp: date.getTime(),
            imageDate: getImageUpdateDate()
        });
    });
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
    });
}

function getImageUpdateDate() {
    if (fs.existsSync(IMAGE_PATH)) {
        var stat = fs.statSync(IMAGE_PATH);
        return stat['mtime'];
    }
    return 0;
}
