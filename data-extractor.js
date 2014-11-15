var fs = require('fs')
var htmlparser = require('htmlparser2')
var europa = require('./EuropaParser')
var europacvs = require('./EuropaCVS')

var eup = new europa();

var input_file = process.argv[2];
var format_file = process.argv[3];
var output_file = process.argv[4];

var format = europacvs.parseFormatFile(format_file);

try {
  var parser = new htmlparser.Parser({
    onopentag: function(name, attr) {
      eup.onopentag(name, attr)
    },
    ontext: function(text) {
      eup.ontext(text)
    },
    onclosetag: function(name) {
      eup.onclosetag(name)
    },
    onend: function() {
      //console.log(eup.json)
      // Så har vi json - så kan vi lave noget nice cvs-fittelihøj
      europacvs.toCVS(format, eup.json)
    }
  })

  fs.createReadStream(input_file, {encoding: 'utf8'}).pipe(parser)
} catch (e) {
  console.log("ERROR in "+input_file+": ", e)
}
