var json2csv = require('json2csv');
var fileSystem = require("fs");

var fields = ['month', 'numbookscheckout', 'firstdayofmonth', 'year'];

const json2007 = [{ "month": "1", "numbookscheckout": "294166", "firstdayofmonth": "1/01/2007", "year": "2007" }, { "month": "2", "numbookscheckout": "273075", "firstdayofmonth": "2/01/2007", "year": "2007" }, { "month": "3", "numbookscheckout": "308111", "firstdayofmonth": "3/01/2007", "year": "2007" }, { "month": "4", "numbookscheckout": "292899", "firstdayofmonth": "4/01/2007", "year": "2007" }, { "month": "5", "numbookscheckout": "295721", "firstdayofmonth": "5/01/2007", "year": "2007" }, { "month": "6", "numbookscheckout": "315847", "firstdayofmonth": "6/01/2007", "year": "2007" }, { "month": "7", "numbookscheckout": "318036", "firstdayofmonth": "7/01/2007", "year": "2007" }, { "month": "8", "numbookscheckout": "324224", "firstdayofmonth": "8/01/2007", "year": "2007" }, { "month": "9", "numbookscheckout": "298025", "firstdayofmonth": "9/01/2007", "year": "2007" }, { "month": "10", "numbookscheckout": "320304", "firstdayofmonth": "10/01/2007", "year": "2007" }, { "month": "11", "numbookscheckout": "309972", "firstdayofmonth": "11/01/2007", "year": "2007" }, { "month": "12", "numbookscheckout": "274179", "firstdayofmonth": "12/01/2007", "year": "2007" }];
const json2008 = [{ "month": "1", "numbookscheckout": "341559", "firstdayofmonth": "1/01/2008", "year": "2008" }, { "month": "2", "numbookscheckout": "313747", "firstdayofmonth": "2/01/2008", "year": "2008" }, { "month": "3", "numbookscheckout": "289487", "firstdayofmonth": "3/01/2008", "year": "2008" }, { "month": "4", "numbookscheckout": "338702", "firstdayofmonth": "4/01/2008", "year": "2008" }, { "month": "5", "numbookscheckout": "325179", "firstdayofmonth": "5/01/2008", "year": "2008" }, { "month": "6", "numbookscheckout": "353583", "firstdayofmonth": "6/01/2008", "year": "2008" }, { "month": "7", "numbookscheckout": "385262", "firstdayofmonth": "7/01/2008", "year": "2008" }, { "month": "8", "numbookscheckout": "359820", "firstdayofmonth": "8/01/2008", "year": "2008" }, { "month": "9", "numbookscheckout": "350203", "firstdayofmonth": "9/01/2008", "year": "2008" }, { "month": "10", "numbookscheckout": "351231", "firstdayofmonth": "10/01/2008", "year": "2008" }, { "month": "11", "numbookscheckout": "356312", "firstdayofmonth": "11/01/2008", "year": "2008" }, { "month": "12", "numbookscheckout": "305958", "firstdayofmonth": "12/01/2008", "year": "2008" }];
const json2009 = [{ "month": "1", "numbookscheckout": "385566", "firstdayofmonth": "1/01/2009", "year": "2009" }, { "month": "2", "numbookscheckout": "349585", "firstdayofmonth": "2/01/2009", "year": "2009" }, { "month": "3", "numbookscheckout": "395793", "firstdayofmonth": "3/01/2009", "year": "2009" }, { "month": "4", "numbookscheckout": "367085", "firstdayofmonth": "4/01/2009", "year": "2009" }, { "month": "5", "numbookscheckout": "356186", "firstdayofmonth": "5/01/2009", "year": "2009" }, { "month": "6", "numbookscheckout": "387045", "firstdayofmonth": "6/01/2009", "year": "2009" }, { "month": "7", "numbookscheckout": "400407", "firstdayofmonth": "7/01/2009", "year": "2009" }, { "month": "8", "numbookscheckout": "397490", "firstdayofmonth": "8/01/2009", "year": "2009" }, { "month": "9", "numbookscheckout": "288711", "firstdayofmonth": "9/01/2009", "year": "2009" }, { "month": "10", "numbookscheckout": "374218", "firstdayofmonth": "10/01/2009", "year": "2009" }, { "month": "11", "numbookscheckout": "350719", "firstdayofmonth": "11/01/2009", "year": "2009" }, { "month": "12", "numbookscheckout": "323127", "firstdayofmonth": "12/01/2009", "year": "2009" }];
const json2010 = [{ "month": "1", "numbookscheckout": "370439", "firstdayofmonth": "1/01/2010", "year": "2010" }, { "month": "2", "numbookscheckout": "327847", "firstdayofmonth": "2/01/2010", "year": "2010" }, { "month": "3", "numbookscheckout": "376936", "firstdayofmonth": "3/01/2010", "year": "2010" }, { "month": "4", "numbookscheckout": "350077", "firstdayofmonth": "4/01/2010", "year": "2010" }, { "month": "5", "numbookscheckout": "345694", "firstdayofmonth": "5/01/2010", "year": "2010" }, { "month": "6", "numbookscheckout": "376721", "firstdayofmonth": "6/01/2010", "year": "2010" }, { "month": "7", "numbookscheckout": "373516", "firstdayofmonth": "7/01/2010", "year": "2010" }, { "month": "8", "numbookscheckout": "363969", "firstdayofmonth": "8/01/2010", "year": "2010" }, { "month": "9", "numbookscheckout": "294002", "firstdayofmonth": "9/01/2010", "year": "2010" }, { "month": "10", "numbookscheckout": "353042", "firstdayofmonth": "10/01/2010", "year": "2010" }, { "month": "11", "numbookscheckout": "332683", "firstdayofmonth": "11/01/2010", "year": "2010" }, { "month": "12", "numbookscheckout": "320976", "firstdayofmonth": "12/01/2010", "year": "2010" }];
const json2011 = [{ "month": "1", "numbookscheckout": "356691", "firstdayofmonth": "1/01/2011", "year": "2011" }, { "month": "2", "numbookscheckout": "331676", "firstdayofmonth": "2/01/2011", "year": "2011" }, { "month": "3", "numbookscheckout": "332980", "firstdayofmonth": "3/01/2011", "year": "2011" }, { "month": "4", "numbookscheckout": "353201", "firstdayofmonth": "4/01/2011", "year": "2011" }, { "month": "5", "numbookscheckout": "338183", "firstdayofmonth": "5/01/2011", "year": "2011" }, { "month": "6", "numbookscheckout": "380082", "firstdayofmonth": "6/01/2011", "year": "2011" }, { "month": "7", "numbookscheckout": "375859", "firstdayofmonth": "7/01/2011", "year": "2011" }, { "month": "8", "numbookscheckout": "358289", "firstdayofmonth": "8/01/2011", "year": "2011" }, { "month": "9", "numbookscheckout": "284448", "firstdayofmonth": "9/01/2011", "year": "2011" }, { "month": "10", "numbookscheckout": "333975", "firstdayofmonth": "10/01/2011", "year": "2011" }, { "month": "11", "numbookscheckout": "311720", "firstdayofmonth": "11/01/2011", "year": "2011" }, { "month": "12", "numbookscheckout": "295185", "firstdayofmonth": "12/01/2011", "year": "2011" }];
const json2012 = [{ "month": "1", "numbookscheckout": "290733", "firstdayofmonth": "1/01/2012", "year": "2012" }, { "month": "2", "numbookscheckout": "298917", "firstdayofmonth": "2/01/2012", "year": "2012" }, { "month": "3", "numbookscheckout": "333086", "firstdayofmonth": "3/01/2012", "year": "2012" }, { "month": "4", "numbookscheckout": "320010", "firstdayofmonth": "4/01/2012", "year": "2012" }, { "month": "5", "numbookscheckout": "328018", "firstdayofmonth": "5/01/2012", "year": "2012" }, { "month": "6", "numbookscheckout": "361956", "firstdayofmonth": "6/01/2012", "year": "2012" }, { "month": "7", "numbookscheckout": "386349", "firstdayofmonth": "7/01/2012", "year": "2012" }, { "month": "8", "numbookscheckout": "314370", "firstdayofmonth": "8/01/2012", "year": "2012" }, { "month": "9", "numbookscheckout": "298742", "firstdayofmonth": "9/01/2012", "year": "2012" }, { "month": "10", "numbookscheckout": "364624", "firstdayofmonth": "10/01/2012", "year": "2012" }, { "month": "11", "numbookscheckout": "345639", "firstdayofmonth": "11/01/2012", "year": "2012" }, { "month": "12", "numbookscheckout": "314308", "firstdayofmonth": "12/01/2012", "year": "2012" }];
const json2013 = [{ "month": "1", "numbookscheckout": "379984", "firstdayofmonth": "1/01/2013", "year": "2013" }, { "month": "2", "numbookscheckout": "341436", "firstdayofmonth": "2/01/2013", "year": "2013" }, { "month": "3", "numbookscheckout": "371844", "firstdayofmonth": "3/01/2013", "year": "2013" }, { "month": "4", "numbookscheckout": "355593", "firstdayofmonth": "4/01/2013", "year": "2013" }, { "month": "5", "numbookscheckout": "345095", "firstdayofmonth": "5/01/2013", "year": "2013" }, { "month": "6", "numbookscheckout": "389107", "firstdayofmonth": "6/01/2013", "year": "2013" }, { "month": "7", "numbookscheckout": "399869", "firstdayofmonth": "7/01/2013", "year": "2013" }, { "month": "8", "numbookscheckout": "386341", "firstdayofmonth": "8/01/2013", "year": "2013" }, { "month": "9", "numbookscheckout": "363621", "firstdayofmonth": "9/01/2013", "year": "2013" }, { "month": "10", "numbookscheckout": "364437", "firstdayofmonth": "10/01/2013", "year": "2013" }, { "month": "11", "numbookscheckout": "357640", "firstdayofmonth": "11/01/2013", "year": "2013" }, { "month": "12", "numbookscheckout": "314639", "firstdayofmonth": "12/01/2013", "year": "2013" }];
const json2014 = [{ "month": "1", "numbookscheckout": "367174", "firstdayofmonth": "1/01/2014", "year": "2014" }, { "month": "2", "numbookscheckout": "319643", "firstdayofmonth": "2/01/2014", "year": "2014" }, { "month": "3", "numbookscheckout": "375521", "firstdayofmonth": "3/01/2014", "year": "2014" }, { "month": "4", "numbookscheckout": "336589", "firstdayofmonth": "4/01/2014", "year": "2014" }, { "month": "5", "numbookscheckout": "336672", "firstdayofmonth": "5/01/2014", "year": "2014" }, { "month": "6", "numbookscheckout": "357650", "firstdayofmonth": "6/01/2014", "year": "2014" }, { "month": "7", "numbookscheckout": "370883", "firstdayofmonth": "7/01/2014", "year": "2014" }, { "month": "8", "numbookscheckout": "357390", "firstdayofmonth": "8/01/2014", "year": "2014" }, { "month": "9", "numbookscheckout": "332770", "firstdayofmonth": "9/01/2014", "year": "2014" }, { "month": "10", "numbookscheckout": "345405", "firstdayofmonth": "10/01/2014", "year": "2014" }, { "month": "11", "numbookscheckout": "336426", "firstdayofmonth": "11/01/2014", "year": "2014" }, { "month": "12", "numbookscheckout": "302454", "firstdayofmonth": "12/01/2014", "year": "2014" }];
const json2015 = [{ "month": "1", "numbookscheckout": "344049", "firstdayofmonth": "1/01/2015", "year": "2015" }, { "month": "2", "numbookscheckout": "308153", "firstdayofmonth": "2/01/2015", "year": "2015" }, { "month": "3", "numbookscheckout": "353126", "firstdayofmonth": "3/01/2015", "year": "2015" }, { "month": "4", "numbookscheckout": "331974", "firstdayofmonth": "4/01/2015", "year": "2015" }, { "month": "5", "numbookscheckout": "317626", "firstdayofmonth": "5/01/2015", "year": "2015" }, { "month": "6", "numbookscheckout": "292338", "firstdayofmonth": "6/01/2015", "year": "2015" }, { "month": "7", "numbookscheckout": "359878", "firstdayofmonth": "7/01/2015", "year": "2015" }, { "month": "8", "numbookscheckout": "356467", "firstdayofmonth": "8/01/2015", "year": "2015" }, { "month": "9", "numbookscheckout": "341812", "firstdayofmonth": "9/01/2015", "year": "2015" }, { "month": "10", "numbookscheckout": "338724", "firstdayofmonth": "10/01/2015", "year": "2015" }, { "month": "11", "numbookscheckout": "325585", "firstdayofmonth": "11/01/2015", "year": "2015" }, { "month": "12", "numbookscheckout": "289710", "firstdayofmonth": "12/01/2015", "year": "2015" }];
const json2016 = [{ "month": "1", "numbookscheckout": "338566", "firstdayofmonth": "1/01/2016", "year": "2016" }, { "month": "2", "numbookscheckout": "310371", "firstdayofmonth": "2/01/2016", "year": "2016" }, { "month": "3", "numbookscheckout": "333568", "firstdayofmonth": "3/01/2016", "year": "2016" }, { "month": "4", "numbookscheckout": "310911", "firstdayofmonth": "4/01/2016", "year": "2016" }, { "month": "5", "numbookscheckout": "309325", "firstdayofmonth": "5/01/2016", "year": "2016" }, { "month": "6", "numbookscheckout": "324005", "firstdayofmonth": "6/01/2016", "year": "2016" }, { "month": "7", "numbookscheckout": "330556", "firstdayofmonth": "7/01/2016", "year": "2016" }, { "month": "8", "numbookscheckout": "325642", "firstdayofmonth": "8/01/2016", "year": "2016" }, { "month": "9", "numbookscheckout": "311872", "firstdayofmonth": "9/01/2016", "year": "2016" }, { "month": "10", "numbookscheckout": "296578", "firstdayofmonth": "10/01/2016", "year": "2016" }, { "month": "11", "numbookscheckout": "310780", "firstdayofmonth": "11/01/2016", "year": "2016" }, { "month": "12", "numbookscheckout": "285929", "firstdayofmonth": "12/01/2016", "year": "2016" }];
const json2017 = [{ "month": "1", "numbookscheckout": "318697", "firstdayofmonth": "1/01/2017", "year": "2017" }, { "month": "2", "numbookscheckout": "289182", "firstdayofmonth": "2/01/2017", "year": "2017" }, { "month": "3", "numbookscheckout": "326308", "firstdayofmonth": "3/01/2017", "year": "2017" }, { "month": "4", "numbookscheckout": "307859", "firstdayofmonth": "4/01/2017", "year": "2017" }, { "month": "5", "numbookscheckout": "310360", "firstdayofmonth": "5/01/2017", "year": "2017" }, { "month": "6", "numbookscheckout": "349089", "firstdayofmonth": "6/01/2017", "year": "2017" }, { "month": "7", "numbookscheckout": "349208", "firstdayofmonth": "7/01/2017", "year": "2017" }, { "month": "8", "numbookscheckout": "340208", "firstdayofmonth": "8/01/2017", "year": "2017" }, { "month": "9", "numbookscheckout": "318869", "firstdayofmonth": "9/01/2017", "year": "2017" }, { "month": "10", "numbookscheckout": "328970", "firstdayofmonth": "10/01/2017", "year": "2017" }, { "month": "11", "numbookscheckout": "193302", "firstdayofmonth": "11/01/2017", "year": "2017" }];

/*
const map = {
    '2007': json2007, '2008': json2008, '2009': json2009, '2010': json2010,
    '2011': json2011, '2012': json2012, '2013': json2013, '2014': json2014, '2015': json2015,
    '2016': json2016, '2017': json2017
};*/

const map = {
    '2017': json2017
};

for (var key in map) {
    let fileName = 'BookCheckoutsPerMonth_' + key + '.csv';
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