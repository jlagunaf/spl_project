var fs = require('fs');
var json2csv = require('json2csv');
var fields = ['field1', 'field2', 'field3'];
var myData = [{'field1':'Hola','field2':'mundo','field3':'cruel'},
{'field1':'Hola1','field2':'mundo1','field3':'cruel1'}];
 
try {


    var opts = {
        data: myData,
        fields: fields,
        hasCSVColumnTitle: false
      };

    

  var result = json2csv(opts);
  console.log(result);

  fs.appendFile('test.csv', result, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });


} catch (err) {
  // Errors are thrown for bad options, or if the data is empty and no fields are provided.
  // Be sure to provide fields if it is possible that your data array will be empty.
  console.error(err);
}


//QUERY DICTIONNARY
var dictionnary = "";

/////////////Request dictionnary
function requestDictionnary() {
    // Lets make an http.request to Seattle Library
    // For different format change extension .json to .csv, ...
    var options = {
        host: 'data.seattle.gov',
        path: '/resource/xxek-ypnn.json',
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
            dictionnary = body;
            //console.log(dictionnary);
        });
    });

}

requestDictionnary();
