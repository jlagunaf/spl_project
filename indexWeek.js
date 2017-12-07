
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
var fields = ['week', 'numbookscheckout', 'firstdayofweek', 'year'];

var maxNumRowsPerYear = {
    '2007': numRows_2007, '2008': numRows_2008, '2009': numRows_2009, '2010': numRows_2010,
    '2011': numRows_2011, '2012': numRows_2012, '2013': numRows_2013, '2014': numRows_2014, '2015': numRows_2015,
    '2016': numRows_2016, '2017':numRows_2017
};

var dateFormat = require('dateformat');
var mapDataPerWeek = {};


//Request data to SPL API, Checkouts per week
app.get('/sl/t2', function (req, response) {

    response.send("Generating files for # checkouts per week!");

    //Starting index of requested rows
    let offset = 0;
    //Max Number of rows to be requested at a time
    let limit = 100000;

    //for (var yearOfData in maxNumRowsPerYear) {
    var yearOfData = '2017';
    let maxNumOfRows = maxNumRowsPerYear[yearOfData];
    console.log('maxNumOfRows for (' + yearOfData + ') are (' + maxNumOfRows + ')');

    //Create csv file for current year

    var fileName = "data_" + yearOfData + "_checkoutsPerWeek.csv";

    var doNextRequest = false;
    writeFlag('0');

    console.log('Creating file (' + fileName + ')');

    let numPulls = Math.ceil(maxNumOfRows / limit);
    console.log('NumPulls(' + numPulls + ')');

    let isFirstSegment = true;

    //Array to store data per week

    for (var numPullsCount = 0; numPullsCount < numPulls; numPullsCount++) {
        console.log("NumPull(" + numPullsCount + ') Offset(' + offset + ') Limit(' + limit + ')');
        pullDataAndSaveItCheckoutsPerWeek(yearOfData, limit, offset, fileName, isFirstSegment, numPullsCount);

        isFirstSegment = false;
        offset += limit;

        while (!doNextRequest) {
            sleep(500);
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
    writeMapToCsvFile(mapDataPerWeek, fields, fileSystem, "testDate.csv");

    console.log('End of file (' + fileName + ') generation!');

    //}



});


function pullDataAndSaveItCheckoutsPerWeek(year, limit, offset, fileName, isFirstSegment, numPullsCount) {
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

    //console.log('/resource/5src-czff.json?checkoutyear=' + year + '&$limit=' + limit + '&$offset=' + offset + '&$$app_token=YLBaOvoTUKa2x5BoyYi4hPwWC');

    https.get(options, res => {
        res.setEncoding("utf8");
        let body = "";

        res.on("data", data => {
            body += data;
        });

        res.on("end", () => {
            body = JSON.parse(body);

            updateStatistics(body);

            //console.log('end Delivery');
            writeToFile("", fileSystem, 'exitSleep.txt');


            writeFlag('1');
        });
    });
}

//Clean up data and generate Day of Week
function updateStatistics(jsonData) {
    //console.log('cleanUpData');
    for (var row in jsonData) {

        //If title is blank - remove row
        if (jsonData[row].itemtitle == 'undefined' || !jsonData[row].itemtitle || !jsonData[row].itemtype.includes('bk')) {
            delete jsonData[row];
            continue;
        }
        
        
        var decomposedDate = getDecomposedDate(jsonData[row].checkoutdatetime);
        let key = decomposedDate.weekInYear + '-' + jsonData[row].checkoutyear;

        /*
        let checkoutdate = new Date(jsonData[row].checkoutdatetime);
        let firstDayWeek = checkoutdate;
        let checkoutdateFormatted = dateFormat(checkoutdate, "mm/dd");

        //Verify comparison
        if(checkoutdateFormatted !== '01/01'){            
            firstDayWeek = getMonday(checkoutdate); 
        }

        let formattedFirstDayWeek = dateFormat(firstDayWeek, "mm/dd/yyyy");
        */

        //Update map
        if (!mapDataPerWeek[key]) {
            //mapDataPerWeek[key] = { 'week': decomposedDate.weekInYear, 'numbookscheckout': 1, 'firstdayofweek': formattedFirstDayWeek, 'year': jsonData[row].checkoutyear };
            mapDataPerWeek[key] = { 'week': decomposedDate.weekInYear, 'numbookscheckout': 1, 'firstdayofweek': dateFormat(getMonday(new Date(jsonData[row].checkoutdatetime)), "mm/dd/yyyy"), 'year': jsonData[row].checkoutyear };
        } else {
            mapDataPerWeek[key].numbookscheckout += 1;
        }

    }

    //console.log('EndcleanUpData');
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

    for (let key in map){
        howMany++;
    }
    
    let counter = 0;
    let jsonData = "[";

    for (let key in map) {

        let jsonLine = '{"week":"' + map[key].week + '", "numbookscheckout":"' + map[key].numbookscheckout +
        '", "firstdayofweek":"' + map[key].firstdayofweek + '", "year":"' + map[key].year + '"}'

        if(counter < howMany-1){
            jsonData += jsonLine + ',';
        }else{
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

