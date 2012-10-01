// API Key: AIzaSyCJB-CTN9Lq925VkvX3awxOMEuNi6OvieA
$(document).ready(function() {
	
});
 
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
           // load();
            console.log(gapi.auth.getToken());
        }); 
    }, 1); 
} 

//Add Events to Calendar
function asdf() {
    gapi.client.setApiKey('AIzaSyDiwVKBJwrbJFtrxqjenl7u9fk5eVMoMJw');
    var resource = {
        "summary":"My Summary",
        "location": "My Location",
        "description": "My Description",
        "start": {
        "date": "2012/06/18"  /*if not an all day event, "date" should be "dateTime" with a dateTime value formatted according to RFC 3339*/},
        "end": {
        "date": "2012/06/18"  /*if not an all day event, "date" should be "dateTime" with a dateTime value formatted according to RFC 3339*/}
		};
	   
    var event = {
    'summary': 'Appointment',
    'location': 'Somewhere',
    'start': {
    'dateTime': '2012-09-10T10:00:00.000-07:00'},
    'end': {
    'dateTime': '2012-09-10T10:25:00.000-07:00'}
    };
    gapi.client.load('calendar', 'v3', function() {
        var req = gapi.client.calendar.events.insert({
        'calendarId': 'r5p25tev3v42r11u242u959ev8@group.calendar.google.com',
        'resource': event});
	
        req.execute(function(resp) {
            console.log(resp);
            if (resp.id){
                alert("Event was successfully added to the calendar!");
            } else{
                alert("An error occurred. Please try again later.")
            }
       
        });
    });
}
//make Calendar
function qwer(){
    gapi.client.setApiKey('AIzaSyDiwVKBJwrbJFtrxqjenl7u9fk5eVMoMJw');

calendar = {
    'summary': 'calendarSummary',
    'timeZone': 'America/New_York'
}
 gapi.client.load('calendar', 'v3', function() {
 var req = gapi.client.calendar.calendars.insert({'resource':calendar});
 req.execute(function(resp) {
            console.log(resp);
			console.log(resp.id);
            if (resp.id){
                alert("Event was successfully added to the calendar!");
            } else{
                alert("An error occurred. Please try again later.")
            }
       
        });
		});
}

function load() {
    gapi.client.setApiKey('AIzaSyDiwVKBJwrbJFtrxqjenl7u9fk5eVMoMJw');
	var data = {
			 'timeMin': '2012-09-30T10:00:00.000-07:00',
    'timeMax': '2012-10-02T10:25:00.000-07:00',
				'items': [
					{
						'id': 'r5p25tev3v42r11u242u959ev8@group.calendar.google.com'
					},{
						'id': 'cq6omn9kt4uld6agu4dhevucm0@group.calendar.google.com'
					}
				]};
		gapi.client.load('calendar', 'v3', function() {
			var query = gapi.client.calendar.freebusy.query(data);
			query.execute(function(resp) {
            console.log(resp);
			//console.log(resp.id);
            if (resp){
                alert("Freebusy was successfully added to the calendar!");
            } else{
                alert("An error occurred. Please try again later.")
            }
       
        })
		;});
}
