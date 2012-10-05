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

/*
interviewer: jonpm7ca6n94f79gd2cru11u9g@group.calendar.google.com
start: 2012-10-01T09:00:00.000-04:00
end: 2012-10-05T17:00:00.000-04:00

tanay: ddc46lerctese0eptdup32vilg@group.calendar.google.com
jocelyn: r5p25tev3v42r11u242u959ev8@group.calendar.google.com
narasimhan.priya@gmail.com
*/

var FREE = 1;
var BUSY = 0;

var cl;

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
    
    $("#accordion").accordion({ autoHeight: false, collapsible : true});
    
    $("#addCandidate").click(function(event) {
        event.preventDefault();
        var active = $('#accordion').accordion('option', 'active');
        $('#accordion').append('<h3><a href="#">Candidate</a></h3><div><fieldset class="studentFieldset"><label for="fname">First Name: </label><input type="text" name="fname" class="fname" placeholder="First Name" required /><label for="lname">Last Name: </label><input type="text" name="lname" class="lname" placeholder="Last Name" required /><label for="calId">Calendar ID: </label><input type="text" name="calId" class="calId" placeholder="Google Calendar ID" required /></fieldset><div class="floatright"><button class="delete" type="button">Remove</button></div></div>')
            .accordion('destroy').accordion({ autoHeight: false, collapsible: true, active: $('.studentFieldset').size()});
    });
    
    // Use live() so dynamically added nodes get the listener too
    $(".delete", $("#accordion")[0]).live('click', function(event) {
        event.preventDefault();
        var currDiv = $(this).parent().parent();
        currDiv.prev().remove();
        currDiv.remove();  
    });
    
    $('#form').submit(function(event) {
        event.preventDefault();
        $("#calContent").html('');
        cl = new CanvasLoader('calContent');
        cl.setShape('spiral'); // default is 'oval'
        cl.show(); // Hidden by default
        init();
    });
});

function getIntId(info) {
    for(var id in info) {
        if(info[id] instanceof Interviewer) {
            return id;
        }
    }
}

function trimSched(info, intId) {
    for(var id in info) {
        if(id === intId) {
            trimInterviewer(info, intId);
        }
        else {
            trimPerson(info, id, intId);
        }
    }
}

function trimInterviewer(info, id) {
    /*for(int i in info[id].times.freeTimes) {
        
    }*/
}

function trimPerson(info, id, intId) {
    for(var i=0; i<info[id].times.freeTimes.length; i++) {
        info[id].times.freeTimes[i] &= info[intId].times.freeTimes[i]
    }
}

function Person() {
    this.fname;
    this.lname;
    this.calId;
    this.times;
}


function Slot() {
    this.location;
    this.description;
    this.start;
    this.end;
    this.summary;
}

function Interviewer() {
    Person.call(this);
    this.start;
    this.end;
    this.interviewDuration;
}


// Takes in 2 strings for start and end of this time block
function TimeBlock(startS, endS) {
    this.freeTimes = []; // Array with elem i representing start + i*15(mins)
    this.start = strToDate(startS).roundDown15();
    this.end = strToDate(endS).roundUp15();
    
    for(var i=this.start.clone(); i.isBefore(this.end); i.addMinutes(15)) {
        this.freeTimes.push(FREE);
    }
    
    this.markBlocks = function(block, duration, markAs) {
        var blockIndex = getNumBlocks(this.start, block); // Get time difference in 15 min blocks
        var blocksToCheck = (duration / 15 + (duration % 15 > 0 ? 1 : 0)); // Round up duration to 15 min blocks
        for(var i = 0; i < blocksToCheck; i++) {
            this.freeTimes[i + blockIndex] = markAs;
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
    interviewer.interviewDuration = parseInt($('#intDuration').val());

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
function getFreeBusy(peopleInfo) {
    var items = [];

    for(var id in peopleInfo) {
        items.push({'id': peopleInfo[id].calId});
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
                peopleInfo[calId].times = tb;
            }
            // Raw data has been pulled
            
            // Clean up data for optimization
            var interviewerId = getIntId(peopleInfo);
            trimSched(peopleInfo, interviewerId);
            
            var masterSched = peopleInfo[interviewerId].times.freeTimes;
            var otherScheds = []
            
            for(var calId in peopleInfo) {
                if(calId === interviewerId) {
                    continue;
                }
                
                otherScheds.push({id: calId, times: peopleInfo[calId].times.freeTimes});
            }
            
            // Perform algo
            findMatching(masterSched, otherScheds, peopleInfo[interviewerId].interviewDuration);
            var output = {};
            
            for(var slot in masterSched) {
                // Double check for string as per http://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string
                if(typeof masterSched[slot] == 'string' || masterSched[slot] instanceof String) {
                    if(!(masterSched[slot] in output)) {
                        output[masterSched[slot]] = peopleInfo[interviewerId].times.start.clone().addMinutes(slot * 15);
                    }
                }
            }
            
            // Final output keyed on calId -> start datetime of interview
            //console.log(output);
            addInterview(peopleInfo, output);
            
        });
    });
}

//Add Events to Calendar
function addInterview(peopleInfo, output) {
    gapi.client.setApiKey(keys[user]['api']);
    var interviewerId = getIntId(peopleInfo);
    for(i in output) {
        var slot = new Slot();
        slot.summary = "Interview";
        slot.location = $('.interviewerFieldset > .loc').val();;
        slot.description = "Interview for: " + peopleInfo[i].fname + " " + peopleInfo[i].lname;
        slot.start = {'dateTime': output[i]};
        slot.end = {'dateTime': output[i].clone().addMinutes(peopleInfo[interviewerId].interviewDuration*15)};
        addEvent(slot, peopleInfo[interviewerId].calId);       
    }
    
    cl.hide();
    $("#calContent").html('');
    $("#calContent").append('<iframe id="calFrame" src="https://www.google.com/calendar/embed?src=' + encodeURIComponent(peopleInfo[interviewerId].calId) + '" style="border: 0" width="700" height="800" frameborder="0" scrolling="no"></iframe>');
}

function addEvent(slot, calId) {
    gapi.client.load('calendar', 'v3', function() {
        var req = gapi.client.calendar.events.insert({
        'calendarId': calId,
        'resource': slot});
        req.execute(function(resp) {
            console.log(resp);           
        });
    });
}

function findMatching(master, other, dur) {
    if(other.length == 0) {
        return true;
    }
    
    var currEntry = other.pop();
    var currId = currEntry.id;
    var curr = currEntry.times;
    
    for(var i=0; i<curr.length; i++) {
        if(hasFreeBlock(master, i, dur) && hasFreeBlock(curr, i, dur)) {
            for(var d=0; d<dur; d++) {
                master[d+i] = currId;
            }
            
            if(findMatching(master, other, dur)) {
                return true;
            }
            else {
                // undo mutations
                for(var d=0; d<dur; d++) {
                    master[d+i] = FREE;
                }
            }
        }
    }
    
    other.push(currEntry);
    return false;
}

function hasFreeBlock(sched, ind, dur) {
    for(var i=0; i<dur; i++) {
        if(sched[i+ind] !== FREE) {
            return false;
        }
    }
    return true;
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
        gapi.auth.authorize(config, function() {
            console.log('login complete');
            console.log(gapi.auth.getToken());
            var peopleInfo = parse();
            getFreeBusy(peopleInfo);
        }); 
    }, 1); 
} 
