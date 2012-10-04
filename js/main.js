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

var FREE = 1;
var BUSY = 0;

$(document).ready(function() {
    $('.timePicker').datetimepicker({
        dateFormat: "yy-mm-dd",
        timeFormat: "hh:mm:ss.lz",
        useLocalTimezone: true,
        timezoneIso8601: true,
        separator: "T",
        stepMinute: 15,
        showTimezone: true,
    });
    
    $('#form').submit(function(event) {
        event.preventDefault();
        var studentArray = parse();
        getFreeBusy(studentArray);

    });
});

function Person() {
    this.fname;
    this.lname;
    this.calId;
    this.times;
}

function Interviewer() {
    Person.call(this);
    this.start;
    this.end;
    this.interviewDuration;
}

// Takes in 2 strings for start and end of this time block
function TimeBlock(startS, endS) {
    this.free_times = []; // Array with elem i representing start + i*15(mins)
    this.start = strToDate(startS).roundDown15();
    this.end = strToDate(endS).roundUp15();
    
    for(var i=this.start.clone(); i.isBefore(this.end); i.addMinutes(15)) {
        this.free_times.push(FREE);
    }
    
    this.markBlocks = function(block, duration, markAs) {
        var blockIndex = getNumBlocks(this.start, block); // Get time difference in 15 min blocks
        var blocksToCheck = (duration / 15 + (duration % 15 > 0 ? 1 : 0)); // Round up duration to 15 min blocks
        for(var i = 0; i < blocksToCheck; i++) {
            this.free_times[i + blockIndex] = markAs;
        }
    }
}
                      
function parse() {
    var arr = {};
    
    var interviewer = new Interviewer();
    interviewer.fname = $('.interviewerFieldset > .fname').val();
    interviewer.lname = $('.interviewerFieldset > .lname').val();
    interviewer.start = $('#timeMin').val();
    interviewer.end = $('#timeMax').val();
    interviewer.calId = $('.interviewerFieldset > .calId').val();
    
    arr[interviewer.calId] = interviewer;
    
    $('.studentFieldset').each(function() {
        var s = new Person();
        s.fname = $(this).children('.fname').val();
        s.lname = $(this).children('.lname').val();
        s.calId = $(this).children('.calId').val();
        arr[s.calId] = s; // Key off calendar ID for easy retrieval
    });
    return arr;
}

function getNumBlocks(start, end) {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 15);
}

function getMinsDiff(start, end) {
    return (end.getTime() - start.getTime()) / (1000 * 60);
}

/*[
                    {
                        'id': 'r5p25tev3v42r11u242u959ev8@group.calendar.google.com'
                    },{
                        'id': 'cq6omn9kt4uld6agu4dhevucm0@group.calendar.google.com'
                    }
                ]*/
function getFreeBusy(studentArray) {
    var items = [];

    for(var id in studentArray) {
        items.push({'id': studentArray[id].calId});
    }
    
    gapi.client.setApiKey(keys[user]['api']);
    //get result from form, for every group, create new Student Object with fname, lname, cal_id, 
    //clone available times into free field, and empty array for busy and also within same loop
    //create an array of items that holds calid and also push new student objects into student array
    var data = { 
        'items': items,
        'timeMin': $('#timeMin').val(),
        'timeMax': $('#timeMax').val(),
    };
                
    gapi.client.load('calendar', 'v3', function(callback) {
        var query = gapi.client.calendar.freebusy.query(data);
        query.execute(function(resp) {
            for(var calId in resp.calendars) {
                var busyTimes = resp.calendars[calId].busy;
                var tb = new TimeBlock(data.timeMin, data.timeMax);
                for(b in busyTimes) {
                    var currStart = strToDate(busyTimes[b].start).roundDown15();
                    var currEnd = strToDate(busyTimes[b].end).roundUp15();
                    
                    var duration = getMinsDiff(currStart, currEnd);
                    tb.markBlocks(currStart, duration, BUSY);
                }
                studentArray[calId].times = tb;
            }
        });
    });
    
    console.log(studentArray);
}
 
function strToDate(s) {
    var d = new Date();
    d.setISO8601(s);
    return d;
}

/*************************************other stuff**********************************/
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

