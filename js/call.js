onTestComplete = function(){
  if (audioSupported){
    setTimeout(function(){
      setText(statusTitleEl, 'Session Started');
      setText(statusMessageEl, '');
      statusContainerEl.removeChild(statusIconEl);
      
      initCall();
    }, 3000);
  }
}

function initCall(){
  getJSON('/session.id', function(data) {
    SESSION_ID = data.sessionId;
    
    getJSON('/token', function(data) {
      TOKEN = data.token;

      startCall();
    }, function(status) {
      alert("TOKEN ERROR:\nSomething went wrong.");
    });
  }, function(status) {
    alert("SESSION ID ERROR:\nSomething went wrong.");
  });
}

function startCall(){
  var peersContainer = statusContainerEl.querySelector('div');
  
  session = OT.initSession(API_KEY, SESSION_ID);
  
  session.connect(TOKEN, function(error) {
    // If the connection is successful, initialize a publisher and publish to the session
    if (!error) {
      publisher = OT.initPublisher(statusMessageEl, {
        insertMode: 'append',
        width: '320px',
        height: '240px'
      });
      
      publisher.publishVideo(videoSupported);
      session.publish(publisher, function(error){
        if (error) {
          console.log(error);
        }
      });
      
      session.on('streamCreated', function(event) {
        subscriber = session.subscribe(event.stream,
          peersContainer,
          {
            insertMode: 'append',
            width: '320px',
            height: '240px'
          },
          function (error) {
            if (error) {
              console.log(error);
            }
          }
        );
      });
    } else {
      console.log('There was an error connecting to the session:', error.code, error.message);
    }
  });
}