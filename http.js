// STIRVO!!!!!!
// IP IS 192.168.2.201

var http = require('http');
var server = http.createServer();
var tessel = require('tessel');
var servolib = require('servo-pca9685');
var servo = servolib.use(tessel.port['C']);
var climatelib = require('climate-si7020');
var climate = climatelib.use(tessel.port['B']);
var stirInterval, climInterval, stirConfiguration, climConfig, climReady, servoReady;
var position = 0; //  Target position of the servo between 0 (min) and 1 (max).

var servo1 = 1;
var status = '';

server.on('request', function(req, res) {
    console.log("Got a request!")
    if (req.url === '/') {
        //if it is saying to start stirring, check if servo and climate are ready. If so stir
        if (climReady && servoReady) {
            climConfig();
        }
        res.end();
    }
});

stirConfiguration = function() {

    servo.configure(servo1, 0.05, 0.3, function() {
        stirInterval = setInterval(function() {
            //  Set servo #1 to position pos.
            servo.move(servo1, position);

            // Increment by 10% (~18 deg for a normal servo)
            position += 1;
            if (position > 1) {
                position = 0; // Reset servo position
            }
        }, 750); // Every 500 milliseconds
    });
}
// function clearClimInt
climConfig = function() {
    climInterval = setInterval(function() {
        climate.readTemperature('f', function(err, temp) {
            if (temp < 90) {
                // Send requestto notify 
                clearInterval(stirInterval);
                //send get to other internet and clear climInterval
                clearInterval(climInterval);
                stirInterval = null;
                console.log('READY and temp is ', temp.toFixed(2));
                http.get("http://192.168.1.166:1337/ready")
            } else {
                stirInterval ? "" : stirConfiguration();
                console.log('Temp is ', temp.toFixed(2));
            }
        });
    }, 1000);

}
servo.on('ready', function() {
    //set var to say servo is read
    server.listen(1337, function() {
        console.log('Server listening!');
    });
    servoReady = true;
});

climate.on('ready', function() {
    //set var to say climate is ready
    climReady = true;
});

climate.on('error', function(err) {
    console.log('error connecting module', err);
});



// servo.on('ready', function () {
//   var position = 0;  //  Target position of the servo between 0 (min) and 1 (max).

//   //  Set the minimum and maximum duty cycle for servo 1.
//   //  If the servo doesn't move to its full extent or stalls out
//   //  and gets hot, try tuning these values (0.05 and 0.12).
//   //  Moving them towards each other = less movement range
//   //  Moving them apart = more range, more likely to stall and burn out
//   servo.configure(servo1, 0.05, 0.3, function () {
//     setInterval(function () {
//       console.log('Position (in range 0-1):', position);
//       //  Set servo #1 to position pos.
//       servo.move(servo2, position);

//       // Increment by 10% (~18 deg for a normal servo)
//       position += 1;
//       if (position > 1) {
//         position = 0; // Reset servo position
//       }
//     }, 750); // Every 500 milliseconds
//   });

// });




// climate.on('ready', function(){
//   setInterval(function(){
//     climate.readHumidity(function(err, humid){
//       climate.readTemperature('f', function(err, temp){
//         console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
//       });
//     });
//   }, 5000);
// });

// climate.on('error', function(err) {
//   console.log('error connecting module', err);
// });