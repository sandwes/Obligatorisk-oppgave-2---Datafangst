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
//måler pulsen og får en verdi
function measurePulse() {
    var value = b.analogRead(inputPin);

    // if (value > 0.5)
    //     return;

    if (isStart)
        setStart()
    else
        getBPM(value);
}

//setter starttid for måling
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

//bruker csv-writer for å skrive til csv-fil
function writeTemperatureToFile(temp) {
    temperatureCsvWriter.writeRecords([{count: count, temp: temp}]);
}

//funksjon for å finne termometeret
function locateThermometer()
{
  var initialDir = '/sys/bus/w1/devices/';
  var regExpr = '28-00000';
  var dir = [];
  var i;
  // Få alle filer og kataloger i dir
  var dirs = f.readdirSync(initialDir);
// Fikk vi noe - hvis ikke er cape manageren sannsynligvis ikke initialisert
// med det dtbo kompilerte enhetstreet
  if (dirs.length > 0)
  {
    for (i = 0; i < dirs.length; i++)
    {
      // Velger bare katalogene som samsvarer med mønsteret
      if(dirs[i].match(regExpr))
      {
        dir.push (dirs[i]);
      }
    }
    // Foreløpig har koden bare ett termometer
    oneWireDir = initialDir + dir + "/w1_slave";
  }
}
 

//funksjon for å lese tempen
function readTemp() 
{
  // Callback funksjon for timer
  b.readTextFile(oneWireDir, printTemp);
}
 
// Her må vi bruke en split for å hente ut verdien etter =
 
function printTemp(x) 
{
  // Henter data i x
  if (x.data != '')
  {
    var stringToSplit = x.data;
    // Split ved = tre strenger returneres
    var arrayOfStrings = stringToSplit.split('=');
    // Vi er kun interessert i det siste
    temp_c = (arrayOfStrings[2]) / 1000;
    console.log("Temp: " + temp_c);
writeTemperatureToFile(temp_c);
  }
}
 




main();

