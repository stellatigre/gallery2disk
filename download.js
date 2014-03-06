// This script handles the parsing of the galleries for image links
// as well as the creation of folders and files from the pages
var async   = require('async'),			
    fs      = require('fs'),
    cheerio = require('cheerio'),
    req     = require('request'),
    conf    = require('./config.json'),
    galleries = require(conf.jsonStore), //run scraper.js first to make this file
    cookieJar = req.jar(),		// Example uses a wordpress cookie for this stuff
    cookie = req.cookie(conf.cookie);

cookieJar.setCookie(cookie, conf.domain);  

// Regex to find the large pictures linked to by the gallery, NOT the thumbnails
var picRegex = /gallery\/p[0-9]{6,8}\.jpg$/

for (var i=0 ; i < galleries.length ; i++) {

    var gallery = galleries[i];    
   
    // this function take a URL for a downloadable file  
    var download = function(fileUrl) {

    // This is some path / filename mangling specific to my example site.  
    // It makes correct folders (by gallery) and filenames.
    var folder = fileUrl.substring(fileUrl.indexOf('gallery/')+7);
    folder = '.'+folder.slice(0, folder.lastIndexOf('/'))+'/';
        
var fileName = fileUrl.substring(fileUrl.lastIndexOf('/')+1);
		
console.log(folder,fileName); // fun to watch stream everything by and useful during dev
        
	// This is the part that handles the actual downloading.
    req.get({
	'url' : fileUrl, 
	'encoding' :'binary',  // specifying this encoding is necessary here.
	'jar' : cookieJar,
	'headers': {		// pick random user agent
        'User-Agent': conf.userAgents[Math.floor(Math.random() * (1 + conf.userAgents.length))]
    	}	
    }, 
	function (err, res, body) { 
        	if (!fs.existsSync(folder)) { fs.mkdirSync(folder); } // checks for existing folders/files
            	if (!fs.existsSync(folder+fileName)) {   
               		fs.writeFile(folder+fileName, body, 'binary', function(err) {
                            if(err) console.log(err);
                            else console.log(folder+fileName+" saved.");
                });
            }
        });
    }

    var pictures = [];
    
    req.get({
        'url' : conf.domain+gallery.replace(/\/$/, '-2/'), // again, site-specific URL mangling
        'jar' : cookieJar 								  // use our cookie
        },
        function(err, res, body) {
            if (err) throw err;
            var $ = cheerio.load(body);		// cheerio parses our response body
            var aTags = $('a');				// get all <a>'s
            
            for (var i=0 ; i < aTags.length; i++) {
                var href = aTags[i].attribs.href;
                if (picRegex.test(href)) { pictures.push(href); } // test each link for regex match
            }
            
            console.log(pictures); 
            async.each(pictures, download, function(err) { console.log(err) ; }); // download() every picture link     
        }
    );
}
                
