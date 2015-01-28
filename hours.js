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

// creates a slot where one could work
function Slot(date, start, stop) {
    this.date = date;
    this.start = start;
    this.stop = stop;
    this.empty = function () { return this.start == this.stop; }
    this.duration = function () { return this.stop - this.start; }
}

// check if a date is a workday
function isWorkday(date) {
    var dn = date.day();
    return dn < 6 && dn > 0;
}

// split an amount of hours per month into chunks
function getHours(amount, maxAtOnce) {
    var result = [];
    var tmp;
    while (amount > 0) {
        if (amount <= maxAtOnce) {
            result.push(amount);
            break;
        } else {
            tmp = getRandomInt(1, maxAtOnce);
            result.push(tmp);
            amount -= tmp;
        }
    }
    return result;
}

// get all time slots for a month
function getAllSlots(date) {
    var tm = moment(date);
    var result = [];
    // while still in current month
    while (date.month() == tm.month()) {
        var pt = moment(tm);
        if (isWorkday(pt)) {
            // one can work from 9 to 18
            result.push(new Slot(pt, 9, 18));
        } else {
            // on weekends the slot is empty
            result.push(new Slot(pt, 0, 0));
        }
        tm.add(1, 'days');
    }
    return result;
}

// randomly assigns a number of hours to a time slot
function assignToSlot(slot, hours) {
    var lps = slot.stop - hours;
    var rs = getRandomInt(slot.start, lps);
    var ns = new Slot(slot.date, rs, rs + hours);
    return ns;
}

// randomly creates the amount hours and assigns them to days
function assignHours(date, amount) {
    var hs = getHours(amount, 5);
    var slots = shuffle(getAllSlots(date));
    var result = [];
    var hcounter = 0;
    for (i = 0; i < slots.length; i++) {
        if (hcounter < hs.length && !slots[i].empty()) {
            result.push(assignToSlot(slots[i],hs[hcounter]));
            hcounter++;
        } else {
            // push empty slot
            result.push(new Slot(slots[i].date, 0, 0));
        }
    }
    // sort the slots back into right order
    result.sort(function(x, y){
        return x.date - y.date;
    });
    return result;
}

// creates the time sheet as html table
function createTable(date, amount) {
    var result = assignHours(date, amount);

    var table = $('<table></table>');
    table.append('<th>Tag</th><th>Von - Bis</th><th>Dauer</th>');
    for(i = 0; i < result.length; i++){
        var row = $('<tr>');
        row.append('<td>'+result[i].date.format('ddd DD.MM.YYYY')+'</td>');
        if (result[i].empty()) {
            row.append('<td></td><td></td>');
        } else {
            row.append('<td>'+result[i].start+':00 - '+result[i].stop+':00</td>');
            row.append('<td>'+result[i].duration()+'h'+'</td>');
        }
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
