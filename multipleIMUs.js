


var noble = require('noble');
var fs = require('fs');

var imuDic =  {'9f3f64afce1545b5b1ce67a082075aeb' : 'Bohr',
               'e0bee4423f2c' : 'Bohr',
               '40028eb548474d8d9b0b5c0d9c3a8350' : 'Einstein',
                'de6d99f99c47' : 'Einstein',
                'fc56643e9ccb4cd3812bcfe242176b92' : 'Feynman',
                '25e56abeb25444ae9851c1f90efc4214' : 'Avogadro',
                '5a0bb4a4562d4f60ac169f7c2b614047' : 'Kirchhoff',
                }




filename = "nodeData/ypr_" + Date.now() + ".csv";
filename = "nodeData/ypr.csv";
fs.appendFile(filename, "timestamp, IMU, yaw, pitch, roll,rssi\n", function (err){if (err) throw err;});

logfile = 'logfile';


var state = 'poweredOn';


var NORDIC_NRF8001_SERVICE_UART = '6e400001b5a3f393e0a9e50e24dcca9e'; // Custom UART service
var NORDIC_NRF8001_CHAR_TX      = '6e400002b5a3f393e0a9e50e24dcca9e'; // Write
var NORDIC_NRF8001_CHAR_RX      = '6e400003b5a3f393e0a9e50e24dcca9e'; // Read



var streamData = function(peripheral) {
  peripheral.discoverSomeServicesAndCharacteristics([],[NORDIC_NRF8001_CHAR_TX,NORDIC_NRF8001_CHAR_RX],function(error, services, characteristics){

    characteristics.forEach(function(characteristic) {
        console.log('found characteristic:', characteristic.uuid);

        if (characteristic.uuid == NORDIC_NRF8001_CHAR_RX) {
            //console.log(characteristic);
            //console.log("blah1");
            characteristic.notify(true,function(err){

              if (err){
                peripheral.disconnect();
                console.log("blah2");
              }

              console.log(peripheral.uuid);
              p_name = imuDic[peripheral.uuid];

              //if (imuDic[peripheral.uuid] == 'undefined'){
                //p_name = imuDic[peripheral.uuid];
              //  console.log(peripheral.uuid);
              //  p_name = peripheral.uuid;
              //  }

              //else {
              //  p_name = imuDic[peripheral.uuid];
              //  console.log(imuDic[peripheral.uuid])
              //  console.log("blah3");
              //  }

              fs.appendFile(logfile, Date.now() + "," +  "characteristics RX notify : reading " +
p_name + "\n");
              console.log('characteristics RX notify : reading ' +
p_name);



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

                    fs.appendFile(filename, yprRecord['timestamp']
                                    + "," + imuDic[peripheral.uuid]
                                    + "," + yprRecord['yaw']
                                    + "," + yprRecord['pitch']
                                    + "," + yprRecord['roll']
                                    + "," + yprRecord['rssi'] + "\n", function (err){
                      if (err) throw err;
                    });
                });
            });
        }

    });
  });
}



noble.on('stateChange', function(state) {
  if (state == 'poweredOn') {
    //
    // Once the BLE radio has been powered on, it is possible
    // to begin scanning for services. Pass an empty array to
    // scan for all services (uses more time and power).
    //

    fs.appendFile(logfile, Date.now() + " start scanning\n")
    console.log('scanning...');
    noble.startScanning([NORDIC_NRF8001_SERVICE_UART], false);


  }
  else {
    noble.stopScanning();
    fs.appendFile(logfile, Date.now() +  "stop scanning\n")

  }
})




noble.on('discover', function(peripheral) {

  peripheral.connect(function(err) {
    fs.appendFile(logfile, Date.now() + "," + imuDic[peripheral.uuid] + "," + peripheral.state + "\n")
    console.log(imuDic[peripheral.uuid] + ": " + peripheral.state);
    streamData(peripheral);

    if (err) {
      console.log("error");
    }
  });

  peripheral.on('disconnect', function(err) {
    fs.appendFile(logfile, Date.now() + "," + imuDic[peripheral.uuid] + "," + peripheral.state + "\n")
     console.log(imuDic[peripheral.uuid] + ": " + peripheral.state);
     peripheral.connect(function(err) {
       fs.appendFile(logfile, Date.now() + "," + imuDic[peripheral.uuid] + "," + peripheral.state + "\n")
       console.log(imuDic[peripheral.uuid] + ": " + peripheral.state);

       streamData(peripheral);
    });
  });
});
