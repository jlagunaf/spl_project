var json2csv = require('json2csv');

var map = {};

map["1-2017"] = { 'week': 1, 'numbookscheckout': 500, 'firstdayofweek': '01/01/2017', 'year': 2017 };
map["2-2017"] = { 'week': 2, 'numbookscheckout': 500, 'firstdayofweek': '01/07/2017', 'year': 2017 };

console.log(map);

var exists = map["2-2017"];

console.log (exists);

if(!exists){
    map["2-2017"] = { 'week': 3, 'numbookscheckout': 1, 'firstdayofweek': '01/14/2017', 'year': 2017 };
}else{
    map['2-2017'].numbookscheckout += 1;
}


var fields = ['week', 'numbookscheckout', 'firstdayofweek', 'year'];
var fileSystem = require("fs")



var fileName = 'CheckoutsPerWeek2016.csv';

function writeJsonToCsvFile(json){
    
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

    writeToCsvFile(JSON.parse(jsonData), fields, fileSystem, fileName, true);

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