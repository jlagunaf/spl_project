
var express = require('express');
var app = express();

var currentWeekNumber = require('current-week-number');
var fileSystem = require("fs")
var https = require('https');
var sleep = require('system-sleep');
var json2csv = require('json2csv');



/////////////Request 1 year of data/////////////

//Actual number of rows per year
const numRows_2007 = 7092007;

//const numRows_2007 = 2000000;

const numRows_2008 = 8374541;
const numRows_2009 = 9035838;
const numRows_2010 = 8425046;
const numRows_2011 = 7784795;
const numRows_2012 = 7299124;
const numRows_2013 = 7864260;
const numRows_2014 = 7416879;
const numRows_2015 = 6871626;
const numRows_2016 = 6404830;
const numRows_2017 = 5549288;

//const numRows_2016 = 200000;
//const numRows_2017_January = 533558;


//                  0           1                  2                3               4       5           6               7           8         9      
//var fields = ['bibnumber', 'callnumber', 'checkoutdatetime', 'checkoutyear', 'collection', 'id', 'itembarcode', 'itemtitle', 'itemtype', 'subjects'];

//Without  id, checkoutdatetime and subjects
//var fields = ['bibnumber', 'callnumber', 'checkoutyear', 'collection', 'itembarcode', 'itemtitle', 'itemtype', 'dayOfWeek'];
var fields = ['month', 'numbookscheckout', 'firstdayofmonth', 'year'];

/*
var maxNumRowsPerYear = {
    '2007': numRows_2007, '2008': numRows_2008, '2009': numRows_2009, '2010': numRows_2010,
    '2011': numRows_2011, '2012': numRows_2012, '2013': numRows_2013, '2014': numRows_2014, '2015': numRows_2015,
    '2016': numRows_2016, '2017': numRows_2017
};*/

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
    let limit = 100000;

    for (var yearOfData in maxNumRowsPerYear) {
        //var yearOfData = 2007;
        let maxNumOfRows = maxNumRowsPerYear[yearOfData];
        console.log('maxNumOfRows for (' + yearOfData + ') are (' + maxNumOfRows + ')');

        //Create csv file for current year

        var fileName = "BookCheckoutsPerMonth_" + yearOfData + ".csv"

        //Spring: March 1 to May 31
        const springFrom = new Date('03-01-' + yearOfData);
        const springTo = new Date('05-31-' + yearOfData);
        //Summer: June 1 to August 31
        const summerFrom = new Date('06-01-' + yearOfData);
        const summerTo = new Date('08-31-' + yearOfData);
        //Fall: September 1 to November 30
        const fallFrom = new Date('09-01-' + yearOfData);
        const fallTo = new Date('11-30-' + yearOfData);



        //Winter-First Period: January 1 to February 28 or 29
        const winterFromFirstPeriod = new Date('01-01-' + yearOfData);
        let winterToFirstPeriod = new Date('02-28-' + yearOfData);

        //Check if year is leap
        var leapYear = require('leap-year');

        if (leapYear(Number(yearOfData))) {
            winterToFirstPeriod = new Date('02-29-' + yearOfData);
        }

        //Winter-Second Period: December 1 to December 31
        const winterFromSecondPeriod = new Date('12-01-' + yearOfData);
        const winterToSecondPeriod = new Date('12-31-' + yearOfData);

        //Seasons' dates
        seasonObject.springFrom = springFrom;
        seasonObject.springTo = springTo;
        seasonObject.summerFrom = summerFrom;
        seasonObject.summerTo = summerTo;
        seasonObject.fallFrom = fallFrom;
        seasonObject.fallTo = fallTo;
        seasonObject.winterFromFirstPeriod = winterFromFirstPeriod;
        seasonObject.winterToFirstPeriod = winterToFirstPeriod;
        seasonObject.winterFromSecondPeriod = winterFromSecondPeriod;
        seasonObject.winterToSecondPeriod = winterToSecondPeriod;

        var doNextRequest = false;
        writeFlag('0');

        console.log('Creating file (' + fileName + ')');

        let numPulls = Math.ceil(maxNumOfRows / limit);
        console.log('NumPulls(' + numPulls + ')');

        let isFirstSegment = true;

        //Array to store data per week

        for (var numPullsCount = 0; numPullsCount < numPulls; numPullsCount++) {
            console.log("NumPull(" + numPullsCount + ') Offset(' + offset + ') Limit(' + limit + ')');
            pullDataAndProceesIt(yearOfData, limit, offset, fileName, isFirstSegment, numPullsCount);

            isFirstSegment = false;
            offset += limit;

            while (!doNextRequest) {
                sleep(1000);
                let flag = readFlag();
                if (flag === '1') {
                    doNextRequest = true;
                    writeFlag('0');
                }
                //console.log('...');
            }

            doNextRequest = false;
        }

        //Write map to disk
        writeMapToCsvFile(mapDataPerSeason, fields, fileSystem, fileName);

        mapDataPerSeason = {};

        console.log('End of ' + yearOfData + ' generation!');

    }



});


function pullDataAndProceesIt(year, limit, offset, fileName, isFirstSegment, numPullsCount) {
    //console.log('isFirstSegment(' + isFirstSegment + ') numPullsCount(' + numPullsCount + ')')

    // Lets make an http.request to Seattle Library
    // For different format change extension .json to .csv, ...
    var options = {
        host: 'data.seattle.gov',
        path: '/resource/5src-czff.json?checkoutyear=' + year + '&$limit=' + limit + '&$offset=' + offset + '&$$app_token=YLBaOvoTUKa2x5BoyYi4hPwWC',
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
            body = JSON.parse(body);

            for (var row in body) {

                //If title is blank - remove row
                if (body[row].itemtitle == 'undefined' || !body[row].itemtitle || !body[row].itemtype.includes('bk')) {
                    delete body[row];
                    continue;
                }

                var checkDate = new Date(body[row].checkoutdatetime);

                const fullYear = checkDate.getFullYear();

                let seasonKey = 'Spring';
                let firstDayOfSeason = seasonObject.springFrom;
                let lastDayOfSeason = seasonObject.springTo;

                if (isDateBetween(checkDate, seasonObject.summerFrom, seasonObject.summerTo)) {
                    seasonKey = 'Summer';
                    firstDayOfSeason = seasonObject.summerFrom;
                    lastDayOfSeason = seasonObject.summerTo;
                } else if (isDateBetween(checkDate, seasonObject.fallFrom, seasonObject.fallTo)) {
                    seasonKey = "Fall";
                    firstDayOfSeason = seasonObject.fallFrom;
                    lastDayOfSeason = seasonObject.fallTo;
                } else if (isDateBetween(checkDate, seasonObject.winterFromFirstPeriod, seasonObject.winterToFirstPeriod)
                    || isDateBetween(checkDate, seasonObject.winterFromSecondPeriod, seasonObject.winterToSecondPeriod)) {
                    seasonKey = "Winter";
                    firstDayOfSeason = seasonObject.winterFrom;
                    lastDayOfSeason = seasonObject.winterTo;
                }

                //Update map
                if (!mapDataPerSeason[seasonKey]) {
                    mapDataPerSeason[seasonKey] = { 'season': seasonKey, 'numbookscheckout': 1, 'firstdayofseason': dateFormat(firstDayOfSeason, "mm/dd/yyyy"), 'lastdayofseason': dateFormat(lastDayOfSeason, "mm/dd/yyyy"), 'year': fullYear };
                } else {
                    mapDataPerSeason[seasonKey].numbookscheckout += 1;
                }
            }


            //console.log('end Delivery');
            writeToFile("", fileSystem, 'exitSleep.txt');

            writeFlag('1');
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

function writeMapToCsvFile(map, fields, fileSystem, fileName) {


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

