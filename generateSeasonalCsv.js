var json2csv = require('json2csv');
var fileSystem = require("fs");

var fields = ['season', 'numbookscheckout', 'firstdayofseason', 'lastdayofseason','year'];

const jsonSeasonal = [{"season":"Spring", "numbookscheckout":896731, "firstdayofseason":"2007-03-01T00:00:00", "lastdayofseason":"2007-05-31T23:59:59","year":"2007"},  {"season":"Summer", "numbookscheckout":958107, "firstdayofseason":"2007-06-01T00:00:00", "lastdayofseason":"2007-08-31T23:59:59", "year":"2007"},  {"season":"Fall", "numbookscheckout":928301, "firstdayofseason":"2007-09-01T00:00:00", "lastdayofseason":"2007-11-30T23:59:59", "year":"2007"},  {"season":"Winter", "numbookscheckout":929485, "firstdayofseason":"2007-12-01T00:00:00", "lastdayofseason":"2008-02-29T23:59:59", "year":"2007"},

{"season":"Spring", "numbookscheckout":953368, "firstdayofseason":"2008-03-01T00:00:00", "lastdayofseason":"2008-05-31T23:59:59", "year":"2008"},{"season":"Summer", "numbookscheckout":1098665, "firstdayofseason":"2008-06-01T00:00:00", "lastdayofseason":"2008-08-31T23:59:59", "year":"2008"},{"season":"Fall", "numbookscheckout":1057746, "firstdayofseason":"2008-09-01T00:00:00", "lastdayofseason":"2008-11-30T23:59:59", "year":"2008"},{"season":"Winter", "numbookscheckout":1041109, "firstdayofseason":"2008-12-01T00:00:00", "lastdayofseason":"2009-02-28T23:59:59", "year":"2008"},

{"season":"Spring", "numbookscheckout":1119064, "firstdayofseason":"2009-03-01T00:00:00", "lastdayofseason":"2009-05-31T23:59:59", "year":"2009"},{"season":"Summer", "numbookscheckout":1184942, "firstdayofseason":"2009-06-01T00:00:00", "lastdayofseason":"2009-08-31T23:59:59", "year":"2009"},{"season":"Fall", "numbookscheckout":1013644, "firstdayofseason":"2009-09-01T00:00:00", "lastdayofseason":"2009-11-30T23:59:59", "year":"2009"},{"season":"Winter", "numbookscheckout":1021417, "firstdayofseason":"2009-12-01T00:00:00", "lastdayofseason":"2010-02-28T23:59:59", "year":"2009"},

{"season":"Spring", "numbookscheckout":1072707, "firstdayofseason":"2010-03-01T00:00:00", "lastdayofseason":"2010-05-31T23:59:59", "year":"2010"},{"season":"Summer", "numbookscheckout":1114206, "firstdayofseason":"2010-06-01T00:00:00", "lastdayofseason":"2010-08-31T23:59:59", "year":"2010"},{"season":"Fall", "numbookscheckout":979727, "firstdayofseason":"2010-09-01T00:00:00", "lastdayofseason":"2010-11-30T23:59:59", "year":"2010"},{"season":"Winter", "numbookscheckout":1009343, "firstdayofseason":"2010-12-01T00:00:00", "lastdayofseason":"2011-02-28T23:59:59", "year":"2010"},

{"season":"Spring", "numbookscheckout":1024364, "firstdayofseason":"2011-03-01T00:00:00", "lastdayofseason":"2011-05-31T23:59:59", "year":"2011"},{"season":"Summer", "numbookscheckout":1114230, "firstdayofseason":"2011-06-01T00:00:00", "lastdayofseason":"2011-08-31T23:59:59", "year":"2011"},{"season":"Fall", "numbookscheckout":930143, "firstdayofseason":"2011-09-01T00:00:00", "lastdayofseason":"2011-11-30T23:59:59", "year":"2011"},{"season":"Winter", "numbookscheckout":884835, "firstdayofseason":"2011-12-01T00:00:00", "lastdayofseason":"2012-02-29T23:59:59", "year":"2011"},

{"season":"Spring", "numbookscheckout":981114, "firstdayofseason":"2012-03-01T00:00:00", "lastdayofseason":"2012-05-31T23:59:59", "year":"2012"},{"season":"Summer", "numbookscheckout":1062675, "firstdayofseason":"2012-06-01T00:00:00", "lastdayofseason":"2012-08-31T23:59:59", "year":"2012"},{"season":"Fall", "numbookscheckout":1009005, "firstdayofseason":"2012-09-01T00:00:00", "lastdayofseason":"2012-11-30T23:59:59", "year":"2012"},{"season":"Winter", "numbookscheckout":1035728, "firstdayofseason":"2012-12-01T00:00:00", "lastdayofseason":"2013-02-28T23:59:59", "year":"2012"},

{"season":"Spring", "numbookscheckout":1072532, "firstdayofseason":"2013-03-01T00:00:00", "lastdayofseason":"2013-05-31T23:59:59", "year":"2013"},{"season":"Summer", "numbookscheckout":1175317, "firstdayofseason":"2013-06-01T00:00:00", "lastdayofseason":"2013-08-31T23:59:59", "year":"2013"},{"season":"Fall", "numbookscheckout":1085698, "firstdayofseason":"2013-09-01T00:00:00", "lastdayofseason":"2013-11-30T23:59:59", "year":"2013"},{"season":"Winter", "numbookscheckout":1001414, "firstdayofseason":"2013-12-01T00:00:00", "lastdayofseason":"2014-02-28T23:59:59", "year":"2013"},

{"season":"Spring", "numbookscheckout":1048799, "firstdayofseason":"2014-03-01T00:00:00", "lastdayofseason":"2014-05-31T23:59:59", "year":"2014"},{"season":"Summer", "numbookscheckout":1085942, "firstdayofseason":"2014-06-01T00:00:00", "lastdayofseason":"2014-08-31T23:59:59", "year":"2014"},{"season":"Fall", "numbookscheckout":1014552, "firstdayofseason":"2014-09-01T00:00:00", "lastdayofseason":"2014-11-30T23:59:59", "year":"2014"},{"season":"Winter", "numbookscheckout":954643, "firstdayofseason":"2014-12-01T00:00:00", "lastdayofseason":"2015-02-28T23:59:59", "year":"2014"},

{"season":"Spring", "numbookscheckout":1002733, "firstdayofseason":"2015-03-01T00:00:00", "lastdayofseason":"2015-05-31T23:59:59", "year":"2015"},{"season":"Summer", "numbookscheckout":1008663, "firstdayofseason":"2015-06-01T00:00:00", "lastdayofseason":"2015-08-31T23:59:59", "year":"2015"},{"season":"Fall", "numbookscheckout":1006123, "firstdayofseason":"2015-09-01T00:00:00", "lastdayofseason":"2015-11-30T23:59:59", "year":"2015"},{"season":"Winter", "numbookscheckout":938652, "firstdayofseason":"2015-12-01T00:00:00", "lastdayofseason":"2016-02-29T23:59:59", "year":"2015"},

{"season":"Spring", "numbookscheckout":953856, "firstdayofseason":"2016-03-01T00:00:00", "lastdayofseason":"2016-05-31T23:59:59", "year":"2016"},{"season":"Summer", "numbookscheckout":980229, "firstdayofseason":"2016-06-01T00:00:00", "lastdayofseason":"2016-08-31T23:59:59", "year":"2016"},{"season":"Fall", "numbookscheckout":919197, "firstdayofseason":"2016-09-01T00:00:00", "lastdayofseason":"2016-11-30T23:59:59", "year":"2016"},{"season":"Winter", "numbookscheckout":893792, "firstdayofseason":"2016-12-01T00:00:00", "lastdayofseason":"2017-02-28T23:59:59", "year":"2016"},

{"season":"Spring", "numbookscheckout":944532, "firstdayofseason":"2017-03-01T00:00:00", "lastdayofseason":"2017-05-31T23:59:59", "year":"2017"},{"season":"Summer", "numbookscheckout":1038497, "firstdayofseason":"2017-06-01T00:00:00", "lastdayofseason":"2017-08-31T23:59:59", "year":"2017"},{"season":"Fall", "numbookscheckout":965159, "firstdayofseason":"2017-09-01T00:00:00", "lastdayofseason":"2017-11-30T23:59:59", "year":"2017"}];

/*
const map = {
    '2007': json2007, '2008': json2008, '2009': json2009, '2010': json2010,
    '2011': json2011, '2012': json2012, '2013': json2013, '2014': json2014, '2015': json2015,
    '2016': json2016, '2017': json2017
};*/

const map = {
    'AllSeasons': jsonSeasonal
};

for (var key in map) {
    let fileName = 'BookCheckoutsPerSeasonFrom2007To2017.csv';
    writeJsonToCsvFile(map[key], fields, fileSystem, fileName);
}


function writeJsonToCsvFile(jsonData, fields, fileSystem, fileName) {
    writeToCsvFile(jsonData, fields, fileSystem, fileName, true);
}

function writeMapToCsvFile(map, fields, fileSystem, fileName) {
    let howMany = 0;

    for (let key in map) {
        howMany++;
    }

    let counter = 0;
    let jsonData = "[";

    for (let key in map) {

        let jsonLine = '{"month":"' + map[key].month + '", "numbookscheckout":"' + map[key].numbookscheckout +
            '", "firstdayofmonth":"' + map[key].firstdayofmonth + '", "year":"' + map[key].year + '"}'

        if (counter < howMany - 1) {
            jsonData += jsonLine + ',';
        } else {
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