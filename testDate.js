

function getMonday( date ) {
    var day = date.getDay() || 7;  
    if( day !== 1 ) 
        date.setHours(-24 * (day - 1)); 
    return date;
}

console.log(getMonday(new Date()));

var dateFormat = require('dateformat');
var currentWeekNumber = require('current-week-number');

console.log(dateFormat(getMonday(new Date()), "mm/dd/yyyy"))

//dateFormat(new Date(), "mm/dd/yyyy")

var decDate = getDecomposedDate(new Date("01/02/2017"));

console.log(decDate);

//Decompose checkout date
function getDecomposedDate(rawDate) {
    var date = new Date(rawDate);

    let dayOfWeek = date.getDay();
    if (dayOfWeek == 0) {
        dayOfWeek = 7;
    }
    let weekInYear = currentWeekNumber(date);
    let month = date.getMonth();
    let epochTime = date.getTime();

    return { 'dayOfWeek': dayOfWeek, 'weekInYear': weekInYear, 'month': month, 'epochTime': epochTime };
}