var fs = require('fs');
var csv = require('fast-csv');


module.exports = {
  writeDataToCSV: function(data, filename) {
    // console.log("Writing to CSV " + filename + " " + data);
    var ws = fs.createWriteStream(filename);
    csv.write(data, {
        headers: true
      })
      .pipe(ws);
  },

  readDataFromCSV: function(filename) {
    var dataArray = [];
    var fileStream = fs.createReadStream(filename),
      parser = csv();

    fileStream
      .on("readable", function() {
        var data;
        while ((data = fileStream.read()) !== null) {
          parser.write(data);
        }
      })
      .on("end", function() {
        parser.end();
      });

    parser
      .on("readable", function() {
        var data;
        while ((data = parser.read()) !== null) {
          // console.log(data);
          dataArray.push(data);
        }
      })
      .on("end", function() {
        console.log("done");
        // console.log(dataArray);
        return dataArray;

      });

    }



}
