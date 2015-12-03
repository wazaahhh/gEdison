


var noble = require('noble');
var fs = require('fs');

var imuDic =  {"9f3f64afce1545b5b1ce67a082075aeb" : "Bohr",
               "40028eb548474d8d9b0b5c0d9c3a8350" : "Einstein"}



filename = "test_" + Date.now() + ".csv";
filename = "test.csv";
fs.appendFile(filename, "timestamp, IMU, yaw, pitch, roll,rssi\n", function (err){if (err) throw err;});

// var SerialPort = require('serialport').SerialPort;
// var serial = new SerialPort("/dev/tty.usbserial", {
//   baudrate: 4800
//   //parser: SerialPort.parsers.readline("\n")
// });



var state = 'poweredOn';


NORDIC_NRF8001_SERVICE_UART = '6e400001b5a3f393e0a9e50e24dcca9e'; // Custom UART service
NORDIC_NRF8001_CHAR_TX      = '6e400002b5a3f393e0a9e50e24dcca9e'; // Write
NORDIC_NRF8001_CHAR_RX      = '6e400003b5a3f393e0a9e50e24dcca9e'; // Read



var streamData = function(peripheral) {
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

                    peripheral.updateRssi();

                    var ascii = data.toString('ascii');
                    var ypr = ascii.split('|');
                    var yprRecord = {
                        uuid: characteristic.uuid,
                        rssi: peripheral.rssi,
                        yaw: parseFloat(ypr[0]),
                        pitch: parseFloat(ypr[1]),
                        roll: parseFloat(ypr[2]),
                        timestamp: Date.now()
                    };

                    var str = "timestamp: " + yprRecord['timestamp']
                      + ", yaw:" + yprRecord['yaw']
                      + ", pitch: " + yprRecord['pitch']
                      + ", roll: " + yprRecord['roll']
                      + ", RSSI:" + yprRecord['rssi']
                      + ", IMU:" + imuDic[peripheral.uuid];
                    console.log(str);
                    fs.appendFile(filename, yprRecord['timestamp']
                                    + "," + imuDic[peripheral.uuid]
                                    + "," + yprRecord['yaw']
                                    + "," + yprRecord['pitch']
                                    + "," + yprRecord['roll']
                                    + "," + yprRecord['rssi'] + "\n", function (err){
                      if (err) throw err;
                    });// Write the string to a file
                });
            });
        }
    });
  });
}

var connect = function(peripheral) {
  peripheral.connect(function(err) {
    console.log(imuDic[peripheral.uuid] + ": " + peripheral.state);
    streamData(peripheral);
  });

  peripheral.on('disconnect', function(err) {
    console.log(imuDic[peripheral.uuid] + ": " + peripheral.state);
    //if (peripheral.state == "connecting") {
    //  peripheral.disconnect();
    //  console.log("blah");
    //}

    connect(peripheral);
  });
}

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
  connect(peripheral);
  streamData(peripheral);
});
