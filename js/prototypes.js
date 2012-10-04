// http://cbas.pandion.im/2009/10/javascript-parser-for-rfc-3339-or-iso.html
Date.prototype.setISO8601 = function (timestamp) {
 var match = timestamp.match(
  "^([-+]?)(\\d{4,})(?:-?(\\d{2})(?:-?(\\d{2})" +
  "(?:[Tt ](\\d{2})(?::?(\\d{2})(?::?(\\d{2})(?:\\.(\\d{1,3})(?:\\d+)?)?)?)?" +
  "(?:[Zz]|(?:([-+])(\\d{2})(?::?(\\d{2}))?)?)?)?)?)?$");
 if (match) {
  for (var ints = [2, 3, 4, 5, 6, 7, 8, 10, 11], i = ints.length - 1; i >= 0; --i)
   match[ints[i]] = (typeof match[ints[i]] != "undefined"
    && match[ints[i]].length > 0) ? parseInt(match[ints[i]], 10) : 0;
  if (match[1] == '-') // BC/AD
   match[2] *= -1;
  var ms = Date.UTC(
   match[2], // Y
   match[3] - 1, // M
   match[4], // D
   match[5], // h
   match[6], // m
   match[7], // s
   match[8] // ms
  );
  if (typeof match[9] != "undefined" && match[9].length > 0) // offset
   ms += (match[9] == '+' ? -1 : 1) *
    (match[10]*3600*1000 + match[11]*60*1000); // oh om
  if (match[2] >= 0 && match[2] <= 99) // 1-99 AD
   ms -= 59958144000000;
  this.setTime(ms);
  return this;
 }
 else
  return null;
}

Date.prototype.clearSeconds = function() {
    this.set({second: 0, millisecond: 0});
    return this;
}

Date.prototype.roundDown15 = function() {
    var mins = this.getMinutes();
    var newMins = 0;
    if(mins < 15) {
        newMins = 0;
    }
    else if(mins < 30) {
        newMins = 15;
    }
    else if(mins < 45) {
        newMins = 30;
    }
    else if(mins < 60) {
        newMins = 45;
    }
    this.set({minutes: newMins});
    return this;
}

Date.prototype.roundUp15 = function() {
    var mins = this.getMinutes();
    var newMins = 0;
    if(mins < 15) {
        newMins = 15;
    }
    else if(mins < 30) {
        newMins = 30;
    }
    else if(mins < 45) {
        newMins = 45;
    }
    else if(mins < 60) {
        newMins = 0;
        this.addHours(1);
    }
    this.set({minutes: newMins});
    return this;
}