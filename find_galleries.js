// This script finds galleries in a website based on a regular expression in the URLs.  
// Run it first - works for any website with regular URLs that's organized by gallery ( a lot of them). 
// Obviously, the regex has to be changed for each site.
var fs      = require('fs'),
    cheerio = require('cheerio'),
    req     = require('request'),
    conf    = require('./config.json'); 

// change this to suit your site
var galleryRgx = /^\/[a-zA-Z0-9 \-]{2,20}\/?$/	
var galleries = [];    

req.get(conf.startUrl, function(err, res, body) { // make our request for the startUrl
    if (err) throw err;
    var $ = cheerio.load(body);
    var aTags = $('a');			// cheerio uses jQuery selector syntax

    for (var i=0 ; i < aTags.length; i++) {
        var href = aTags[i].attribs.href;
        if (galleryRgx.test(href)) { galleries.push(href); } // test each link  by regex
    }
   
    console.log(galleries, galleries.length+' galleries found.\n');	 // store relative URLs of galleries,
    fs.writeFileSync(conf.jsonStore, JSON.stringify(galleries)); // to be consumed by download.js
});


