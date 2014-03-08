gallery2disk
============

To download and get dependencies : 

	git clone https://github.com/StellaCannefax/gallery2disk.git
	cd gallery2disk
	npm install


These 2 scripts will, in tandem, find all galleries on a given page that lists them, then download them all.  Run 'find_galleries.js' first.

This is an example of a scraper built for a specific site, not a framework of any sort. 

The example website uses cookies to handle auth for content requests, which the script handles.  In addition, the script uses a random user agent for every request after the beginning URL - all of these details are set in the config.json file.
