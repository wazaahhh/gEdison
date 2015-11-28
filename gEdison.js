


var noble = require('noble');
var fs = require('fs');

filename = "export_ypr_" + Date.now() + ".csv";
fs.appendFile(filename, "timestamp,yaw, pitch, roll\n");

// var SerialPort = require('serialport').SerialPort;
// var serial = new SerialPort("/dev/tty.usbserial", {
//   baudrate: 4800
//   //parser: SerialPort.parsers.readline("\n")
// });



var state = 'poweredOn';


NORDIC_NRF8001_SERVICE_UART = '6e400001b5a3f393e0a9e50e24dcca9e'; // Custom UART service
NORDIC_NRF8001_CHAR_TX      = '6e400002b5a3f393e0a9e50e24dcca9e'; // Write
NORDIC_NRF8001_CHAR_RX      = '6e400003b5a3f393e0a9e50e24dcca9e'; // Read

noble.on('stateChange', function(state) {
  if (state == 'poweredOn') {
    //
    // Once the BLE radio has been powered on, it is possible
    // to begin scanning for services. Pass an empty array to
    // scan for all services (uses more time and power).
    //
    console.log('scanning...');
    noble.startScanning([NORDIC_NRF8001_SERVICE_UART], false);

  }
  else {
    noble.stopScanning();
  }
})


noble.on('discover', function(peripheral) {
  // we found a peripheral, stop scanning
  noble.stopScanning();

  //
  // The advertisment data contains a name, power level (if available),
  // certain advertised service uuids, as well as manufacturer data,
  // which could be formatted as an iBeacon.
  //
  console.log('found peripheral:', peripheral.advertisement.localName);

  peripheral.connect(function(err) {
      //console.log("error connecting");


      console.log(peripheral.state);
      //
      // Once the peripheral has been connected, then discover the
      // services and characteristics of interest.
      //
      //peripheral.discoverServices([NORDIC_NRF8001_CHAR_TX,NORDIC_NRF8001_CHAR_RX], function(err, services) {


      peripheral.discoverSomeServicesAndCharacteristics([],[NORDIC_NRF8001_CHAR_TX,NORDIC_NRF8001_CHAR_RX],function(error, services, characteristics){
          //services.forEach(function(service) {
          //    console.log('found service:', service.uuid);
          //    })

          characteristics.forEach(function(characteristic) {
              console.log('found characteristic:', characteristic.uuid);

              if (characteristic.uuid == NORDIC_NRF8001_CHAR_RX) {
                  characteristic.notify(true,function(err){
                      console.log('characteristics RX notify');


                      //var fh = fs.open("ypr_export.csv", 'a'); // Open the file for writing

                      characteristic.on('read', function(data){
                          var ascii = data.toString('ascii');
                          var ypr = ascii.split('|');
                          var yprRecord = {
                              uuid: characteristic.uuid,
                              yaw: parseFloat(ypr[0]),
                              pitch: parseFloat(ypr[1]),
                              roll: parseFloat(ypr[2]),
                              timestamp: Date.now()
                          };

                          var str = "timestamp: " + yprRecord['timestamp']
                            + ", yaw:" + yprRecord['yaw']
                            + ", pitch: " + yprRecord['pitch']
                            + ", roll: " + yprRecord['roll'];
                          console.log(str);
                          fs.appendFile(filename, yprRecord['timestamp'] + "," + yprRecord['yaw'] + "," + yprRecord['pitch'] + "," + yprRecord['roll'] + "\n"); // Write the string to a file


                    })
                    //fclose(fh);
                  })
              }
                  //characteristic.read(function(err,data){
                  //})
          })

      })

  })
})
