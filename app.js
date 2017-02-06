'use strict';

var firebase = require('firebase-admin');
var request = require('request');

var API_KEY = "AAAAoEOSO4I:APA91bEqejBgkTR415xWmCeWZ5IrLOlK0-y3Cy3WiNdihaxnaHohf8SVuRW0lrFUpjVOR-kTofwkMktE-reGdKY-hPP4fIFA2eWUeHrB-CSahr_6_8JRNLcLLr0emgnihmBjz4yNmY8Pz4Oj80BOgcX4E8mL07Pz4w"; // Your Firebase Cloud Messaging Server API key

// Fetch the service account key JSON file contents
var path = require('path');
var serviceAccount = require( path.resolve( __dirname, "./service_key.json" ));

// Initialize the app with a service account, granting admin privileges
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://lyra-4fdfa.firebaseio.com"
});
var ref = firebase.database().ref();

function listenForNotificationRequests() {
  var requests = ref.child('notificationRequests');
  requests.on('child_added', function(requestSnapshot) {
    var request = requestSnapshot.val();
    sendNotificationToUser(
      request.username, 
      request.title,
      request.message,
      request.picUrl,
      function() {
        console.log(request.message);
        console.log(request.username);
        requestSnapshot.ref.remove();
      }
    );
  }, function(error) {
    console.error(error);
  });
};

function sendNotificationToUser(username, title, message, url, onSuccess) {
  request({
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type' :' application/json',
      'Authorization': 'key='+API_KEY
    },
    body: JSON.stringify({
       data : {
      		title: title,
      		message: message,
      		picUrl: url

    },
      to : '/topics/user_'+username
    })
  }, function(error, response, body) {
    if (error) { console.error(error); }
    else if (response.statusCode >= 400) { 
      console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage); 
    }
    else {
      onSuccess();
    }
  });
}

// start listening
listenForNotificationRequests();
// [END app]
