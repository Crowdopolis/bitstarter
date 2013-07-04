/*var http             = require('http');
var mongo            = require('mongoose');
var mongoDB          = mongo.connection;


process.env.PORT     = undefined || 2020;
process.env.IP       = undefined || 'localhost';
process.env.userDB   = undefined || 'mongodb://' + process.env.IP + "/users-DEV";*/


/*
 Automatically grade files for the presence of specified HTML tags/attributes.
 Uses commander.js and cheerio. Teaches command line application development
 and basic DOM parsing.

 References:

 + cheerio
 - https://github.com/MatthewMueller/cheerio
 - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 - http://maxogden.com/scraping-with-node.html

 + commander.js
 - https://github.com/visionmedia/commander.js
 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
 - http://en.wikipedia.org/wiki/JSON
 - https://developer.mozilla.org/en-US/docs/JSON
 - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
 */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) {
    program
        .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

/*mongo.connect(process.env.userDB);

mongoDB.on('error',console.error.bind(console,'connection error:'));

// Master User Database Loop
mongoDB.once('open',function callback() {

    var userIDSchema = new mongo.Schema(
        {
            user            : {type : 'string', unique: true}, // e-mail address
            hash            : String,                          // hashed P/P password
            v_code          : String,                          // e-mail verification code
            v_date          : Date                             // date verified
        } ,
        {
            autoIndex : true
        }
    )

    var userIDModel = mongo.model('userID',userIDSchema);

    console.log("Connected to " + process.env.userDB+ " Ready to process user information" );

    var user  = new userIDModel({user:'todd.werelius@mopholo.com',hash:null,v_code:'',v_date:''});

    user.save(function(error){

        if (null == error)
            console.log("  Inserted " + user.user +"\n" );
        else
            console.log(" "+error.err); // 11000
    });
});*/



