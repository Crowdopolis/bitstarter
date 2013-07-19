var express = require('express'),
    fs      = require('fs');

var app   = express.createServer(express.logger());
var index = null;

app.use(express.static('./public'));

app.get('/', function(request, response) {
      if (null === index)
          index = fs.readFileSync('index.html').toString();
      response.send(index);
});

var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log("Listening on " + port);
});


