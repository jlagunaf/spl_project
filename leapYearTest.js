var leapYear = require('leap-year');

var now = new Date("08-01-2000");

var fullYear = '2000';

console.log(leapYear(fullYear));

var check = new Date("04-30-2000");
var from = new Date("03-01-2000");
var to = new Date("05-31-2000");


console.log(isDateBetween(check, from, to));


