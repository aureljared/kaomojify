/*
    Copyright (c) 2015 Aurel Jared Dantis <jareddantis@gmail.com>,
                  2013 Hunter Paolini <me@hpaolini.com>.

    This file is part of the Kaomojify project, which can be accessed
    at https://github.com/aureljared/kaomojify.
    The project is governed by the GNU General Public License, which can
    alse be found on the project page under the filename 'LICENSE.txt'.
*/

var KmBackground = {
	prefs: {
		content_filter : (function(){
			return (localStorage.getItem("content_filter")) ? JSON.parse(localStorage.getItem("content_filter")) : [];
		})(),
		profanity_filter : (function(){
			return (localStorage.getItem("profanity_filter")) ? JSON.parse(localStorage.getItem("profanity_filter")) : [];
		})()
	},
	prepareHash: function(list){
		var hashMap = {};
		var l = list.length;
		while (l--) {
			var keyword = list[l];
			if (keyword === undefined) {
				continue;
			}
			
			keyword = escape(keyword.toLowerCase());
			keyword = keyword.split("%20");
			if (keyword.length == 1){
				hashMap[keyword[0]]=1;
			} else {
				var j = keyword.length;
				var multi = "";
				while (j--) {
					var k = hashMap[keyword[j]];
					if (k === 1) {
						break;
					}
					if (j === 0) {
						if (k != undefined) {
							if(!this.isDuplicate(k, multi)){
								hashMap[keyword[0]].push(multi);
							}
						} else {
							hashMap[keyword[0]]=[multi];
						}
					} else {
						multi = (multi != "") ? keyword[j] + " " + multi:keyword[j];
						if (k != undefined){
							if(!this.isDuplicate(k, 0)){
								hashMap[keyword[j]].push(0);
							}
						} else {
							hashMap[keyword[j]] = [0];
						}
					}
				}
			}
		}

		return hashMap;
	},
	isDuplicate: function(arr, key){
 		var len = arr.length;
 		while(len--){
			if(arr[len] == key){
				return true;
			}
 		}
 		return false;
	},
	fixSettings: function(){
		if (localStorage.getItem('content_filter') == null){
			var default_lists = kaomojifyDefaults.content_filter;
			var content_filter = {
				enabled: true,
				advanced: {
					warning: "This page is unavailable due to policy restrictions.",
					stop_all: false,
					reason: true,
					redirect: ""
				},
				block: {
					sites: default_lists.block.sites,
					words: default_lists.block.words
				},
				trust: {
					sites: default_lists.trust.sites
				}
			};
			console.log(content_filter);
			localStorage.setItem('content_filter', JSON.stringify(content_filter));
			this.prefs.content_filter = content_filter;
		}

		if (localStorage.getItem('profanity_filter') == null){
			var default_lists = kaomojifyDefaults.profanity_filter;
			var profanity_filter = {
				enabled: true,
				words: default_lists.words
			};
			console.log(profanity_filter);
			localStorage.setItem('profanity_filter', JSON.stringify(profanity_filter));
			this.prefs.profanity_filter = profanity_filter;
		}

		if (localStorage.getItem('general_settings') == null){
			var general_settings = {
				password : {
					hash : ""
				}
			};
			localStorage.setItem('general_settings', JSON.stringify(general_settings));
		}
	},
	init: function(){
		//might as well as to run this sanity check to recover missing settings
		this.fixSettings();

		if(this.prefs.content_filter.advanced.redirect){
			this.prefs.content_filter.trust.sites = 
			this.prefs.content_filter.trust.sites.concat(this.prefs.content_filter.advanced.redirect.replace(/^https?:\/\//i,""));
		}

		this.prefs.hash_bw = this.prepareHash(KmBackground.prefs.content_filter.block.words);
		this.prefs.hash_pf = this.prepareHash(KmBackground.prefs.profanity_filter.words);
	}
};

KmBackground.init();

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse){
		switch (request.name){
			case "getPreferences":
				sendResponse(KmBackground.prefs);
				break;

			case "redirectPage":
				loadURI(sender.tab);
				break;

			default:
				break;
		}
	}
);

function loadURI(tab){
	var tabUrl = KmBackground.prefs.content_filter.advanced.redirect;
	chrome.tabs.update(tab.id, {url: tabUrl});
}
var popup = {
	getDomain: function(url){
		var link = document.createElement('a');
		link.href = url;
		return link.host.replace(/www\./i,'');
	},

	/*
		TODO: possibly join popup.filter() with onload event of options.html
			and use only one authentication check across the extension
	*/
	filter: function(action, tab){
		var domain=this.getDomain(tab.url);
			
		if(action === 0){
			var response = window.confirm("Block \""+domain+"\"?");
		}else{
			var response = window.confirm("Trust \"" + domain + "\"?");
		}
		if(response){
			var gs = JSON.parse(localStorage.getItem('general_settings'));
			if(gs.password.hash.length>0){
			var input = window.prompt("Please enter your password.", "");
				if(Crypto.SHA256(input) !== gs.password.hash){
					alert("Action denied: Password is incorrect.");
					return 0;
				}
			}
			var content_filter=KmBackground.prefs.content_filter;
			if(action === 0){
				content_filter.block.sites[content_filter.block.sites.length]=domain;
			}else if(action === 1){
				content_filter.trust.sites[content_filter.trust.sites.length]=domain;
			}
			localStorage.setItem('content_filter', JSON.stringify(content_filter));
			chrome.tabs.update(tab.id, {
				url: tab.url
			});
		}
	}
};
