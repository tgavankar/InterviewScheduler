// API Key: AIzaSyCJB-CTN9Lq925VkvX3awxOMEuNi6OvieA
$(document).ready(function() {
	
	/*gapi.client.request({
		'path':'calendars/r5p25tev3v42r11u242u959ev8@group.calendar.google.com',
		'method':'GET',
		'body': {
			'media': {
				'contentType': 'application/json',
			}
			}
	})*/
});

function load() {
	alert("loading");
	gapi.client.setApiKey('AIzaSyDiwVKBJwrbJFtrxqjenl7u9fk5eVMoMJw');
	var resource = {
        "summary":"My Summary",
        "location": "My Location",
	"description": "My Description",
        "start": {
          "date": "2012/06/18"  //if not an all day event, "date" should be "dateTime" with a dateTime value formatted according to RFC 3339
        },
        "end": {
          "date": "2012/06/18"  //if not an all day event, "date" should be "dateTime" with a dateTime value formatted according to RFC 3339
        }
      };
	   
	 var ev = {
  'summary': 'Appointment',
  'location': 'Somewhere',
  'start': {
    'dateTime': '2012-09-03T10:00:00.000-07:00'
  },
  'end': {
    'dateTime': '2012-09-03T10:25:00.000-07:00'
  }
};
  gapi.client.load('calendar', 'v3', function() {
    var requ = gapi.client.calendar.events.insert({
      'calendarId': 'r5p25tev3v42r11u242u959ev8@group.calendar.google.com',
	   'resource': ev
    });
	var req = gapi.client.calendar.events.insert({
  'calendarId': 'r5p25tev3v42r11u242u959ev8@group.calendar.google.com',
  'resource': {
  'summary': 'Appointment',
  'location': 'Somewhere',
  'start': {
    'dateTime': '2012-09-03T10:00:00.000-07:00'
  },
  'end': {
    'dateTime': '2012-09-03T10:25:00.000-07:00'
  }
}
});
req.execute(function(resp) {
  console.log(resp);
});
	     req.execute(function(resp) {
       console.log(resp);
	   if (resp.id){
	   	 alert("Event was successfully added to the calendar!");
	   }
	   else{
	   	alert("An error occurred. Please try again later.")
	   }
       
     });
	});

}
 
 function init() { 
    gapi.auth.init(checkAuth); 
} 

function checkAuth() { 
 var config = {
          'client_id': '1054661617958.apps.googleusercontent.com',
          'scope': 'https://www.googleapis.com/auth/calendar',
		  'response_type': 'token'
        };
  setTimeout(function() { 
    gapi.auth.authorize(
    config, function() {
          console.log('login complete');
		    load();
          console.log(gapi.auth.getToken());
        }); 
  }, 1); 
} 