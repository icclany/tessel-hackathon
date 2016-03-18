var tessel = require('tessel');
var notificationLED = tessel.led[3];

// SERIAL NO: TM-00-04-f000da30-00694f4b-3a9125c2

var camera = require('camera-vc0706').use(tessel.port['A']);

camera.on('ready', function () {

    notificationLED.high();

    camera.takePicture(function (err, image) {
        if (err) return console.error(err);
        process.sendfile('audience.jpg', image);
    });

});