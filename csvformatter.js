module.exports = {toCVS: __toCVS, parseFormatFile: __parseFormatFile}

const SEPARATOR = "|"; // NO, we don't support custom separators... yet

var fs = require('fs')

function __toCVS(format, json) {  
  var output = '';
  for (f in format) {
    var sep = (output) ? SEPARATOR : '';
    
    var val = json[f] || json[format[f].alternatekey] || ''
    
    if (format[f].format === 'BooleanList') {
      var values = {};
      val.forEach(function(v) {
        values[v] = 1;
      })
      output += sep + format[f].subtitles.map(function(sb) {
        return values[sb] ? 1 : 0
      }).join(SEPARATOR);
    } else {
      output += sep + val;
    }
  }
  console.log(output)
}

function __parseFormatFile(format_file) {
  var data = fs.readFileSync(format_file, {encoding: 'utf8'});
  return JSON.parse(data)
}


// is this a independent program or not?
if (process.argv[1].indexOf('EuropaCVS.js') >= 0) {
  main(process.argv[2])
} 

// main program. Initiates titles
function main(format_file) {
  var format = __parseFormatFile(format_file);
  
  var output = '';
  for (f in format) {
    var sep = (output) ? SEPARATOR : '';
    var obj = format[f]
    
    if (typeof obj === 'string') {
      output += sep + obj
    } else if (obj.subtitles) {
      obj.subtitles.forEach(function (t) {
        output += sep + obj.title + t;
      });
    } else {
      output += sep + obj.title;
    }
  }
  
  console.log(output)
}
