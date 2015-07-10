window.onload = function(){
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
			words: default_lists.words,
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
}

var kaomojifyDefaults = {
	content_filter: {
		block: {
			sites: ["pornhub.com"],
			words: [
				"porn", "18 usc", "pornography", "porno", "milf", "hentai", "nude", "blowjob", "fetish", "nsfw", "sexy video",
				"sexy tube", "sexy porn", "handjob", "bestiality", "incest", "sexy model", "nudity",
				"not safe for work", "not safe 4 work", "nsfw", "gone wild"
			]
		},
		trust: {
			sites: ["wikipedia.com"]
		}
	},
	profanity_filter: {
		words: [
			"2g1c", "2 girls 1 cup", "acrotomophilia", "anal", "anilingus", "anus", "arsehole", "ass", "asshole",
			"assmunch", "auto erotic", "autoerotic", "babeland", "baby batter", "ball gag", "ball gravy",
			"ball kicking", "ball licking", "ball sack", "ballsack", "ball sucking", "bangbros", "bareback",
			"barely legal", "barenaked", "bastardo", "bastinado", "bbw", "bdsm", "beaver cleaver", "beaver lips",
			"bestiality", "bi curious", "big black", "big breasts", "big knockers", "big tits", "bimbos",
			"birdlock", "bitch", "black cock", "blonde action", "blonde on blonde action", "blow job",
			"blowjob", "blue waffle", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs",
			"booty call", "brown showers", "brunette action", "bukkake", "bulldyke", "bullet vibe",
			"bung hole", "bunghole", "busty", "butt", "buttcheeks", "butthole", "camel toe", "camgirl",
			"camslut", "camwhore", "carpet muncher", "carpetmuncher", "chocolate rosebuds", "circlejerk",
			"cleveland steamer", "clit", "clitoris", "clover clamps", "clusterfuck", "cock", "cocks", "coprolagnia",
			"coprophilia", "cornhole", "cum", "cumming", "cunnilingus", "cunt", "damn", "darkie", "deep throat",
			"deepthroat", "dick", "dildo", "dirty pillows", "dirty sanchez", "dog style", "doggie style",
			"doggiestyle", "doggy style", "doggystyle", "dolcett", "dominatrix", "dommes", "donkey punch", 
			"double dong", "double penetration", "douche", "douchebag", "dp action", "eat my ass", "ecchi",
			"ejaculation", "erotic", "erotism", "escort", "ethical slut", "eunuch", "faggot", "fecal", "felch",
			"fellatio", "feltch", "female squirting", "femdom", "figging", "fingering", "fisting", "fetish",
			"footjob", "frotting", "fuck", "fuck buttons", "fucking", "fudge packer", "fudgepacker", "futanari",
			"g-spot", "gang bang", "gay sex", "genitals", "giant cock", "girl on", "girl on top", "girls gone wild",
			"goatcx", "goatse", "goatse.cx", "goddamn", "goddamned", "gokkun", "golden shower", "goo girl",
			"goodpoop", "goregasm", "grope", "group sex", "guro", "hand job", "handjob", "hard core", "hardcore",
			"hentai", "homoerotic", "honkey", "hooker", "hot chick", "how to kill", "how to murder", "huge fat",
			"humping", "incest", "intercourse", "jack off", "jail bait", "jailbait", "jerk off", "jerkwad", "jigaboo",
			"jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing",
			"leather restraint", "leather straight jacket", "lemon party", "lolita", "lovemaking", "make me come",
			"male squirting", "masturbate", "menage a trois", "milf", "missionary position", "motherfucker",
			"mound of venus", "mr hands", "muff diver", "muffdiving", "muthafucka", "nambla", "nawashi",
			"negro", "neonazi", "nig nog", "nigga", "nigger", "nimphomania", "nipple", "nipples", "nsfw images",
			"nude", "nudity", "nympho", "nymphomania", "octopussy", "omorashi", "one cup two girls", "one guy one jar",
			"orgasm", "orgy", "paedophile", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "phone sex",
			"piece of shit", "piss pig", "pissing", "pisspig", "playboy", "pleasure chest", "pole smoker",
			"ponyplay", "poof", "poop chute", "poopchute", "porn", "porno", "pornography", "prince albert piercing",
			"pthc", "pubes", "pussy", "queef", "raghead", "raging boner", "rape", "raping", "rapist", "rectum",
			"reverse cowgirl", "rimjob", "rimming", "rosy palm", "rosy palm and her 5 sisters", "rusty trombone",
			"s&m", "sadism", "scat", "schlong", "scissoring", "semen", "sex", "sexo", "shaved beaver",
			"shaved pussy", "shemale", "shibari", "shit", "shitting", "shota", "shrimping", "slanteye", "slut",
			"smut", "snatch", "snowballing", "sodomize", "sodomy", "spic", "spooge", "spread legs", "strap on",
			"strapon", "strappado", "strip club", "style doggy", "suck", "suck my dick", "sucks", "suicide girls",
			"sultry women", "swastika", "swinger", "tainted love", "taste my", "tea bagging", "threesome", "throating",
			"tied up", "tight white", "tit", "tits", "titties", "titty", "topless", "tosser", "towelhead", "tranny",
			"tribadism", "tub girl", "tubgirl", "tushy", "twat", "twink", "twinkie", "two girls one cup", "undressing",
			"upskirt", "urethra play", "urophilia", "vagina", "venus mound", "vibrator", "violet blue", "violet wand",
			"vorarephilia", "voyeur", "vulva", "wank", "wet dream", "wetback", "white power", "women rapping",
			"wrapping men", "wrinkled starfish", "xxx", "yaoi", "yellow showers", "yiffy", "zoophilia"
		],
		customCensor: false,
		censorString: "*****"
	}
};
