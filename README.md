kaomojify
==========

**Kaomojify** is a profanity filter for Google Chrome, based on @hpaolini's [tinyFilter extension.](https://github.com/hpaolini/tinyFilter-chrome)

It replaces all swear/curse/bad words in its list (`default.txt`) with a random selection from 300 kaomojis. Kaomojify's kaomoji list is from [Emot.es.](http://emot.es)

## Building

Kaomojify's options page uses dependencies from the Polymer Project, which are available from Bower.

Should you decide to add any scripts or HTML imports to the options page, add your desired entries to `.imports` and build the options page through `./build.sh index.html options.html`.

## Progress

- [x] Rename project to Kaomojify
- [x] Use random kaomojis in place of "***"
- [ ] **Material UI**
- [ ] Update mechanism for kaomoji and profanity databases

## Download

Kaomojify is still in development. In the meantime, you can download the source code, unzip it somewhere on your computer, and point Chrome to that location through **Chrome Menu > More tools > Extensions > (enable developer mode) > Load unpacked extension.** The `.crx` download on the [Releases page](https://github.com/aureljared/kaomojify/releases) cannot be installed by Chrome 33+ due to security policies.
