/**
 * ScheduleMatch
 * 15-237 F12
 * HW4
 * Tanay Gavankar (tgavanka)
 * Jocelyn Kong (jocelynk)
 * Sid Soundararajan (ssoundar)
*/
/**
 * Google API Key
 */
var user = 'main';

var keys = {
    'main': {
        'client': '41915610334.apps.googleusercontent.com',
        'api': 'AIzaSyCJB-CTN9Lq925VkvX3awxOMEuNi6OvieA',
    }
};

/**
 * Constants
 */
var FREE = 1;
var BUSY = 0;

/**
 * Canvas "loading" object
 */
var cl;

$(document).ready(function() {
    // Setup for FAQs handlers.
    $('.question').next().hide();
    var i = 0;
    $('.question').each(function() {
         $(this).click(function() { 
             $('.question:eq('+$(this).data('idf')+')').next().slideToggle('slow');
         });
         $(this).data('idf',i);
         i++;
    });
    
    // Datetime picker for start/end times
    $('.timePicker').datetimepicker({
        dateFormat: "yy-mm-dd",
        timeFormat: "hh:mm:ss.lz",
        useLocalTimezone: true,
        timezoneIso8601: true,
        separator: "T",
        stepMinute: 15,
        showTimezone: true,
    });
    
    // Accordian for user input
    $("#accordion").accordion({ autoHeight: false, collapsible : true});
    
    // Handler to add new candidate
    $("#addCandidate").click(function(event) {
        event.preventDefault();
        var active = $('#accordion').accordion('option', 'active'); // Get current open
        // Delete and recreate accordian with new fold.
        $('#accordion').append('<h3><a href="#">Candidate</a></h3><div class="infobox"><fieldset class="studentFieldset"><label for="fname">First Name: </label><input type="text" name="fname" class="fname" placeholder="First Name" oninvalid="$(this).trigger(\'custom_invalid\');return false" required /><label for="lname">Last Name: </label><input type="text" name="lname" class="lname" placeholder="Last Name" oninvalid="$(this).trigger(\'custom_invalid\');return false" required /><label for="calId">Calendar ID: </label><input type="text" name="calId" class="calId" placeholder="Google Calendar ID" oninvalid="$(this).trigger(\'custom_invalid\');return false" required /></fieldset><div class="floatright"><button class="delete" type="button">Remove</button></div></div>')
            .accordion('destroy').accordion({ autoHeight: false, collapsible: true, active: $('.studentFieldset').size()});
    });

    
    // Handler to remove existing candidates
    // Use live() so dynamically added nodes get the listener too
    $(".delete", $("#accordion")[0]).live('click', function(event) {
        event.preventDefault();
        var currDiv = $(this).parent().parent();
        currDiv.prev().remove();
        currDiv.remove();  
    });
    
    // Workaround for setCustomValidity not firing form submission events if set
    $('#timeMin').change(function() {
        document.getElementById('timeMin').setCustomValidity("");
    });
    
    // Invalid HTML5 event doesn't bubble up, so bind to it and fire custom event
    $('.calId,.fname,.lname').bind('invalid', function(e) {
        $(this).trigger('custom_invalid');
    });
    
    // Use live() (needs event bubbling) on custom event to handle invalid
    // Use debounce plugin to only take first event
    $('.infobox').live('custom_invalid', $.debounce(2000, true, function(e) {
        if($(this).index('div.infobox') !== $('#accordion').accordion('option', 'active')) {
            $('#accordion').accordion('activate', $(this).index('div.infobox'));
        }
    }));

    // Form submit
    $('#form').submit(function(event) {
        event.preventDefault();
        if(validateDate() > -1) {
            document.getElementById('timeMin').setCustomValidity("Please enter a Start Date before End Date");
        } else {
            document.getElementById('timeMin').setCustomValidity("");
            $("#calContent").html('');
            // Draw canvas loading icon
            cl = new CanvasLoader('calContent');
            cl.setShape('spiral'); // default is 'oval'
            cl.show(); // Hidden by default
            init();
        }
     
    });

});

/**
 * Returns calId of interviewer's calendar
 */
function getIntId(info) {
    for(var id in info) {
        if(info[id] instanceof Interviewer) {
            return id;
        }
    }
}

/**
 * Validates that the end date comes after start date.
 */
function validateDate() {
    var date1 = strToDate($('#timeMin').val());
    var date2 = strToDate($('#timeMax').val());
    return Date.compare(date1, date2);
     
}

/**
 * Combine each candidate and interviewer's calendars via AND.
 */
function trimSched(info, intId) {
    for(var id in info) {
        if(id !== intId) {
            trimPerson(info, id, intId);
        }
    }
}

/**
 * Perform AND on two time block arrays.
 */
function trimPerson(info, id, intId) {
    for(var i=0; i<info[id].times.freeTimes.length; i++) {
        info[id].times.freeTimes[i] &= info[intId].times.freeTimes[i]
    }
}

/**
 * Person object
 */
function Person() {
    this.fname;
    this.lname;
    this.calId;
    this.times;
}

/**
 * Interviewer object, inherits from Person
 */
function Interviewer() {
    Person.call(this);
    this.start;
    this.end;
    this.interviewDuration;
}

/**
 * Slot object
 */
function Slot() {
    this.location;
    this.description;
    this.start;
    this.end;
    this.summary;
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

function getFreeBusy(peopleInfo) {
    var items = [];

    for(var id in peopleInfo) {
        items.push({'id': peopleInfo[id].calId});
    }

    gapi.client.setApiKey(keys[user]['api']);

    var data = { 
        'items': items,
        'timeMin': $('#timeMin').val(),
        'timeMax': $('#timeMax').val(),
    };
               
    gapi.client.load('calendar', 'v3', function(callback) {
        var query = gapi.client.calendar.freebusy.query(data);
        query.execute(function(resp) {
            if(typeof resp.calendars[items[0].id].busy === 'undefined') {
                 $("#calContent").html('The calendars you entered were not valid.');
            } else {
                for(var i in items) {
                    var tb = new TimeBlock(data.timeMin, data.timeMax);
                    peopleInfo[items[i].id].times = tb;
                }
            
                for(var calId in resp.calendars) {
                    var busyTimes = resp.calendars[calId].busy;
                    var tb = peopleInfo[calId].times;
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
                var otherScheds = [];
                
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
                addInterview(peopleInfo, output);
            }
        });
    });
}

//Add Events to Calendar
function addInterview(peopleInfo, output) {
    gapi.client.setApiKey(keys[user]['api']);
    var interviewerId = getIntId(peopleInfo);
    
    var requestCallback = new MyRequestsCompleted({
        numRequest: Object.keys(output).length,
        singleCallback: function(){
            cl.hide();
            $("#calContent").html('');
            $("#calContent").append('<iframe id="calFrame" src="https://www.google.com/calendar/embed?src=' + encodeURIComponent(peopleInfo[interviewerId].calId) + '" style="border: 0" width="700" height="800" frameborder="0" scrolling="no"></iframe>');
        }
    });
    
    for(i in output) {
        var slot = new Slot();
        slot.summary = "Interview";
        slot.location = $('.interviewerFieldset > .loc').val();;
        slot.description = "Interview for: " + peopleInfo[i].fname + " " + peopleInfo[i].lname;
        slot.start = {'dateTime': output[i]};
        slot.end = {'dateTime': output[i].clone().addMinutes(peopleInfo[interviewerId].interviewDuration*15)};
        addEvent(slot, peopleInfo[interviewerId].calId, function(data) { requestCallback.requestComplete(true); });       
    }   
}

function addEvent(slot, calId, callback) {
    gapi.client.load('calendar', 'v3', function() {
        var req = gapi.client.calendar.events.insert({
            'calendarId': calId,
            'resource': slot});
        req.execute(callback);
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


// Source: http://stackoverflow.com/questions/4368946/javascript-callback-for-multiple-ajax-calls
var MyRequestsCompleted = (function() {
    var numRequestToComplete, requestsCompleted, callBacks, singleCallBack;

    return function(options) {
        if (!options) options = {};

        numRequestToComplete = options.numRequest || 0;
        requestsCompleted = options.requestsCompleted || 0;
        callBacks = [];
        var fireCallbacks = function() {
            for (var i = 0; i < callBacks.length; i++) callBacks[i]();
        };
        if (options.singleCallback) callBacks.push(options.singleCallback);

        this.addCallbackToQueue = function(isComplete, callback) {
            if (isComplete) requestsCompleted++;
            if (callback) callBacks.push(callback);
            if (requestsCompleted == numRequestToComplete) fireCallbacks();
        };
        this.requestComplete = function(isComplete) {
            if (isComplete) requestsCompleted++;
            if (requestsCompleted == numRequestToComplete) fireCallbacks();
        };
        this.setCallback = function(callback) {
            callBacks.push(callBack);
        };
    };
})();

function init() { 
    gapi.auth.init(function() {
        var config = {
            'client_id': keys[user]['client'],
            'scope': 'https://www.googleapis.com/auth/calendar',
            'response_type': 'token'
        };
        gapi.auth.authorize(config, function() {
            var peopleInfo = parse();
            getFreeBusy(peopleInfo);
        }); 
    }); 
} 
