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
	var versionString = KmUiBackend.engine.version + ' build ' +  KmUiBackend.engine.build;
	if (gs.password.hash.length > 0) {
		var rClHandler = function(e){e.preventDefault();};
		document.addEventListener('contextmenu', rClHandler);
		$('#loginpage').fadeIn(2);
		$('#pwfield').slideDown();
		document.getElementById('validatePass').addEventListener('click', function(){
			var enteredPw = $('#pwentry #input').val();
			if (enteredPw != "" && enteredPw != null) {
				if (Crypto.SHA256(enteredPw) == gs.password.hash) {
					// Generate random placeholder password
					var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
					var text = "";
					for (var i = 0; i < enteredPw.length; i++) {
					    text += possible.charAt(Math.floor(Math.random() * possible.length));
					}
					KmUiDom.get("newpw").value = text;

					$('#loginpage').fadeOut(250);
					KmUiBackend.restoreOptions();
		 			document.getElementById('version').innerHTML = versionString;
		 			document.body.style.display = "block !important";
		 			document.removeEventListener('contextmenu', rClHandler);
				} else {
					$('#pwentry #input').val('');
					document.getElementById('logintitle').innerHTML = 'Incorrect password.';
					$('#logintitle').css('color', 'red');
					setTimeout(function(){
						document.getElementById('logintitle').innerHTML = 'Kaomojify is password protected.';
						$('#logintitle').css('color', 'black');
					}, 3000);
				}
			} else {
				$('#pwentry #input').val('');
				document.getElementById('logintitle').innerHTML = 'Password cannot be blank.';
				$('#logintitle').css('color', 'red');
				setTimeout(function(){
					document.getElementById('logintitle').innerHTML = 'Kaomojify is password protected.';
					$('#logintitle').css('color', 'black');
				}, 5000);
			}
		});
	} else {
		document.getElementById('version').innerHTML = versionString;
		KmUiBackend.restoreOptions();
 		document.body.style.display = "block !important";
	}
};

// Global vars
var password = null;

// UI/DOM manipulators
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
		remove.setAttribute('class', 'listsplice');
		remove.innerHTML = 'remove';
		el.innerHTML = keyword;
		KmUiDom.add(remove, el);
		KmUiDom.add(el, list);

		KmUiEvent.add(remove, 'click', function(e){
			var span = this.parentNode;
			var keyword = span.innerHTML.replace(/<(.*)?>/g,'');
			switch(span.parentNode.id){
				case "blocked_url":
					KmUiPref.removeKeyword(list_bs, keyword);
					break;
				case "blocked_word":
					KmUiPref.removeKeyword(list_bw, keyword);
					break;
				case "trusted_url":
					KmUiPref.removeKeyword(list_ts, keyword);
					break;
				case "profanity_word":
					KmUiPref.removeKeyword(list_pf, keyword);
					break;
				default:
					break;
			}
			KmUiDom.remove(span);
		});
	},
	addKeyword: function(list,kwtype) {
		var targetDiv;
		if (list == "list_bs")
			targetDiv = 'blocked_url';
		else if (list == "list_ts")
			targetDiv = 'trusted_url';
		else if (list == "list_bw")
			targetDiv = 'blocked_word';
		else
			targetDiv = 'profanity_word';

		var addToList = function() {
			var targetList = window[list];
			var keyword = $('#keyword_cf #input').val();
			if (keyword.length > 0) {
				keyword = keyword.replace(/<(.|\n)+?>/g,'');
				targetList[targetList.length] = keyword;			
				KmUiPref.populateList(targetDiv, keyword);
			}
			KmUiEvent.closeDialog(null);
		};

		KmUiEvent.openDialog('Add '+kwtype, (function(){
			var inputDiv = document.createElement('div');
			inputDiv.className = 'keywordform';
			var inputForm = document.createElement('paper-input');
			inputForm.setAttribute('id', 'keyword_cf');
			inputForm.setAttribute('label', 'What should we add?');
			inputDiv.appendChild(inputForm);
			return inputDiv;
		})(), function(){return}, addToList, 'add');
	},
	removeKeyword: function(list,word) {
		var len = list.length;
		while (len--) {
			if(list[len] == word)
				list.splice(len,1);
		}
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
	 	KmUiDom.get("adv_redirect").checked = cf.advanced.redirectstatus || false;
	 	if (KmUiDom.get("adv_redirect").checked) {
	 		$('#redirfield').slideDown(250);
	 	}
	 	KmUiDom.get("val_redirect").value = cf.advanced.redirect;
		
		var pf = JSON.parse(localStorage.getItem('profanity_filter'));
		KmUiDom.get("pf_status").checked = pf.enabled || false;
		
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
		KmUiEvent.openDialog('Reset Kaomojify?', '<h4>This cannot be undone!</h4>', function(){
			// do nothing
		}, function(){
			$('#dialog-buttons').fadeOut({
				duration: 100,
				start: function(){
					$('#header').fadeOut(100);
					$('#fab').fadeOut(100);
					$('#content').fadeOut(100);
				}
			});
			KmUiDom.get('dialog-title').innerHTML = 'Resetting Kaomojify'
			KmUiDom.get('dialog-body').innerHTML = 'Please wait...'
			localStorage.removeItem('general_settings');
			localStorage.removeItem('content_filter');
			localStorage.removeItem('profanity_filter');
			setTimeout(function(){
				KmUiEvent.closeDialog(function(){setTimeout(function(){
					chrome.extension.getBackgroundPage().KmBackground.init();
					window.location.reload();
				},1);});
			}, 1000);
		}, 'confirm');
	},
	saveOptions: function(){
		var content_filter = {
			enabled : KmUiDom.get("cf_status").checked,
			advanced : {
				warning : KmUiDom.get("adv_warning").value || "This page is unavailable due to policy restrictions.",
				stop_all : KmUiDom.get("adv_stop").checked,
				reason : KmUiDom.get("adv_reason").checked,
				redirectstatus : KmUiDom.get("adv_redirect").checked,
				redirect : (function(){
					var adv_redirect = $('#val_redirect #input').val() || "",
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

		//reference to background.html
		var bg = chrome.extension.getBackgroundPage().KmBackground;

		var general_settings = {
			password : {
				hash : (KmUiDom.get('pwd_status').checked) ? password : ""
			}
		};
		
		localStorage.setItem('content_filter', JSON.stringify(content_filter));
		localStorage.setItem('profanity_filter', JSON.stringify(profanity_filter));
		localStorage.setItem('general_settings', JSON.stringify(general_settings));
		
		KmUiEvent.toast('Preferences saved.');

		//update background.html settings
		bg.prefs.content_filter = content_filter;
		bg.prefs.profanity_filter = profanity_filter;
		bg.init();
	},
	setPassword: function(){
		var pwPlaintext = $('#pwfield #input').val();
		password = Crypto.SHA256(pwPlaintext);
		KmUiEvent.toast('Password successfully set.');
		KmUiBackend.saveOptions();
	},
	engine: {
		"version": "0.2",
		"build": "070915"
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
	},
	openDialog: function(title,body,complete,positive,confirm){
		KmUiDom.get('dialog-yes').innerHTML = confirm;
		KmUiEvent.click('dialog-yes', positive);
		KmUiEvent.click('dialog-no', KmUiEvent.closeDialog);
		$('#dialog-ui').fadeIn(250);
		$('#dialog-bg').fadeIn(250);
		$('#dialog').fadeIn(250);
		KmUiDom.get('dialog-title').innerHTML = title;
		if (typeof(body) == "object") {
			KmUiDom.get('dialog-body').innerHTML = '';
			KmUiDom.get('dialog-body').appendChild(body);
		}
		else
			KmUiDom.get('dialog-body').innerHTML = body;
		
		if (complete == null)
			return true;
		else
			complete();
	},
	closeDialog: function(action){
		$('#dialog').fadeOut(250);
		$('#dialog-bg').fadeOut(250);
		$('#dialog-ui').fadeOut(250);
		if (action == null)
			return true;
		else
			action();
	}
};
KmUiEvent.add(document, 'DOMContentLoaded', function(){
	KmUiEvent.click('pwd_status', function(){KmUiDom.toggle('#pwfield');});
	KmUiEvent.click('adv_reason', function(){KmUiDom.toggle('#reasonfield');});
	KmUiEvent.click('adv_redirect', function(){KmUiDom.toggle('#val_redirect');});
	KmUiEvent.click('lst_bs', function(){KmUiDom.toggle('#siteblacklist');});
	KmUiEvent.click('lst_ts', function(){KmUiDom.toggle('#sitewhitelist');});
	KmUiEvent.click('lst_bk', function(){KmUiDom.toggle('#wordblacklist');});
	KmUiEvent.click('lst_pf', function(){KmUiDom.toggle('#profanitylist');});
	KmUiEvent.click('btn_reset', function(){KmUiBackend.resetOptions();});
	KmUiEvent.click('setpass', function(){KmUiBackend.setPassword();});
	KmUiEvent.click('btn_save', function(){KmUiBackend.saveOptions();});
	KmUiEvent.click('bitcoin', function(){KmUiDom.toggle('#btc');});
	$('paper-button#addbtn').click(function(){KmUiPref.addKeyword($(this).attr('target-list'), $(this).attr('keyword-type'));});
});
