var fs = require('fs');
var express = require('express');
var server = express();
var OpenTok = require('opentok');
var opentok = new OpenTok('45334512', '3d08d435640b7ab39ef62a2d4872ef8ed128a852');
var SESSION_ID;
var QUALITY_SESSION_ID;

// Before starting server we need two OpenTok session id's
// one for quality testing and one for our call
console.log('Creating OpenTok quality session...');
opentok.createSession({mediaMode:"routed"}, function(error, result) {
  if (error) {
    console.log("Error creating quality session:", error);
    process.exit(1);
  } else {
    QUALITY_SESSION_ID = result.sessionId;
    console.log('Quality session created...');
  }
});
console.log('Creating OpenTok session...');
opentok.createSession({mediaMode:"relayed"}, function(error, result) {
  if (error) {
    console.log("Error creating session:", error);
    process.exit(1);
  } else {
    SESSION_ID = result.sessionId;
    fs.writeFile('last_session.id', SESSION_ID, function (err) {
      if (err){
        console.log("Error creating session:", err);
        process.exit(1);
      }
      
      // Session creation was successful,
      // now we start the server
      console.log('Session created...');
      start_server();
    });
  }
});

function start_server(){
  // Serve files for browser clients
  server.get('/', function(req, res){
    // Serve index file
    res.type('html'); 
    res.sendFile(__dirname + '/index.html', {}, function (err) {});
    console.log('User arrived on root...');
  });
  server.get('/:dir/:name', function(req, res, next){
    // Serve asset files
    var options = {
      root: __dirname + '/' + req.params.dir + '/',
      dotfiles: 'deny',
      headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
      }
    };
    var fileName = req.params.name;
    console.log(fileName);
    res.sendFile(fileName, options, function (err) {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
      else {
        console.log('Sent:', fileName);
      }
    });
  });
  
  // Send session id's stored in memory
  // when client requests it
  server.get('/quality.session.id', function(req, res){
    var response = {
      sessionId: QUALITY_SESSION_ID
    };
    
    res.type('json'); 
    res.send(JSON.stringify(response));
  });
  server.get('/session.id', function(req, res){
    var response = {
      sessionId: SESSION_ID
    };
    
    res.type('json'); 
    res.send(JSON.stringify(response));
  });
  
  // When client requests token,
  // generate token and send it
  server.get('/quality.token', function(req, res){
    var token = opentok.generateToken(QUALITY_SESSION_ID);
    
    var response = {
      token: token
    };
    
    res.type('json'); 
    res.send(JSON.stringify(response));
  });
  server.get('/token', function(req, res){
    var token = opentok.generateToken(SESSION_ID);
    
    var response = {
      token: token
    };
    
    res.type('json'); 
    res.send(JSON.stringify(response));
  });

  server.listen(3000);
}