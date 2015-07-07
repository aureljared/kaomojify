/*
    Copyright (c) 2015 Aurel Jared Dantis <jareddantis@gmail.com>,
                  2013 Hunter Paolini <me@hpaolini.com>.

    This file is part of the Kaomojify project, which can be accessed
    at https://github.com/aureljared/kaomojify.
    The project is governed by the GNU General Public License, which can
    alse be found on the project page under the filename 'LICENSE.txt'.
*/

// TODO: temporary access

var tinyFilter = {
	 doc: document,
   detection: false,
   temp: [],
	 scan_site: function(exam, list){
		var l = list.length, that = this;
		var address = this.doc.location.href;
		while(l--){
			var found = address.indexOf(list[l]);
			if(found!==-1){
				if(exam===1){
					window.stop(); // remember, this loads on document_start
					that.action("Detected: \"" + list[l] + "\" in the address.");
				}
				that.detection = true;
				return;
			}
		}
	 },
   start: function(){
    if(!this.loaded){
			chrome.extension.sendRequest({name: "getPreferences"},
 				function(response){
  				tinyFilter.init(response);
					tinyFilter.start();
 				});
        return;
		}

		if(this.prefs.content_filter.enabled){
			this.scan_site(0, this.prefs.content_filter.trust.sites);

			if(!this.detection){
				if(this.prefs.content_filter.advanced.stop_all){
					window.stop();
					this.action("Reason: \"Stop all traffic\" is enabled.");
					this.detection = true;
					return;
				}
				this.scan_site(1, this.prefs.content_filter.block.sites);
			}
		}
   },
	 action: function(reason){
	  //better to block the page ASAP than waiting to redirect 
	  this.doc.documentElement.innerHTML = "<body><div id='tf_block' style='font:12px/17px Arial, sans-serif;border:1px solid #D2DBED;border-bottom-left-radius:6px 6px;border-top-left-radius:6px 6px;border-bottom-right-radius:6px 6px;border-top-right-radius:6px 6px;background-color:#F3F7FC;margin:30px auto;padding:7px 10px;width:80%;'><b>"+this.prefs.content_filter.advanced.warning+"</b></div></body>";

	  if(this.prefs.content_filter.advanced.reason){
	 	 this.doc.getElementById("tf_block").innerHTML += "<br/>"+unescape(reason);
	  }

	  if(this.prefs.content_filter.advanced.redirect){
			chrome.extension.sendRequest({name: "redirectPage"});
	  }
	 },
   init: function(response){
	 		this.prefs = response;
      this.loaded = true;
   }
};

chrome.extension.sendRequest({name: "getPreferences"},
function(response){
	tinyFilter.init(response);
	tinyFilter.start();
});
