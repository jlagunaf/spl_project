
var express = require('express');
var app = express();

var currentWeekNumber = require('current-week-number');
var fileSystem = require("fs")
var https = require('https');
var sleep = require('system-sleep');
var json2csv = require('json2csv');



/////////////Request 1 year of data/////////////

//Actual number of rows per year (From Spring-March to Winter-February)
const numRows_2007 = 7333367;

//const numRows_2007 = 2000000;

const numRows_2008 = 8581547;
const numRows_2009 = 8953760;
const numRows_2010 = 8345270;
const numRows_2011 = 7537308;
const numRows_2012 = 7503838;
const numRows_2013 = 7785139;
const numRows_2014 = 7332690;
const numRows_2015 = 6823418;
const numRows_2016 = 6304827;
const numRows_2017 = 4730353;

//const numRows_2016 = 200000;
//const numRows_2017_January = 533558;


//                  0           1                  2                3               4       5           6               7           8         9      
//var fields = ['bibnumber', 'callnumber', 'checkoutdatetime', 'checkoutyear', 'collection', 'id', 'itembarcode', 'itemtitle', 'itemtype', 'subjects'];

//Without  id, checkoutdatetime and subjects
//var fields = ['bibnumber', 'callnumber', 'checkoutyear', 'collection', 'itembarcode', 'itemtitle', 'itemtype', 'dayOfWeek'];

var maxNumRowsPerYear = {
    2007: numRows_2007, 2008: numRows_2008, 2009: numRows_2009, 2010: numRows_2010,
    2011: numRows_2011, 2012: numRows_2012, 2013: numRows_2013, 2014: numRows_2014, 2015: numRows_2015,
    2016: numRows_2016, 2017: numRows_2017
};

var dateFormat = require('dateformat');
var mapDataPerSeason = {};
var seasonObject = {};


//Request data to SPL API, Checkouts per week
app.get('/sl/t2', function (req, response) {

    response.send("Generating files for # checkouts per season!");

    //Starting index of requested rows
    let offset = 0;
    //Max Number of rows to be requested at a time
    let limit = 80000;

    //for (var yearOfData in maxNumRowsPerYear) {
        var yearOfData = 2017;
        let maxNumOfRows = maxNumRowsPerYear[yearOfData];
        console.log('maxNumOfRows for (' + yearOfData + ') are (' + maxNumOfRows + ')');

        //Create csv file for current year

        var fileName = "BookCheckoutsPerMonth_" + yearOfData + ".csv"

        //Spring: March 1 to May 31
        //let springFrom = new Date('03-01-' + yearOfData);

        const springFrom = new Date(yearOfData + '-03-01T00:00:00');
        const springTo = new Date(yearOfData + '-05-31T23:59:59');
        //Summer: June 1 to August 31
        const summerFrom = new Date(yearOfData + '-06-01T00:00:00');
        const summerTo = new Date(yearOfData + '-08-31T23:59:59');
        //Fall: September 1 to November 30
        const fallFrom = new Date(yearOfData + '-09-01T00:00:00');
        const fallTo = new Date(yearOfData + '-11-30T23:59:59');

        //Winter: December 1 to February 28/29
        const winterFrom = new Date(yearOfData + '-12-01T00:00:00');
        const nextYearOfDataNumeric = Number(yearOfData) + 1;
        let winterTo = new Date(nextYearOfDataNumeric + '-02-28T23:59:59');

        //Check if year is leap
        var leapYear = require('leap-year');

        if (leapYear(nextYearOfDataNumeric)) {
            winterTo = new Date(nextYearOfDataNumeric + '-02-29T23:59:59');
        }

        if (yearOfData === '2017') {
            winterTo = new Date(yearOfData + '-11-30T23:59:59');
        }

        //Seasons' dates
        seasonObject.springFrom = springFrom;
        seasonObject.springTo = springTo;
        seasonObject.summerFrom = summerFrom;
        seasonObject.summerTo = summerTo;
        seasonObject.fallFrom = fallFrom;
        seasonObject.fallTo = fallTo;
        seasonObject.winterFrom = winterFrom;
        seasonObject.winterTo = winterTo;


        //let dateFrom = dateFormat(springFrom, "yyyy-mm-ddThh:MM:ss").replace('A', 'T').replace('T12', 'T00');
        //let dateTo = dateFormat(winterTo, "yyyy-mm-ddThh:MM:ss").replace('A', 'T').replace('T12', 'T23').replace(':00', ':59').replace(':00', ':59');

        //console.log(seasonObject.springFrom.toISOString());

        let dateFrom = springFrom.toISOString().replace('.000Z', '');
        let dateTo = winterTo.toISOString().replace('.000Z', '');

        var doNextRequest = false;
        writeFlag('0');

        console.log('Creating file (' + fileName + ')');

        let numPulls = Math.ceil(maxNumOfRows / limit);
        console.log('NumPulls(' + numPulls + ')');

        let isFirstSegment = true;

        //Array to store data per week

        for (var numPullsCount = 0; numPullsCount < numPulls; numPullsCount++) {

            //for (var numPullsCount = 0; numPullsCount < 2; numPullsCount++) {

            if (numPullsCount == numPulls - 1) {
                console.log('Final');
            }

            console.log("NumPull(" + numPullsCount + ') Offset(' + offset + ') Limit(' + limit + ') FromDate (' + dateFrom + ') ToDate (' + dateTo + ')');
            pullDataAndProceesIt(dateFrom, dateTo, limit, offset, fileName, isFirstSegment, numPullsCount);

            isFirstSegment = false;
            offset += limit;


            while (!doNextRequest) {
                sleep(1000);
                let flag = readFlag();
                if (flag === '1') {
                    doNextRequest = true;
                    writeFlag('0');
                } else if (flag === '2') {//End of data
                    break;
                }
                //console.log('...');
            }

            if (readFlag() === '2') {
                console.log("No more data!");
                break;
            }

            doNextRequest = false;
        }

        //Write map to disk
        writeMapToCsvFile(mapDataPerSeason);

        mapDataPerSeason = {};
        offset = 0;

        console.log('End of ' + yearOfData + ' generation!');

   // }



});


function pullDataAndProceesIt(fromDate, toDate, limit, offset, fileName, isFirstSegment, numPullsCount) {
    //console.log('isFirstSegment(' + isFirstSegment + ') numPullsCount(' + numPullsCount + ')')

    let path = "/resource/5src-czff.json?$where=checkoutdatetime%20between%20'" + fromDate + "'%20and%20'" + toDate + "'%20and%20itemtype%20like%20'%25bk%25'&$limit=" + limit + '&$offset=' + offset + '&$order=checkoutdatetime&$$app_token=YLBaOvoTUKa2x5BoyYi4hPwWC';
    let path2 = "/resource/5src-czff.json?$where=checkoutdatetime between '" + fromDate + "' and '" + toDate + "' and itemtype like '%25bk%25'&$limit=" + limit + '&$offset=' + offset + '&$$app_token=YLBaOvoTUKa2x5BoyYi4hPwWC';
    // Lets make an http.request to Seattle Library
    // For different format change extension .json to .csv, ...
    var options = {
        host: 'data.seattle.gov',
        path: path,
        method: 'GET',
        headers: {
            'X-App-Token': 'YLBaOvoTUKa2x5BoyYi4hPwWC'
        }
    };

    https.get(options, res => {
        res.setEncoding("utf8");
        var body = "";

        res.on("data", data => {
            body += data;
            //console.log("Data");
        });

        res.on("end", () => {

            //console.log(body.substr(body.length - 10, body.length));
            if (body.indexOf('[]') >= 0) {
                writeFlag('2');
            }

            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error(e); // error in the above string (in this case, yes)!
            }

            //console.log('OK');

            for (var row in body) {

                //If title is blank - remove row
                //if (body[row].itemtitle == 'undefined' || !body[row].itemtitle || !body[row].itemtype.includes('bk')) {
                if (body[row].itemtitle == 'undefined' || !body[row].itemtitle) {
                    delete body[row];
                    continue;
                }

                // console.log('OK2');

                var checkDate = new Date(body[row].checkoutdatetime);

                const fullYear = checkDate.getFullYear();

                let seasonKey = '';
                let firstDayOfSeason;
                let lastDayOfSeason;

                if (isDateBetween(checkDate, seasonObject.springFrom, seasonObject.springTo)) {
                    seasonKey = 'Spring';
                    firstDayOfSeason = seasonObject.springFrom;
                    lastDayOfSeason = seasonObject.springTo;
                } else if (isDateBetween(checkDate, seasonObject.summerFrom, seasonObject.summerTo)) {
                    //console.log('Summer');
                    seasonKey = 'Summer';
                    firstDayOfSeason = seasonObject.summerFrom;
                    lastDayOfSeason = seasonObject.summerTo;
                } else if (isDateBetween(checkDate, seasonObject.fallFrom, seasonObject.fallTo)) {
                    //console.log('Fall');
                    seasonKey = "Fall";
                    firstDayOfSeason = seasonObject.fallFrom;
                    lastDayOfSeason = seasonObject.fallTo;
                } else if (isDateBetween(checkDate, seasonObject.winterFrom, seasonObject.winterTo)) {
                    //console.log('Winter');
                    seasonKey = "Winter";
                    firstDayOfSeason = seasonObject.winterFrom;
                    lastDayOfSeason = seasonObject.winterTo;
                } else {
                    console.log("Inconsistencia");
                }

                //Update map
                if (!mapDataPerSeason[seasonKey]) {
                    mapDataPerSeason[seasonKey] = { 'season': seasonKey, 'numbookscheckout': 1, 'firstdayofseason': firstDayOfSeason.toISOString().replace('.000Z', ''), 'lastdayofseason': lastDayOfSeason.toISOString().replace('.000Z', ''), 'year': fullYear };
                } else {
                    mapDataPerSeason[seasonKey].numbookscheckout += 1;
                }
            }

            // console.log("Sali Loop");


            //console.log('end Delivery');
            writeToFile("", fileSystem, 'exitSleep.txt');

            if (readFlag() !== '2') {
                writeFlag('1');
            }

        });
    });
}

//True if checkDate is between fromDate & toDate
function isDateBetween(checkDate, fromDate, toDate) {
    return (checkDate <= toDate && checkDate >= fromDate);
}

//First segment will include headers
function writeFirstSegment(myData, fields, fileSystem, fileName) {
    writeToCsvFile(myData, fields, fileSystem, fileName, true);
}

//Subsequent segments won't include headers and will add an EndOfLine
function writeNewSegment(myData, fields, fileSystem, fileName) {
    writeToFile('\n', fileSystem, fileName);
    writeToCsvFile(myData, fields, fileSystem, fileName);
}

//Write CSV format
function writeToCsvFile(myData, fields, fs, fileName, includeHeaders = false) {
    try {
        var opts = {
            data: myData,
            fields: fields,
            hasCSVColumnTitle: includeHeaders
        };

        var result = json2csv(opts);
        //console.log(result);

        fs.appendFile(fileName, result, function (err) {
            if (err) throw err;
            //console.log('Saved!');
        });


    } catch (err) {
        // Errors are thrown for bad options, or if the data is empty and no fields are provided.
        // Be sure to provide fields if it is possible that your data array will be empty.
        console.error(err);
    }
}

//Write any kind of data to a file
function writeToFile(myData, fs, fileName) {
    try {
        fs.appendFile(fileName, myData, function (err) {
            if (err) throw err;
        });


    } catch (err) {
        // Errors are thrown for bad options, or if the data is empty and no fields are provided.
        // Be sure to provide fields if it is possible that your data array will be empty.
        console.error(err);
    }
}

function writeMapToCsvFile(map) {


    let howMany = 0;

    for (let key in map) {
        howMany++;
    }

    let counter = 0;
    let jsonData = "[";

    for (let key in map) {

        let jsonLine = '{"season":"' + map[key].season + '", "numbookscheckout":' + map[key].numbookscheckout +
            ', "firstdayofseason":"' + map[key].firstdayofseason + '", "lastdayofseason":"' + map[key].lastdayofseason + '", "year":"' + map[key].year + '"}'

        if (counter < howMany - 1) {
            jsonData += jsonLine + ',';
        } else {
            jsonData += jsonLine;
        }

        counter++;
    }

    jsonData += ']';

    console.log("jsonData " + jsonData);



    //writeToCsvFile(JSON.parse(jsonData), fields, fileSystem, fileName, true);

}

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

function getMonday(date) {
    var day = date.getDay() || 7;
    if (day !== 1)
        date.setHours(-24 * (day - 1));
    return date;
}

//It informs the state of red/green light
function readFlag() {
    var fs = require('fs');
    var contents = fs.readFileSync('flag.txt').toString();
    //console.log(contents);
    return contents;
}

//Sets if process stops '0' or goes on '1'
function writeFlag(data) {
    var fs = require('fs');
    fs.writeFileSync('flag.txt', data);
}

//Server listening on port 8081
app.listen(8081, function () {
    console.log('App listening on port 8081');
});

