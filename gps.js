var serialport = require('serialport')
var SerialPort = serialport.SerialPort;

var fs = require('fs');
filename = "export_gps_" + Date.now() + ".csv";
fs.appendFile(filename, "timestamp,gpsdata\n");

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
      fs.appendFile(filename, Date.now() + "," + data + "\n"); // Write the string to a file

    });
  }
});
