/*
 ** ----------------------------------------------------------------------------
 ** "THE BEER-WARE LICENSE" (Revision 42):
 ** <lyzrd17@gmail.com> wrote this file. As long as you retain this notice you
 ** can do whatever you want with this stuff. If we meet some day, and you think
 ** this stuff is worth it, you can buy me a beer in return. Jochen Goertler 
 ** ----------------------------------------------------------------------------
 **/

// get a random integer in the range [min, max]
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// shuffles an array
function shuffle(array) {
    var counter = array.length;
    var temp, index;
    while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

// creates an interval of dates
function Interval(start, stop) {
    this.start = start;
    this.stop = stop;
}

// check if a date is a workday
function isWorkday(date) {
    var dn = date.day();
    return dn < 6 && dn > 0;
} 

// given a set amount of hours per month
function getHours(amount) {
    var result = [];
    var tmp;
    while (amount > 0) {
        if (amount <= 4) {
            result.push(amount);
            break;
        } else {
            tmp = getRandomInt(1, 4);
            result.push(tmp);
            amount -= tmp;
        }
    }
    return result;
}

function intervalToString(interval) {
    return interval.start.format() + " - " + interval.stop.format();
}

// get all time slots, where one could go to work
function getAllSlots(date) {
    var d = date.set({'date':1});
    var m = date.get('month');
    var y = date.get('year');
    var result = [];
    while (d.month() == m) {
        if (isWorkday(d)) {
            var ms = moment(new Date(y, m, d.date(), 8 )); 
            var me = moment(new Date(y, m, d.date(), 12)); 
            var as = moment(new Date(y, m, d.date(), 13)); 
            var ae = moment(new Date(y, m, d.date(), 18));
            var morning = new Interval(ms,  me);
            var afternoon = new Interval(as, ae); 
            result.push(morning);
            result.push(afternoon);
        }
        d.add(1, 'days');
    }
    return result;
}

// randomly assigns a number of hours to a time slot
function assignToSlot(interval, hours) {
    var lps = interval.stop.hour() - hours;
    var rand_start = getRandomInt(interval.start.get('hour'), lps);
    interval.start.set('hour', rand_start);
    interval.stop.set('hour', rand_start + hours);
    return interval;
}

function createHours(date, amount) {
    var hs = getHours(amount);
    var slots = shuffle(getAllSlots(date));
    var result = [];
    for (i = 0; i < hs.length; i++) {
            result.push(assignToSlot(slots[i],hs[i]));
    }
    // sort the intervals back into right order 
    result.sort(function(x, y){ 
        return x.start - y.start;
    });
    return result;
}

function createTable(date, amount) {
    var result = createHours(date, amount);
     
    var table = $('<table></table>');
    table.append('<th>Von</th><th>Bis</th><th>Dauer</th>');
    for(i = 0; i < result.length; i++){
        var dur = result[i].stop.hour() - result[i].start.hour();
        var row = $('<tr>');
        row.append('<td>'+result[i].start.format('ddd DD.MM. H:mm')+'</td>');
        row.append('<td>'+result[i].stop.format('ddd DD.MM. H:mm')+'</td>');
        row.append('<td>'+dur+'h'+'</td>');
        table.append(row);
    }
    return table;
}


// execute when document is ready
$(document).ready(function() {
    
    moment.locale('en', {
        months : ["Januar", "Feburuar", "M\u00e4rz", "April",
                  "Mai", "Juni", "Juli", "August",
                  "September", "Oktober", "November", "Dezember"],
        weekdaysShort : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] });

    // create year chooser
    var ysel = $('<select>').attr('id','year');
    var now = moment().year();
    for (i = now-3; i < now+3; i++) {
         ysel.append($("<option>").attr('value',i).text(i));
    }
    $('#chooser').prepend(ysel);

    // create month dropdown
    var msel = $('<select>').attr('id','month');
    var ms = moment.months();
    for (i = 0; i < ms.length; i++) {
         msel.append($("<option>").attr('value',ms[i]).text(ms[i]));
    }
    $('#chooser').prepend(msel);

    $( "#chooser" ).submit(function( event ) {
        var m = $( "#month" ).val(); 
        var y = $( "#year" ).val();
        var d = moment().set({'year':y, 'month':m, 'date':1});
        $('#header').text(m + ' ' + y);
        $('#hours').empty();
        $('#hours').append(createTable(d, 30));
        event.preventDefault();
    });
}); 
