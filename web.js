var express = require('express'),
    fs      = require('fs');

/*var index = fs.readFileSync('index.html');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World 2!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});*/

var http = require('http');
var fs = require('fs');
var sys = require('sys');

var port = process.env.PORT || 5000;

fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err;
    }
    http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    }).listen(port);
});