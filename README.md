kaomojify
==========

**Kaomojify** is a profanity filter for Google Chrome, based on @hpaolini's [tinyFilter extension.](https://github.com/hpaolini/tinyFilter-chrome)

It replaces all swear/curse/bad words in its list (`default.txt`) with a random selection from 300 kaomojis. Kaomojify's kaomoji list is from [Emot.es.](http://emot.es)

## Building

Kaomojify's options page uses dependencies from the Polymer Project, which are available from Bower.

Should you decide to add any scripts or HTML imports from Bower to the options page, add your desired entries to `.imports` and build the options page through `./build.sh index.html options.html`. All scripts that don't come from Bower should be declared directly in `index.html`.

## Download

Unfortunately I'm not able to upload Kaomojify to the Chrome Web Store, because I have no means to pay the fee of $5.00. The `.crx` download on the [Releases page](https://github.com/aureljared/kaomojify/releases) cannot be installed either by Chrome 33+ due to new security policies.

In the meantime, you can [download the latest ZIP](https://github.com/aureljared/kaomojify/releases/download/v0.2/kaomojify.zip), unzip it somewhere on your computer, and point Chrome to that location through **Chrome Menu > More tools > Extensions > (enable developer mode) > Load unpacked extension...** 

## Progress

- [x] Rename project to Kaomojify
- [x] Use random kaomojis in place of "***"
- [x] Material UI
- [ ] **Stability checks, etc.**
- [ ] Update mechanism for kaomoji and profanity databases
