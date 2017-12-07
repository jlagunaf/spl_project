
var express = require('express');
var app = express();

var currentWeekNumber = require('current-week-number');
var fileSystem = require("fs")
var https = require('https');
var sleep = require('system-sleep');
var json2csv = require('json2csv');

//Public resources
app.use(express.static('public'));

//Allow cross-origins
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//GUI to show raw data - Just for testing API
app.get('/', function (req, res) {
    res.sendfile("index.html");
});

//Used by GUI to request data
app.post('/sl', function (req, response) {

    let limit = req.param('jtPageSize', 2);
    let offset = req.param('jtStartIndex', 0);

    // Lets make an http.request to Seattle Library
    // For different format change extension .json to .csv, ...
    var options = {
        host: 'data.seattle.gov',
        path: '/resource/5src-czff.json?$limit=' + limit + '&$offset=' + offset,
        method: 'GET',
        headers: {
            'X-App-Token': 'YLBaOvoTUKa2x5BoyYi4hPwWC'
        }
    };

    https.get(options, res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {

            body = JSON.parse(body);

            for (var row in body) {
                var decomposedDate = getDecomposedDate(body[row].checkoutdatetime);
                body[row].dayOfWeek = decomposedDate.dayOfWeek;
                body[row].weekInYear = decomposedDate.weekInYear;
                body[row].month = decomposedDate.month;
                body[row].epochTime = decomposedDate.epochTime;
                //Delete no needed properties
                delete body[row].bibnumber;
                delete body[row].callnumber;
            }

            //response.send(body);
            let bodyString = JSON.stringify(body);
            bodyString = '{"Result":"OK","Records":' + bodyString + '}';
            response.send(JSON.parse(bodyString));

        });
    });

});

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
//const numRows_2017_January = 533558;


//                  0           1                  2                3               4       5           6               7           8         9      
//var fields = ['bibnumber', 'callnumber', 'checkoutdatetime', 'checkoutyear', 'collection', 'id', 'itembarcode', 'itemtitle', 'itemtype', 'subjects'];

//Without  id, checkoutdatetime and subjects
var fields = ['bibnumber', 'callnumber', 'checkoutyear', 'collection', 'itembarcode', 'itemtitle', 'itemtype', 'dayOfWeek'];

var maxNumRowsPerYear = {
    '2007': numRows_2007, '2008': numRows_2008, '2009': numRows_2009, '2010': numRows_2010,
    '2011': numRows_2011, '2012': numRows_2012, '2013': numRows_2013, '2014': numRows_2014, '2015': numRows_2015,
    '2016': numRows_2016
};

//Request data to SPL API, clean it up, and generate clean CSV file for training
app.get('/sl/t2', function (req, response) {

    response.send("Generating files!");

    //Starting index of requested rows
    let offset = 0;
    //Max Number of rows to be requested at a time
    let limit = 100000;

    //for (var yearOfData in maxNumRowsPerYear) {
    var yearOfData = '2016';
    let maxNumOfRows = maxNumRowsPerYear[yearOfData];
    console.log('maxNumOfRows for (' + yearOfData + ') are (' + maxNumOfRows + ')');

    //Create csv file for current year

    var fileName = "data_" + yearOfData + "_target_dayOfWeek_1kRows.csv";

    var doNextRequest = false;
    writeFlag('0');

    console.log('Creating file (' + fileName + ')');

    let numPulls = Math.ceil(maxNumOfRows / limit);
    console.log('NumPulls(' + numPulls + ')');

    let isFirstSegment = true;

    for (var numPullsCount = 0; numPullsCount < numPulls; numPullsCount++) {
        console.log("NumPull(" + numPullsCount + ') Offset(' + offset + ') Limit(' + limit + ')');
        pullDataAndSaveItTargetDayOfWeek(yearOfData, limit, offset, fileName, isFirstSegment, numPullsCount);

        isFirstSegment = false;
        offset += limit;

        while (!doNextRequest) {
            sleep(1000);
            let flag = readFlag();
            if (flag === '1') {
                doNextRequest = true;
                writeFlag('0');
            }
            console.log("...");
        }

        doNextRequest = false;
    }

    console.log('End of file (' + fileName + ') generation!');

    //}



});

//Pulls data from Seattle's API, clean it up and save it
function pullDataAndSaveItTargetDayOfWeek(year, limit, offset, fileName, isFirstSegment, numPullsCount) {
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

            body = cleanUpDataTargetDay(body);

            console.log("End of delivery");
/*
            if (isFirstSegment) {
                writeFirstSegment(body, fields, fileSystem, fileName);
            } else {
                writeNewSegment(body, fields, fileSystem, fileName);
            }*/

            writeToFile("", fileSystem, 'exitSleep.txt');

            //Indicate continue with next request
            writeFlag('1');
        });
    });
}

//Clean up data and generate Day of Week
function cleanUpDataTargetDay(jsonData) {
    for (var row in jsonData) {

        //If title is blank - remove row
        if (jsonData[row].itemtitle == 'undefined' || !jsonData[row].itemtitle || !jsonData[row].itemtype.includes('bk')) {
            delete jsonData[row];
            continue;
        }

        var decomposedDate = getDecomposedDate(jsonData[row].checkoutdatetime);
        jsonData[row].dayOfWeek = decomposedDate.dayOfWeek;
        //Delete no needed properties
        delete jsonData[row].checkoutdatetime;
        delete jsonData[row].subjects;
        delete jsonData[row].id;

    }

    return jsonData;
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

//It informs the state of red/green light
function readFlag() {
    var fs = require('fs');
    var contents = fs.readFileSync('flag.txt').toString();
    console.log('readFlag('+contents+')');
    return contents;
}

//Sets if process stops '0' or goes on '1'
function writeFlag(data) {
    var fs = require('fs');
    fs.writeFileSync('flag.txt', data);
    console.log("writeFlag("+data+') finished!');
}

//Server listening on port 8081
app.listen(8081, function () {
    console.log('App listening on port 8081');
});

