var serialport = require('serialport');
var nmea = require('nmea');

var parsed;

var port = new serialport.SerialPort('/dev/cu.usbserial', {
                baudrate: 4800,
                parser: serialport.parsers.readline('\r\n')});

port.on('data', function(line) {

    parsed = nmea.parse(line);

    console.log(parsed['sentence']);

    if (parsed['sentence'] == 'RMC') {
      console.log(parsed);
    }
});
