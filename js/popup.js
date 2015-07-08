/*
    Copyright (c) 2015 Aurel Jared Dantis <jareddantis@gmail.com>,
                  2013 Hunter Paolini <me@hpaolini.com>.

    This file is part of the Kaomojify project, which can be accessed
    at https://github.com/aureljared/kaomojify.
    The project is governed by the GNU General Public License, which can
    alse be found on the project page under the filename 'LICENSE.txt'.
*/

function actionSite(id){
/* id = 0 --> block
			= 1 --> trust */
chrome.tabs.getSelected(null,function(tab){
	var background = chrome.extension.getBackgroundPage();
	window.close();
	background.popup.filter(id, tab);
});
}

var crxopts = 'chrome://extensions/?options=' + chrome.runtime.id;
window.addEventListener('DOMContentLoaded', function(e){
  document.getElementById("btn_ppbs").addEventListener("click", function(){
    actionSite(0);
  });
  document.getElementById("btn_ppts").addEventListener("click", function(){
    actionSite(1);
  });
  document.getElementById("btn_ppopt").addEventListener("click", function(){
    chrome.tabs.create({url:crxopts});
    window.close();
 });
});
