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

var
    fs                 = require('fs'),
    program            = require('commander'),
    cheerio            = require('cheerio'),
    rest               = require('restler'),
    util               = require('util'),

    HTMLFILE_DEFAULT   = "index.html",
    CHECKSFILE_DEFAULT = "checks.json",

    colors = {
        reset   : '\033[0m',

        index   : [
            '\033[31m', // red
            '\033[32m', // green
            '\033[33m', // yellow
            '\033[34m', // blue
            '\033[35m'  // magenta
        ],

        RED     : 0,
        GREEN   : 1,
        YELLOW  : 2,
        BLUE    : 3,
        MAGENTA : 4
    }
; // EOV -- we use this style so that we can add vars quickly (, then new var)
  // and maintain formatting the EOV mark is just an "Eye Catcher"

// Simple support functions, we use the function name style so that we can call
// them from before or after they are declared, vs expression style
function printColor(msg,color) {
    console.log(colors.index[color] + msg + colors.reset);
}

function errorOut(msg) {
    printColor(msg,colors.RED);
}

function msgOut(msg) {
    console.log(msg);
}

var onErrorExit = function(msg) {
    errorOut(msg);
    program.help();
    process.exit(1);
};

var assertFileExists = function(infile,errMsg) {
    var instr = infile.toString();

    if(!fs.existsSync(instr)) {
        onErrorExit(errMsg + " " + instr);
    } else
        return instr;
};

// Overly simple but if we want to change later conforms to DRY
var resultsHandler = function(jsonResults) {
    msgOut(JSON.stringify(jsonResults, null, 4),colors.GREEN);
};

//
// Checks to see if an HTML document contains elements classes etc.
// results are passed to a results handler if present.
//
// pageBuffer a HTML document as a string
// checksFile a file name that contains a serialized array of elements
//            and classes to check for in pageBuffer
//
// Returns : jsonObject with form of name:boolean where name identifies
//           the element, class etc. being checked for, true if present
//           in the pageBuffer, false if missing
//
var checkPage = function(pageBuffer,checksFile,resultsHandler) {

    var
        pageDOM      = null,
        checksArray  = null,
        jsonResults  = {}

    ; // EOV

    try {

        pageDOM      = cheerio.load(pageBuffer);
        checksArray  = JSON.parse(fs.readFileSync(checksFile)).sort();

        // Newbies: for ... in will return an array's indice as the propertyName
        //          so it can be traversed just like a typcial Object
        for(var propertyName in checksArray) {
            jsonResults[checksArray[propertyName]] = (pageDOM(checksArray[propertyName]).length > 0);
        }

        // Optional handler to output results to console in this case, but you can pass
        // in any replacement handler that expects the jsonResults as a param
        if (resultsHandler) // Newbies: undefined or null will both evaluate to false
            resultsHandler(jsonResults);

    } catch (error) { // We should never get here, but it's better to format the result
                      // in my opinion than to just let the code chunk

        onErrorExit('\n  INTERNAL checkPage error ... someone deserves a spanking! : ' + error.name + ' ' + error.message);
    }

    return jsonResults;
}

var checkHtmlURL = function(URL, checksFile, resultsHandler) {

    var
        response   = null,
        jsonResult = null

    ; // EOV

    // Newbies: Take note the get(... method call will not block so this
    // function returns immediately, welcome to Asynchronous programming!
    response = rest.get(URL).on('complete',function(pageBuffer) {

        if (pageBuffer instanceof Error) {
            onErrorExit('\n  URL LOADING ERROR : ' + URL + " -> " + util.format(pageBuffer.message));
        } else if (!pageBuffer) {
            onErrorExit('\n  URL LOADING ERROR : ' + URL + " -> returned an undefined result");
        } else {
            jsonResult = checkPage(pageBuffer,checksFile,resultsHandler);
        }
    });


    // NEWBIES: DON'T DO THIS, it changes the Async model that node uses and will cause
    // you all kinds of grief! This just for demo to show how to properly yield in
    // a non-blocking way. 99% of the time you will never need to, you will just want to!
    //
    // Forgive me oh-mighty nodejs gods! ;^) ALSO CHECK OUT FIBERS AND FUTURES ...
    //
    //var intervalID = setInterval(function(){
    //    if (syncResult) {
    //        console.log("\nOne way to yield until we have the result from an asynch method!\n");
    //        clearInterval(intervalID);
    //    }
    //},500);

    return response; // Server header, may be useful in future (over design!)
};

var checkHtmlFile = function(htmlfile, checksFile,resultsHandler) {

    var
        pageBuffer = fs.readFileSync(htmlfile),
        jsonResult = checkPage(pageBuffer,checksFile,resultsHandler)

    ; // EOV
};

if(require.main == module) {

    program
        .option('-c, --checks <file>','Pattern file to use (default checks.json)',CHECKSFILE_DEFAULT)
        .option('-u, --url <url>'    ,'URL of web page to CHECK against pattern file')
        .option('-f, --file <file>'  ,'Local html file to CHECK against pattern file (default index.html)', HTMLFILE_DEFAULT)
        .parse(process.argv);

    // Make sure the checks file is present (required!)
    assertFileExists(program.checks,"\n  ERROR: Pattern file "+program.checks+" is missing");

    // It's not a URL it must be a HTML file on the disk
    if (!program.url) {

        assertFileExists(program.file,"\n  ERROR: Local HTML file "+program.file+" is missing");
        checkHtmlFile(program.file, program.checks, resultsHandler);
    }
    // Check the page found at program.url, this uses a callback to finish processing and return the result
    // to the console
    else {

        checkHtmlURL(program.url, program.checks, resultsHandler);
    }

} else {

    exports.checkHtmlFile = checkHtmlFile;
    exports.checkHtmlULR  = checkHtmlURL;

}

