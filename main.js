var csv = require('./dataParser.js');

var data = [
  ['date', 'close']
];
var dataBufferSize = 20;
var count = 0;
var five = require("johnny-five");
var board = new five.Board({
  repl: false
});

board.on("ready", function() {

  // Create a new generic sensor instance for
  // a sensor connected to an analog (ADC) pin
  var sensor = new five.Sensor({
    pin: "A0",
    freq: 1000
  });
  this.samplingInterval(1000);

  // When the sensor value changes, log the value
  sensor.on("data", function(value) {
    // Keep size of file to 25 entries
    if (count < dataBufferSize) {
      var moisture = (0.9 - value / 1024) * 100;
      // console.log("Moisture = " + moisture + "%");
      data.push([stringifyDate(), moisture.toString()])
      csv.writeDataToCSV(data, "./src/data.csv");
      count += 1
    } else {
      data.splice(1, 1);
      var moisture = (0.9 - value / 1024) * 100;
      // console.log("Moisture = " + moisture + "%");
      data.push([stringifyDate(), moisture.toString()])
      csv.writeDataToCSV(data, "./src/data.csv");


    }


  });
});


function stringifyDate() {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var today = new Date();
  var hh = today.getHours();
  var ms = today.getMinutes();
  var ss = today.getSeconds();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear() - 2000;


  if (dd < 10) {
    dd = '0' + dd
  }

  if (ss < 10) {
    ss = '0' + ss
  }

  if (mm < 10) {
    mm = '0' + mm
  }
  if (ms < 10) {
    ms = '0' + ms
  }

  today = hh + ":" + ms + ":" + ss + " " + dd + "/" + mm + "/" + yyyy;
  return today;
}






// NODE SERVER --------=-=----=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

var express = require('express');
var app = express();
var storage = require('node-persist');
var cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000'
}));
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}));
var dataArray = [['date','close']];
var harvestArray = [['date','close']];




// storage.init({
//   dir: './src/data'
// }).catch(function(err) {
//   console.error(err);
//   throw err;
// });


app.get('/', function(req, res) {
  // res.send('Hello World!')
  // console.log(storage.values());
})


app.get('/price', function(req, res) {
  // console.log(storage.valuesWithKeyMatch('mintPrice'));
  // res.send(storage.valuesWithKeyMatch('mintPrice'))

})


app.get('/leaves', function(req, res) {
  // res.send(storage.valuesWithKeyMatch('harvest'));
  // console.log(storage.valuesWithKeyMatch('harvest'));
})

app.post('/data', function(req, res) {
  console.log(req.body);

  if(dataArray.length < dataBufferSize) {

  dataArray.push([req.body['time'],req.body['value']]);
  // console.log(dataArray);
  csv.writeDataToCSV(dataArray, "./src/pricedata.csv");
} else {
  dataArray.splice(1, 1);

  dataArray.push([req.body['time'],req.body['value']]);
  // console.log(dataArray);

  csv.writeDataToCSV(dataArray, "./src/pricedata.csv");

  // console.log(dataArray);
}
 res.status(200).end();
  //
  // storage.setItem('mintPrice', dataArray).then(
  //   function() {
  //     // success
  //     console.log("Successfully updated storage");
  //   },
  //   function() {
  //     // error
  //     console.log("Error updating storage");
  //
  //   });
  // // console.log(storage.values());


})

app.post('/harvest', function(req, res) {
  console.log(req.body);

  if(harvestArray.length < dataBufferSize) {

  harvestArray.push([req.body['time'],req.body['value']]);
  console.log(harvestArray);
  csv.writeDataToCSV(harvestArray, "./src/harvestdata.csv");
} else {
  harvestArray.splice(1, 1);

  harvestArray.push([req.body['time'],req.body['value']]);
  console.log(harvestArray);

  csv.writeDataToCSV(harvestArray, "./src/harvestdata.csv");

  // console.log(dataArray);
}
 res.status(200).end();


})

app.put('/data', function(req, res) {
  res.send('Got a PUT request at /data')
  console.log(req);

})
app.listen(3002, function() {
  console.log('Example app listening on port 3000!');
});
