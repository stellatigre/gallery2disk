var async   = require('async'),			
    fs      = require('fs'),
    cheerio = require('cheerio'),
    req     = require('request'),
    galleries = require('./galleries.json'), //run scraper.js first to make this file
    conf    = require('./config.json');

var cookieJar = req.jar();		// Example uses a wordpress cookie for this stuff
var cookie = req.cookie(conf.cookie);
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
				'encoding' :'binary',
				'jar' : cookieJar
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
        'url' : conf.domain+gallery.replace(/\/$/, '-2/'), // again, site-specific path mangling
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
                
