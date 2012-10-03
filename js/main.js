/**
 * API Key Switcher
 * Change to your name when developing.
 */
var user = 'tanay';

var keys = {
    'tanay': {
        'client': '41915610334.apps.googleusercontent.com',
        'api': 'AIzaSyCJB-CTN9Lq925VkvX3awxOMEuNi6OvieA',
    },
    'jocelyn': {
        'client': '1054661617958.apps.googleusercontent.com',
        'api': 'AIzaSyDiwVKBJwrbJFtrxqjenl7u9fk5eVMoMJw',
    }
};

$(document).ready(function() {

    $('#form').submit(function(event) {
        event.preventDefault();
	    var studentArray = parse();
    	getFreeBusy(studentArray);

    });
});

//
function Student(a_fname, b_lname, c_calendar_id, d_free_times, e_busy_times) {
    this.a_fname = a_fname;    
    this.b_lname = b_lname;    
    this.c_calendar_id = c_calendar_id;
    this.d_free_times = d_free_times;
    this.e_busy_times = e_busy_times;
}

function Interviewer() {

}

var available_times = {8:[1,1,1,1],
                       9:[1,1,1,1],
                       10:[1,1,1,1],
                       11:[1,1,1,1],
                       12:[1,1,1,1],
                       13:[1,1,1,1],
                       14:[1,1,1,1],
                       15:[1,1,1,1],
                       16:[1,1,1,1],
					   17:[1,1,1,1]}
					   
function parse() {
var fields = document.getElementsByTagName("fieldset");
var arr = {};
    /*$('fieldset').find('input').each(function(i) {
	    console.log(this);
	});*/
    for(var i = 0; i<fields.length; i++) {
        //gets inputs for every field
        var inputs = fields[i].getElementsByTagName("input");
        var data = [];
        for(var j = 0; j< inputs.length; j++) {
            data.push(inputs[j].value);
        }
        var s = new Student();
        var count = 0;
        for(k in s) {
            if(count < inputs.length) {
                s[k] = data[count];
                 count++;
            } else {
                break;
            }
        }
        arr[s.c_calendar_id] = s;
    }
    return arr;
}


//x.substring(x.indexOf('T')+1, x.indexOf('.')).split(":");
/*[
					{
						'id': 'r5p25tev3v42r11u242u959ev8@group.calendar.google.com'
					},{
						'id': 'cq6omn9kt4uld6agu4dhevucm0@group.calendar.google.com'
					}
				]*/
function getFreeBusy(studentArray) {
    var items = [];

	for(var i in studentArray) {
	    items.push({'id': studentArray[i].c_calendar_id});
	}
    gapi.client.setApiKey(keys[user]['api']);
	//get result from form, for every group, create new Student Object with fname, lname, calendar_id, 
	//clone available times into free field, and empty array for busy and also within same loop
	//create an array of items that holds calid and also push new student objects into student array
	var data = {'items': items,
			 'timeMin': '2012-10-01T9:00:00.000-04:00',
			 'timeMax': '2012-10-01T17:00:00.000-04:00',
				'timeZone': 'America/New_York'
				};
				
				"2012-10-01T16:30:00-04:00"
		gapi.client.load('calendar', 'v3', function(callback) {
			var query = gapi.client.calendar.freebusy.query(data);
			query.execute(function(resp) {
			//parse out time, for every calendar, parse out time, loop through student array(length should be equal) and then set the busy and free times
			//might need to do a callback function in order for data to stay in scope
			console.log(resp.calendars);
            console.log(resp.calendars.length);
            for(var s in resp.calendars) {
                console.log(s);
                console.log(resp.calendars[s]["busy"]);
                console.log(resp.calendars[s].busy[0].end);
                var busyTimes = resp.calendars[s].busy;
                for( var t in busyTimes) {
                    var start = busyTimes[t].start.substring(busyTimes[t].end.indexOf('T')+1);
                    var startp = start.substring(0,start.indexOf('-'));
                    var num = startp.split(':');
                    
                    var times = jQuery.extend({}, available_times);
                    
                }
                //var x = resp.calendars[s].busy[0]["end"].substring(x.indexOf('T')+1);
            }
			
			
          
       
        })
		;});
}
 

function init() { 
    gapi.auth.init(checkAuth); 
} 

function checkAuth() { 
    var config = {
        'client_id': keys[user]['client'],
        'scope': 'https://www.googleapis.com/auth/calendar',
        'response_type': 'token'
    };
    setTimeout(function() { 
        gapi.auth.authorize(
        config, function() {
            console.log('login complete');
            console.log(gapi.auth.getToken());
        }); 
    }, 1); 
} 

//Add Events to Calendar
function asdf() {
    gapi.client.setApiKey(keys[user]['api']);
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
    'dateTime': '2012-10-02T9:00:00.000-04:00'},
    'end': {
    'dateTime': '2012-10-02T11:25:00.000-04:00'}
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
    gapi.client.setApiKey(keys[user]['api']);

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

