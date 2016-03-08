var serialport = require('serialport')
var SerialPort = serialport.SerialPort;

// Manually select serial port
var port = '/dev/cu.usbserial'; // Mac OS for testing
//var port = '/dev/ttyUSB0';   // Intel Edison


var fs = require('fs');
filename = "export_gps_" + Date.now() + ".csv";
fs.appendFile(filename, "timestamp,gpsdata\n", function (err){if (err) throw err;});

var serial = new SerialPort("/dev/cu.usbserial", {
   baudrate: 4800,
   parser: serialport.parsers.readline("\n")
});


serial.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    serial.on('data', function(data) {
      console.log(data);
      fs.appendFile(filename, Date.now() + "," + data + "\n", function (err){if (err) throw err;}); // Write the string to a file

    });
  }
});
