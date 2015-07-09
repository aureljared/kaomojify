/*
    Copyright (c) 2015 Aurel Jared Dantis <jareddantis@gmail.com>,
                  2013 Hunter Paolini <me@hpaolini.com>.

    This file is part of the Kaomojify project, which can be accessed
    at https://github.com/aureljared/kaomojify.
    The project is governed by the GNU General Public License, which can
    alse be found on the project page under the filename 'LICENSE.txt'.
*/
kaomojify.punctuation = new RegExp(/[\s+\u0021-\u0023\u0025-\u002A\u002C-\u002F\u003A\u003B\u003F\u0040\u005B-\u005D\u005F\u007B\u007D\u00A1\u00AB\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0964\u0965\u0970\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u104A-\u104F\u10FB\u1361-\u1368\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u19DE\u19DF\u1A1E\u1A1F\u1B5A-\u1B60\u1C3B-\u1C3F\u1C7E\u1C7F\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2E00-\u2E2E\u2E30\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA60D-\uA60F\uA673\uA67E\uA874-\uA877\uA8CE\uA8CF\uA92E\uA92F\uA95F\uAA5C-\uAA5F\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/);

kaomojify.searchHash = function(t, H){
	//var k=t.match(/\w+/g); //useless for unicode characters
	var k=t.split(this.punctuation), that = this;
	if(k!==null){
		var l=k.length;
		while(l--){
			var keyword=escape(k[l]);
			if(keyword.length===0)
				continue;

			var m = H[keyword];
			if(m===undefined){
				that.temp = [];
				continue;
			}

			if(m===1){
				return keyword;
			}else{
				var i=m.length;
				/*reverse look-up best
					to add |keyword| to |temp|
					when |m[i]==0| -- which occurs
					when |i==m.length-1|*/
				while(i--){
					if(m[i]===0){
						that.temp[that.temp.length]=keyword;	
					}else{
						var c = that.temp.reverse().join(" ");
						//alert(keyword+"=>"+temp+": "+ c + ": " +m[i]+", "+c.indexOf(m[i]));
						if(c.indexOf(m[i])===0){
							return keyword+" "+m[i];
						}
					}
				}
			}
		}
	}
	return false;
};

kaomojify.content_scan= function(list){
 var that = this;
 function F(n, t){
 	if(that.detection || n===null)
		return;

  if(n.nodeType === 3 || t === "TITLE"){
   	node = (t!=="TITLE")?n.data:n; 
    var u = that.searchHash(node.toLowerCase(), list);
		if(u){
			window.stop();
     	that.action("Detected: \""+u+"\" in the <code>"+t+"</code> of the document.");
			that.detection = true;
    }
  }else if(n.tagName != "STYLE" && n.tagName != "SCRIPT"){
		var i=n.childNodes, l=i.length; while(l--){F(i[l], t);}
	}
 }
 F(that.doc.title, "TITLE");
 F(that.doc.body, "BODY");
};

kaomojify.content_start= function(){
 if(!this.loaded){
	chrome.extension.sendRequest({name: "getPreferences"},
 	 function(response){
  	kaomojify.init(response);
		kaomojify.content_start();
 	});
	return;
 }

 if(this.prefs.content_filter.enabled){
	this.content_scan(this.prefs.hash_bw);
 }

 if(this.prefs.profanity_filter.enabled){
	this.profanity_content_scan(this.prefs.hash_pf);
 }
};

kaomojify.searchHash2 = function(t, H){
	var k=t.split(this.punctuation), reg=[], that=this;
	if(k!==null){
		var l=k.length;
		while(l--){
			var keyword=escape(k[l]);
			if(keyword.length===0)
				continue;

			var m = H[keyword];
			if(m===undefined){
				that.temp = [];
				continue;
			}

			if(m===1){
				reg[reg.length]=keyword;
			}else{
				var i=m.length;
				while(i--){
					if(m[i]===0){
						that.temp[that.temp.length]=keyword;	
					}else{
						var c = that.temp.reverse().join(" ");
						if(c.indexOf(m[i])===0){
							reg[reg.length]=keyword+" "+m[i];
							break;
						}
					}
				}
			}
		}
	}
	return (reg.length>0)?reg.join("|"):false;
};

kaomojify.generateRandomIndex = function(max){
	var seed = Math.random() * max;
	seed = seed - (seed % 1);
	return seed;
}

kaomojify.detection = function() {
	var bg = chrome.extension.getBackgroundPage().KmBackground;
	var trust;
	return false;
}

kaomojify.profanity_content_scan = function(list){
	var that = this;
	var kaomojis = [ // From http://emot.es
		"( ͡° ͜ʖ ͡°)​​",
		"​ʘ‿ʘ​​",
		"​(╯°□°）╯︵ ┻━┻​​",
		"​ಠ_ಠ​​",
		"​¯\_(ツ)_/¯​​",
		"​༼ つ ◕_◕ ༽つ​​",
		"​(☞ﾟヮﾟ)☞​​",
		"​ᕕ( ᐛ )ᕗ​​",
		"​(ง'̀-'́)ง​​",
		"​ಥ_ಥ​​",
		"​ლ(ಠ益ಠლ)​​",
		"​ᕙ(⇀‸↼‶)ᕗ​​",
		"​(ง ͠° ͟ل͜ ͡°)ง​​",
		"​(̿▀̿ ̿Ĺ̯̿̿▀̿ ̿)​​",
		"​｡◕‿◕｡​​",
		"​( ͡ᵔ ͜ʖ ͡ᵔ )​​",
		"​ლ,ᔑ•ﺪ͟͠•ᔐ.ლ​​",
		"​ᕦ(ò_óˇ)ᕤ​​",
		"​Q(Ò_ÓQ)​​",
		"​༼ ºل͟º ༽​​",
		"​ヽ༼ຈل͜ຈ༽ﾉ​​",
		"​щ(ﾟДﾟщ)﻿​​",
		"​▄︻̷̿┻̿═━一​​",
		"​ʕ•ᴥ•ʔ​​",
		"​ヽ(´▽`)/​​",
		"​（　ﾟДﾟ）​​",
		"​☜(⌒▽⌒)☞​​",
		"​¯\_(⊙︿⊙)_/¯​​",
		"​Ƹ̵̡Ӝ̵̨̄Ʒ​​",
		"​(´・ω・`)​​",
		"​ლ(=ↀωↀ=)ლ​​",
		"​ヾ(*ΦωΦ)ﾉ​​",
		"​(=^ω^=)​​",
		"​( =①ω①=)​​",
		"(┛΄◞ิ۝◟ิ‵)┛ 彡┻━┻​​",
		"​ლ(´◉❥◉｀ლ)​​",
		"​(˘▼˘>ԅ( ˘⌣ƪ)​​",
		"​(⊙︿⊙✿)​​",
		"​(இ﹏இ`｡)​​",
		"​༼ ༎ຶ ෴ ༎ຶ༽​​",
		"​(ఠ్ఠ ˓̭ ఠ్ఠ)​​",
		"​(●__●)​​",
		"​ਉ_ਉ​​",
		"​(╥╯θ╰╥)​​",
		"​｡ﾟ(ﾟ∩´﹏`∩ﾟ)ﾟ｡​​",
		"​˞̣̣̣̀ ᶿ᷄ ˈ̯̥̮ ᶿ᷅​​",
		"​(╯_╰)​​",
		"​(•⊙ω⊙•)​​",
		"​ლ(´ڡ`ლ)​​",
		"​(≧◡≦)​​",
		"​／(x~x)＼​​",
		"​o(╥﹏╥)o​​",
		"​⁽⁽ƈ ͡ (ु ˲̥̥̥́ ˱̥̥̥̀) ु⁾⁾​​",
		"​( ͡ಠ ʖ̯ ͡ಠ)​​",
		"​ㅇㅅㅇ​​",
		"​٩(͡๏̯͡๏)۶​​",
		"​(๏̯͡๏)​​",
		"​(•ิ_•ิ)?​​",
		"​`(๑ △ ๑)`*​​",
		"​ᕙ༼ຈل͜ຈ༽ᕗ​​",
		"​☜༼ຈل͜ຈ☜༽​​",
		"​[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]​​",
		"​୧༼ಠ益ಠ༽୨​​",
		"​(〃￣ω￣〃)ゞ​​",
		"​（￣へ￣）​​",
		"​(￣ェ￣;)​​",
		"​（￣～￣;）​​",
		"​<(￣︶￣)>​​",
		"​ヽ༼ ಠ益ಠ ༽ﾉ​​",
		"​༼✷ɷ✷༽​​",
		"​(✖╭╮✖)​​",
		"​| (• ◡•)| (❍ᴥ❍ʋ)​​",
		"​(≖͞_≖̥)​​",
		"​≖‿≖​​",
		"​（Ω_Ω）​​",
		"​┗( ●-﹏ ｀｡)づ​​",
		"​ヾ(￣□￣;)ﾉ​​",
		"​*｡٩(ˊωˋ*)و✧*｡​​",
		"​t ( - _ - t )​​",
		"​₍₍ ᕕ( ･᷄ὢ･᷅ )ᕗ⁾⁾​​",
		"​ಠ╭╮ಠ​​",
		"​╭( ･ㅂ･)و ̑̑​​",
		"​(－‸ლ)​​",
		"​✿​​",
		"​♥‿♥​​",
		"​(ﾉ> ◇ <)ﾉ​​",
		"​♬♪♫♩​​",
		"​(⊙ヮ⊙)​​",
		"​(づ￣ ³￣)づ​​",
		"​o(≧∇≦o)​​",
		"​Ｏ(≧∇≦)Ｏ​​",
		"​≧(´▽｀)≦​​",
		"​(͠≖ ͜ʖ͠≖)​​",
		"​¿ⓧ_ⓧﮌ​​",
		"​(ノಠ益ಠ)ノ彡┻━┻​​",
		"​⊂(◉‿◉)つ​​",
		"​ヽ(´ー｀)ノ​​",
		"​(༼•̀ɷ•́༽)​​",
		"​°‿‿°​​",
		"​⊙▃⊙​​",
		"​q(❂‿❂)p​​",
		"​ヾ(⌐■_■)ノ​​",
		"​(⌐■_■)​​",
		"​-[ºل͟º]-​​",
		"​♪ᕕ(ᐛ)ᕗ​​",
		"​( ¬‿¬)​​",
		"​Ѱζ༼ᴼل͜ᴼ༽ᶘѰ​​",
		"​༼ つ ಥ_ಥ ༽つ​​",
		"​ヽ༼ຈ┏ل͜┓ຈ༽ﾉ​​",
		"​༼ ಠل͟ರೃ ༽​​",
		"​ᕙ(˵ ಠ ਊ ಠ ˵)ᕗ​​",
		"​ヽ( ͝° ͜ʖ͡°)ﾉ​​",
		"​\(༎ຶ益༎ຶ)ᕗ​​",
		"​ᕦ༼༎ຶ_༎ຶ༽ᕗ​​",
		"​ (๑˃̵ᴗ˂̵)و​​",
		"​┐('～`；)┌​​",
		"​【°〜°】​​",
		"​¯\\\_(ツ)_/¯​​",
		"​(ಥ﹏ಥ)​​",
		"​┬─┬ノ( º _ ºノ)​​",
		"​┬─┬ノ(ಠ益ಠノ)​​",
		"​ᶘ ᵒᴥᵒᶅ​​",
		"​(ﾟ∀ﾟ)☞​​",
		"​(＾∀＾)​​",
		"​(づ°‿°.)づ​​",
		"​(V) (°,,,°) (V)​​",
		"​(V) (;,,;) (V)​​",
		"​༼( ͠° ͟ʖ ͡°)༽​​",
		"​(*✹*)​​",
		"​( ͠° ͟ʖ ͡°)​​",
		"​( ͡o ͜ʖ ͡o)​​",
		"​(･｀ｪ´･)つ​​",
		"​\_(ಠ_ಠ)_/​​",
		"​¯\_(◉‿◉)_/¯​​",
		"​´∩`​​",
		"​┬┴┬┴┤(･_├┬┴┬┴​​",
		"​（。ˇ ⊖ˇ）♡​​",
		"​(°ロ°)☝​​",
		"​‹(•¿•)›​​",
		"​ヽ༼ಢ_ಢ༽ﾉ☂​​",
		"​【=◈︿◈=】​​",
		"​(￣(ｴ)￣)ノ​​",
		"​ლ(◕ω◕ლ)​​",
		"​ಠ_ರೃ​​",
		"​ԅ( ͒ ۝ ͒ )ᕤ​​",
		"⊙ – ⊙",
		"​(ง ͠° ͜ʖ ͡°)ง​​",
		"​(◕‿◕✿)​​",
		"​(◡‿◡✿)​​",
		"​(✿◠‿◠)​​",
		"​(°∀°)b​​",
		"​t(°∆°)t​​",
		"​ಠ‿ಠ​​",
		"​( ͜。 ͡ʖ ͜。)​​",
		"​ᕕ(¬ ͜ ¬)ᕗ​​",
		"​ヽ༼ ʘ ∧ ʘ ༽ᓄ​​",
		"​( ǒ _ʖ ǒ)7​​",
		"​(ﾉ*ﾟｰﾟ)ﾉ​​",
		"​⊂(ο･㉨･ο)⊃​​",
		"​( ˘ ³˘)♥​​",
		"​(☆^O^☆)​​",
		"​(◎_◎;)​​",
		"​ヽ(*⌒∇⌒*)ﾉ​​",
		"​(ｏ・_・)ノ”(ノ_<、)​​",
		"​( ͡~ ͜ʖ ͡~)​​",
		"​( ͡° _ʖ ͡°)​​",
		"​╭(•⌣•)╮​​",
		"​(彗Д彗)​​",
		"​( ͡ʘ╭͜ʖ╮͡ʘ)​​",
		"​(´･益･｀*)​​",
		"​༼༼;; ;°;ਊ°;༽​​",
		"​٩(•ิ˓̭ •ิ )ง​​",
		"​\(•^•)/​​",
		"​(ᵔᴥᵔ)​​",
		"​( ಠ ͜ʖರೃ)​​",
		"​ˁ˚ᴥ˚ˀ​​",
		"​(ｏ^ｰﾟ)/'`*​​",
		"​( 　ﾟ,_ゝﾟ)​​",
		"​ヽ(・ε・｀)​​",
		"​(・⊆・）​​",
		"​(づ｡◕‿‿◕｡)づ​​",
		"​( ,,･`ё´･)​​",
		"​ᕕ( ͡° ͜ʖ ͡°)ᕗ​​",
		"​.+:｡(ﾉ･ω･)ﾉﾞ​​",
		"<°(((><​​",
		"​( ◡́.◡̀)\(^◡^ )​​",
		"​☜(ﾟヮﾟ☜)​​",
		"ʕつ ͡◔ ᴥ ͡◔ʔつ​​",
		"​ヾ(≧∪≦*)ノ〃​​",
		"​( ͡ᵔ ͜ʖ ͡°)​​",
		"(◕`╭╮´◕)​​",
		"​(⊙.⊙(☉̃ₒ☉)⊙.⊙)​​",
		"​)°v°(​​",
		"​(❛‿❛✿̶̥̥)​​",
		"​ᕙ(`▿´)ᕗ​​",
		"​웃♥유​​",
		"​(´・ω・)っ由​​",
		"​(　・ω・)​​",
		"​໒( • ͜ʖ • )७​​",
		"​ԅ|.͡° ڡ ͡°.|ᕤ​​",
		"​☆〜（ゝ。∂）​​",
		"​Ѱ༼ ⊙益ಠ ༽Ѱ​​",
		"​(つ☯ᗜ☯)つ​​",
		"​ও( 0 ¥ 0 )ঔ​​",
		"​(つ;w;)つ​​",
		"​눈__눈​​",
		"​o( > U < )o​​",
		"​(ღ˘⌣˘)❛ั◡❛ัღ)​​",
		"​ᕙ(° ͜ಠ ͜ʖ ͜ಠ°)ᓄ​​",
		"​( ཀ͝ ∧ ཀ͝ )​​",
		"​\(⌒o⌒)人(⌒-⌒)/​​",
		"​حᇂﮌᇂ)​​",
		"​(ʘ言ʘ╬)​​",
		"​[¬º-°]¬​​",
		"​(ತ_ಎತ)​​",
		"​（｡╹ω╹｡）​​",
		"​/|\( ;,; )/|\​​",
		"​ㅍㅅㅍ​​",
		"​╮(╯▽╰)╭​​",
		"​(╥︣﹏᷅╥᷅)​​",
		"​(ง ͡ʘ ͜ʖ ͡ʘ)ง​​",
		"​⊂(｡╹ヮ╹｡)つ​​",
		"​(ง ˙ω˙)ว​​",
		"<::::[]= ( ͠° ʖ ͡°)ง​​",
		"​ᕙ( ︡'︡益'︠)ง​​",
		"​(◐‿◑)​​",
		"​☜(⌒▽⌒)☜​​",
		"​ᕙ( •̀ل͜•́)ϡ​​",
		"​(◕ ʜ ◕ )​​",
		"​ლ(ಠ▃ಠლ)​​",
		"༼ つ ◔Д◐ ༽つ​​",
		"​(σ′▽‵)′▽‵)σ​​",
		"​⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄​​",
		"​(・∀・ )​​",
		"​༼ つ ❦౪❦ ༽つ​​",
		"​(Θ¿ʘϡ​​",
		"​⊂(・(ェ)・)⊃​​",
		"​( °٢° )​​",
		"​ζ༼Ɵ͆ل͜Ɵ͆༽ᶘ​​",
		"​༼ ಠل͟ಠ༽​​",
		"(̥ ̥এ́ ̼ এ̥̀)̥̥​​",
		"(╯-_-)╯ ~╩╩​​",
		"​(っ˘ڡ˘ς)​​",
		"​(͡ ͡° ͜ つ ͡͡°)​​",
		"​( ͡↑ ͜ʖ ͡↑)​​",
		"​( ° ͜ʖ °)​​",
		"乁༼☯‿☯✿༽ㄏ​​",
		"​(◔౪◔ )​​",
		"​༼ つ•ﺪ͟͠• ༽つ​​",
		"​٩(｡•́‿•̀｡)۶​​",
		"​(❀◦‿◦)​​",
		"( ͡ຈ╭͜ʖ╮͡ຈ )​​",
		".·´¯`(>▂<)´¯`·.​​",
		"​(ง ◉◡◔)ง​​",
		"​ヽ༼☢ل͜☢༽ﾉ​​",
		"​【ツ】​​",
		"​╭(۝⌣۝)╮​​",
		"​(╯ಊ╰)​​",
		"​ʕ⊙ᴥ⊙ʔ​​",
		"┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻​​",
		"​໒( ͡ᵔ ͜ʖ ͡ᵔ )७​​",
		"​༼ ຈل͜ຈ༽ノ⌐■-■​​",
		"━╤デ╦︻(▀̿̿Ĺ̯̿̿▀̿ ̿)​​",
		"​༼ﾉ۞⌂۞༽ﾉ​​",
		"ლ(▀̿̿Ĺ̯̿̿▀̿ლ)​​",
		"​(ᕗ ͠°	ਊ ͠° )ᕗ​​",
		"​ヽ༼ʘ̚ل͜ʘ̚༽ﾉ​​",
		"​୧༼ ヘ ᗜ ヘ ༽୨​​",
		"​ಸ_ಸ​​",
		"​ᕦ( ᴼ ڡ ᴼ )ᕤ​​",
		"​ʕ◞ิ오◟ิʔ​​",
		"​٢ ` ౪´ ì​​",
		"​(¤_¤)​​",
		"​(っ˘з(˘⌣˘ )​​",
		"​(ง⌐□ل͜□)ง​​",
		"​ೕ(•̀ㅂ•́ )​​",
		"​୧༼ ͡◉ل͜ ͡◉༽୨​​",
		"​(ΘεΘ;)​​",
		"​( ͡° ʖ̯ ͡°)​​",
		"​ᕕ༼ ͠ຈ Ĺ̯ ͠ຈ ༽┌∩┐​​",
		"ゞ@(o･ｪ･)@人@(･ｪ･o)@​​",
		"(ভ_ ভ) ރ ／/ ┊ \＼​​",
		"​ヾ(*´∀｀*)ﾉ​​",
		"​（●´∀｀）ノ♡​​",
		"​ヽ(●´∀`●)ﾉ​​",
		"(((┏(;￣▽￣)┛​​",
		"​(θ෴θ*)​​",
		"​乁( ⁰͡	Ĺ̯ ⁰͡ ) ㄏ​​",
		"​ᕦ( ͡° ͜ʖ ͡°)ᕤ​​",
		"​へ། ¯͒ ʖ̯ ¯͒ །ᕤ​​",
		"┻━┻ ︵﻿¯\(ツ)/¯︵ ┻━┻​​",
		"​(つд⊂)​​",
		"​ᕙﾉ•̀ʖ•́ﾉ୨​​",
		"​╰༼ •̀۝•́ ༽╯​​",
		"​(⊙_☉)​​",
		"​〈(゜。゜)​​",
		"​`(๑ △ ๑)`*​​",
		"​(눈‸눈)​​",
		"​ლ(́◉◞౪◟◉‵ლ)​​",
		"​( ͡° ᴥ ͡°)​​"
	];
	function F(n, t){
		/* if (that.detection)
			return; */

			if(n.nodeType === 3 || t === "TITLE"){
				if(t!=="TITLE"){
					var u = that.searchHash2(n.data.toLowerCase(), list);
					if (u) {
						u = new RegExp(u.replace(/\%/g,"\\"), ["ig"]);
		      			n.data = n.data.replace(u, kaomojis[that.generateRandomIndex(kaomojis.length)]);
		      		}
				} else {
					var u = that.searchHash2(n.toLowerCase(), list);
					if (u) {
							u = new RegExp(u.replace(/\%/g,"\\"), ["ig"]);
		      		that.doc.title = n.replace(u, kaomojis[that.generateRandomIndex(kaomojis.length)]);
		      		}
				}
		    } else if (n.tagName != "STYLE" && n.tagName != "SCRIPT") {
				var i=n.childNodes, l=i.length; while(l--){F(i[l], t);}
			}
	}
	F(that.doc.title, "TITLE");
	F(that.doc.body, "BODY");
};
