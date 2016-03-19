'use strict';
require('dotenv').config(); 
var client = require('twilio')(process.env.account_sid, process.env.auth_token);
var path = require('path');
var express = require('express');
var app = express();
module.exports = app;

// Pass our express application pipeline into the configuration
// function located at server/app/configure/index.js

// Routes that will be accessed via AJAX should be prepended with
// /api so they are isolated from our GET /* wildcard.


/*
 This middleware will catch any URLs resembling a file extension
 for example: .js, .html, .css
 This allows for proper 404s instead of the wildcard '/*' catching
 URLs that bypass express.static because the given file does not exist.
 */

app.use(express.static('./sirvo'));

app.use(function (req, res, next) {

    if (path.extname(req.path).length > 0) {
        res.status(404).end();
    } else {
        next(null);
    }

});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './../sirvo/index.html'));
});

app.get('/ready', function (req, res) {
  sendText( process.env.number, process.env.twilio_num, "Your coffee's ready!");
  function sendText(to,from,msg) {
    client.sms.messages.create({
      to: to,
      from: from,
      body:msg
    }, function(error, message) {
      if (!error) {
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);
        console.log('Message sent on:');
        console.log(message.dateCreated);
      } else {
        console.log('Oops! There was an error.', error);
      }
    });
}
res.redirect('/');
});

app.listen(1337);

// Error catching endware.
app.use(function (err, req, res, next) {
    console.error(err.status);
    res.status(err.status || 500).send(err.message || 'Internal server error.');
});
