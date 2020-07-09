const noble = require('../index');
const fs = require('fs')
const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const loc = 'office-desk-to-gw'

var min = 100
var max = -100
var avg = 0
var sum = 0
var count = 0
var lastTime = -1
var timeDeltaSum = 0
var avgTime = 0

//var numTestLocs = prompt('Enter number of test locations', 4)
//console.log('Entered ' + numTestLocs + ' test locations')
var testLoc = 1
var numTestLocs

async function getNumTestLocs() {
  await getNumTestLocs()
}
getNumTestLocs()

async function getNumTestLocsInput() {
  return new Promise(resolve, reject => {
    rl.question('Enter number of test locations', (numLocs) => {
      console.log('Entered ' + numLocs + ' test locations')
      numTestLocs = numLocs
      resolve(numLocs)
    })
  })
}

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning(['030400002aae4d26ad6203e9a8637ebd'], true);
  } else {
    noble.stopScanning();
  }
});

setInterval(() => {
//  var select = prompt('Move to next location? [y/n]', 'n')
  rl.question('Move to next location? [y/n]', (selection) => {
    console.log('selection + ' + selection)
  })
}, 1000)

noble.on('discover', function (peripheral) {
  console.log(`peripheral discovered (${peripheral.id} with address <${peripheral.address}, ${peripheral.addressType}>,
    connectable ${peripheral.connectable}, RSSI ${peripheral.rssi}:`);
  console.log('\thello my local name is:');
  console.log(`\t\t${peripheral.advertisement.localName}`);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log(`\t\t${JSON.stringify(peripheral.advertisement.serviceUuids)}`);

  const serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (const i in serviceData) {
      console.log(`\t\t${JSON.stringify(serviceData[i].uuid)}: ${JSON.stringify(serviceData[i].data.toString('hex'))}`);
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log(`\t\t${JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex'))}`);
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log(`\t\t${peripheral.advertisement.txPowerLevel}`);
  }

  if (peripheral.address !== undefined) {
    const mac = peripheral.address
    const name = peripheral.advertisement.localName
    const rssi = peripheral.rssi
    const date = new Date()
    const line = date.toISOString() + ', ' + date.getTime() + ', ' + mac + ', ' + name + ', ' + rssi + '\n'
    fs.appendFile(loc + '.txt', line, (err) => {
      if (err) {
        console.log('error writing line to file: ' + line)
      } else {
        console.log('wrote to file: ' + line)
      }
    })

    if (rssi < min) { min = rssi }
    if (rssi > max) { max = rssi }
    sum+=rssi
    count++ 
    avg = sum / count
    if (lastTime != -1) {
      const delta = date.getTime() - lastTime
      timeDeltaSum += delta
      avgTime = timeDeltaSum / count
    } 
      
    console.log('rssi stats: {avg: ' + avg + ', n: ' + count + ', min: ' + min + ', max: ' + max + ', range: ' + (max - min) + ', timeAvg: ' + avgTime + '}')
    console.log('timeDeltaSum: ' + timeDeltaSum + ', avgTime: ' + avgTime + ', lastTime: ' + lastTime)
    lastTime = date.getTime()
  }
  console.log();
});
