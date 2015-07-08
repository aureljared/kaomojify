/*
    Copyright (c) 2015 Aurel Jared Dantis <jareddantis@gmail.com>,
                  2013 Hunter Paolini <me@hpaolini.com>.

    This file is part of the Kaomojify project, which can be accessed
    at https://github.com/aureljared/kaomojify.
    The project is governed by the GNU General Public License, which can
    alse be found on the project page under the filename 'LICENSE.txt'.
*/

// TODO: Use this in place of old 'options.js'

window.onload = function(){
	var gs = JSON.parse(localStorage.getItem('general_settings'));
	if(gs.password.hash.length>0){
		var input = window.prompt("Please enter your password.", "");
		if(input != null && Crypto.SHA256(input) === gs.password.hash){
 			restore_options();
 			document.body.style.display = "block !important";
		}else{
 			document.body.innerHTML="Access denied: Password is incorrect.";
 			document.body.style.display = "block !important";
 			while(document.getElementsByTagName('script').length>0){
	 			document.head.removeChild(document.getElementsByTagName('script')[0]);
 			}
		}
	}else{
		KmUiBackend.restoreOptions();
 		document.body.style.display = "block !important";
	}
	document.getElementById('version').innerHTML = '0.1 (0708-005)';
};

// Global vars
var password = null;

// Control UI
var KmUiDom = {
	get: function(el) {
		if(typeof el === 'string'){
			return document.getElementById(el);
		}else{
			return el;
		}
	},
	add: function(el, dest) {
		var el = this.get(el);
		var dest = this.get(dest);
		dest.appendChild(el);
	},
	remove: function(el) {
		var el = this.get(el);
		el.parentNode.removeChild(el);
	},
	toggle: function(el) { $(el).slideToggle(250); }
}
var KmUiPref = {
	populateList: function(list,keyword){
		var el = document.createElement('p');
		var remove = document.createElement('span');
		remove.setAttribute('class', 'link');
		remove.innerHTML = '[x]';
		el.innerHTML = keyword;
		KmUiDom.add(remove, el);
		KmUiDom.add(el, list);

		KmUiEvent.add(remove, 'click', function(e){
			var span = this.parentNode;
			var keyword = span.innerHTML.replace(/<(.*)?>/g,'');
			switch(span.parentNode.id){
				case "blocked_url":
					removeKeyword(list_bs, keyword);
					break;
				
				case "blocked_word":
					removeKeyword(list_bw, keyword);
					break;
				
				case "trusted_url":
					removeKeyword(list_ts, keyword);
					break;
				
				case "profanity_word":
					removeKeyword(list_pf, keyword);
					break;
				
				default:
					break;
			}
			KmUiDom.remove(span);
		});
	}
};

// Settings behind the scenes
var KmUiBackend = {
	restoreOptions: function(){
		var cf = JSON.parse(localStorage.getItem('content_filter'));
		KmUiDom.get("cf_status").checked = cf.enabled || false;
		KmUiDom.get("adv_stop").checked = cf.advanced.stop_all || false;
	 	KmUiDom.get("adv_reason").checked = cf.advanced.reason || false;
	 	KmUiDom.get("adv_warning").value = cf.advanced.warning;
	 	KmUiDom.get("adv_redirect").value = cf.advanced.redirect;
		
		var pf = JSON.parse(localStorage.getItem('profanity_filter'));
		KmUiDom.get("pf_status").checked = pf.enabled || false;
		
		var ls = JSON.parse(localStorage.getItem('subscriptions'));
		KmUiDom.get("ls_status").checked = ls.enabled || false;
		$('#ls_url #input').val(ls.url || "");
		
		var gs = JSON.parse(localStorage.getItem('general_settings'));
		password = gs.password.hash;
		KmUiDom.get("pwd_status").checked = (gs.password.hash.length>0) ? true : false;
		if (KmUiDom.get("pwd_status").checked) {
			$('#password_bool').slideDown(250);
		};
		
		list_bs = cf.block.sites || [];
		list_bw = cf.block.words || [];
		list_ts = cf.trust.sites || [];
		list_pf = pf.words || [];
		
		var i=0, l=Math.max(list_bw.length, list_pf.length, list_bs.length, list_ts.length);
		while(i<l){
			var l1 = list_bw[i], l2 = list_pf[i], l3 = list_bs[i], l4 = list_ts[i];
			if(l1){ KmUiPref.populateList('blocked_word',l1); }
			if(l2){ KmUiPref.populateList('profanity_word',l2); }
			if(l3){ KmUiPref.populateList('blocked_url',l3); }
			if(l4){ KmUiPref.populateList('trusted_url',l4); }
			i++;
		};
	},
	resetOptions: function(){
		var x = window.confirm("Are you sure you want to reset the settings?");
		if(x){
			localStorage.removeItem('general_settings');
			localStorage.removeItem('content_filter');
			localStorage.removeItem('profanity_filter');
			localStorage.removeItem('subscriptions');
			chrome.extension.getBackgroundPage().kaomojify_bg.init();
			window.location.reload();
		}
	},
	saveOptions: function(){
		var content_filter = {
			enabled : KmUiDom.get("cf_status").checked,
			advanced : {
				warning : KmUiDom.get("adv_warning").value || "This page is unavailable due to policy restrictions.",
				stop_all : KmUiDom.get("adv_stop").checked,
				reason : KmUiDom.get("adv_reason").checked,
				redirect : (function(){
					var adv_redirect = KmUiDom.get("adv_redirect").value || "",
							regex = /^(https?|ftp|file):\/\/.+$/i;
					if(adv_redirect.length > 0 && !regex.test(adv_redirect)){
						adv_redirect = "http://" + adv_redirect;
					}
					return adv_redirect;
				})()
			},
			block : {
				sites : list_bs,
				words : list_bw
			},
			trust	:	{
				sites : list_ts
			}
		};

		var profanity_filter = {
			enabled : KmUiDom.get("pf_status").checked,
			words : list_pf
		};

		var subscriptions = {
			enabled : KmUiDom.get("ls_status").checked,
			url : KmUiDom.get("ls_url").value,
			content_filter : {
				block : {},
				trust : {}
			},
			profanity_filter : {}
		};

		//reference to background.html
		var bg = chrome.extension.getBackgroundPage().kaomojify_bg;

		if(subscriptions.url.length > 0){
			if(subscriptions.url != bg.prefs.subscriptions.url){
				var response = bg.loadSubscription(subscriptions.url);
				if(response){
					subscriptions.content_filter.block.sites = (response.content_filter.block.sites) ? response.content_filter.block.sites : [];
					subscriptions.content_filter.block.words = (response.content_filter.block.words) ? response.content_filter.block.words : [];
					subscriptions.content_filter.trust.sites = (response.content_filter.trust.sites) ? response.content_filter.trust.sites : [];
					subscriptions.profanity_filter.words = (response.profanity_filter.words) ? response.profanity_filter.words : [];
					subscriptions.last_update = new Date().getTime();
					//alert(subscriptions.last_update);
				}else{
					subscriptions.enabled = false;
				}
			}else{
				subscriptions.content_filter.block.sites = bg.prefs.subscriptions.content_filter.block.sites;
				subscriptions.content_filter.block.words = bg.prefs.subscriptions.content_filter.block.words;
				subscriptions.content_filter.trust.sites = bg.prefs.subscriptions.content_filter.trust.sites;
				subscriptions.profanity_filter.words = bg.prefs.subscriptions.profanity_filter.words;
				subscriptions.last_update = (bg.prefs.subscriptions.last_update) ? bg.prefs.subscriptions.last_update : new Date().getTime();
			}
		}else{
			subscriptions.enabled = false;
		}

		var general_settings = {
			password : {
				hash : (KmUiDom.get('pwd_status').checked) ? password : ""
			}
		};
		
		localStorage.setItem('content_filter', JSON.stringify(content_filter));
		localStorage.setItem('profanity_filter', JSON.stringify(profanity_filter));
		localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
		localStorage.setItem('general_settings', JSON.stringify(general_settings));
		
		//update background.html settings
		bg.prefs.content_filter = content_filter;
		bg.prefs.profanity_filter = profanity_filter;
		bg.prefs.subscriptions = subscriptions;
		bg.init();
	},
	setPassword: function(){
		var pwPlaintext = $('#reasonfield #input').val();
		password = Crypto.SHA256(pwPlaintext);
		KmUiEvent.toast('Password successfully set.')
	}
};

// Hide/show stuff
var KmUiEvent = {
	add: function(){
		if (window.addEventListener) {
			return function(el,type,fn){ KmUiDom.get(el).addEventListener(type, fn, false); };
		} else if (window.attachEvent) {
			return function(el,type,fn) {
				var f = function(){
					fn.call(Dom.get(el), window.event);
				};
				Dom.get(el).attachEvent('on' + type, f);
			};
		}
	}(),
	click: function(id,toggleFn){ KmUiEvent.add(id,'click',toggleFn); },
	toast: function(message){
		$('#status').attr('text', message);
		document.querySelector('#status').show();
	}
};
KmUiEvent.add(document, 'DOMContentLoaded', function(){
	KmUiEvent.click('pwd_status', function(){KmUiDom.toggle('#pwfield');});
	KmUiEvent.click('adv_reason', function(){KmUiDom.toggle('#reasonfield');});
	KmUiEvent.click('adv_redirect', function(){KmUiDom.toggle('#redirfield');});
	KmUiEvent.click('lst_bs', function(){KmUiDom.toggle('#siteblacklist');});
	KmUiEvent.click('lst_bk', function(){KmUiDom.toggle('#wordblacklist');});
	KmUiEvent.click('lst_pf', function(){KmUiDom.toggle('#profanity_word');});
	KmUiEvent.click('ls_status', function(){KmUiDom.toggle('#listfield');});
	KmUiEvent.click('btn_reset', function(){KmUiBackend.resetOptions();});
	KmUiEvent.click('setpass', function(){KmUiBackend.setPassword();});
	KmUiEvent.click('btn_save', function(){KmUiEvent.toast('Preferences saved.');});
	KmUiEvent.click('bitcoin', function(){KmUiEvent.toast('Coming soon!');});
});
