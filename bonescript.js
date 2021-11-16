const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const pulseCsvWriter = createCsvWriter({
    path: './pulse.csv',
    header: ['count', 'pulse'],
});

const temperatureCsvWriter = createCsvWriter({
    path: './temps.csv',
    header: ['count', 'temp'],
});

const timeout = 500; //tid mellom hver måling
const b = require('bonescript');
var f = require('fs');
const inputPin = "P9_40";

var bpm = 60;
var startTime = 0;
var isStart = true;
var temperature;
var oneWireDir;
var count = 0;

function main() {
    measurePulse();
    //measureTemps();
    locateThermometer();
    readTemp();
    console.log(count++);
    if (count > 100)
        end()
    setTimeout(main, timeout);
}

function end() {
    console.log("ferdig");
    throw new Error();
}

function measurePulse() {
    var value = b.analogRead(inputPin);

    // if (value > 0.5)
    //     return;

    if (isStart)
        setStart()
    else
        getBPM(value);
}

function setStart() {
    startTime = Date.now();
    isStart = false;
}

function getBPM(value) {
    //tid fra forrige hjerteslag til nåværende i sek
    var BPM = 60;
    var endTime = (Date.now() - startTime) * 0.001;
    startTime = Date.now(); //sett nåværende slag til siste slag


console.log("Puls" , bpm); 
   bpm = (bpm + (60/endTime))/2;
    writePulseToFile(bpm);
}

function writePulseToFile(pulse) {
    pulseCsvWriter.writeRecords([{count: count, pulse: pulse}]);
}

// kilde:
// 30 BeagleBone Black Projects for the Evil Genius - Christopher Rush - p. 138
// Project 11 - Temperature Sensor
//function measureTemps() {
  //  var value = b.analogRead(inputPin);
    //var millivolts = value * 1800; // ganger verdi med 1800 da beaglebone's analoge pins kan lese opp til 1.8v
   // var temp_c = convertMillivoltsToCelsius(millivolts);

    //writeTemperatureToFile(temp_c);
//}

// formel for å hente ut celsiustemperatur
//function convertMillivoltsToCelsius(millivolts) {
//    return (millivolts - 500) / 10;
//}

//bruker csv-writer for å skrive til csv-fil
function writeTemperatureToFile(temp) {
    temperatureCsvWriter.writeRecords([{count: count, temp: temp}]);
}


//////////////////////////////////


function locateThermometer()
{
  var initialDir = '/sys/bus/w1/devices/';
  var regExpr = '28-00000';
  var dir = [];
  var i;
  // Get all files and directories in the dir
  var dirs = f.readdirSync(initialDir);
  // Did we gat anything - if not the cape manager is probably not initialised
  // with the dtbo compiled device tree
  if (dirs.length > 0)
  {
    for (i = 0; i < dirs.length; i++)
    {
      // Only select the directories matching the pattern
      if(dirs[i].match(regExpr))
      {
        dir.push (dirs[i]);
      }
    }
    // Currently the code only accepts one thermometer
    oneWireDir = initialDir + dir + "/w1_slave";
  }
}
 
function readTemp() 
{
  // Callback function for the timer
  b.readTextFile(oneWireDir, printTemp);
}
 
// The 1-wire returs this when reading the device
// klaus@klaus-BBB:~$ cat /sys/bus/w1/devices/28-000005a7ce64/w1_slave 
// a5 01 4b 46 7f ff 0b 10 f7 : crc=f7 YES
// a5 01 4b 46 7f ff 0b 10 f7 t=26312
// Therefore a split is needed. We need the string after the second =
 
function printTemp(x) 
{
  // We receive the data i x
  if (x.data != '')
  {
    var stringToSplit = x.data;
    // Split at = - three resulting strings are returned
    var arrayOfStrings = stringToSplit.split('=');
    // We are only interesd in the last
    temp_c = (arrayOfStrings[2]) / 1000;
    console.log("Temp: " + temp_c);
writeTemperatureToFile(temp_c);
  }
}
 




main();

