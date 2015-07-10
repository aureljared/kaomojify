kaomojify
==========

**Kaomojify** is a highly customizable website filter for Google Chrome, based on Hunter Paolini's [tinyFilter extension.](https://github.com/hpaolini/tinyFilter-chrome)

Kaomojify matches all words in its profanity list (`default.txt`) and replaces them with a random selection from 300 kaomojis, all from [Emot.es](http://emot.es). Kaomojify has around 350 entries in its profanity list.

It also has the ability to block access to websites the user specifies, making it ideal for children.

## Installing

Unfortunately I'm not able to upload Kaomojify to the Chrome Web Store, because I have no means to pay the fee of $5.00. The `.crx` download on the [Releases page](https://github.com/aureljared/kaomojify/releases) cannot be automatically installed either by Chrome 33+ due to new security policies.

The only way to install Kaomojify on Chrome 33+ right now is through these steps:

1. Download the latest version of Kaomojify from [this link.](https://dl.aureljared.tk/kaomojify-0.3-rc1.crx)
2. When Chrome finishes downloading the `.crx` file, it will give you an error saying that you can't install anything from this website.
3. Open the Chrome menu and go to **More tools > Extensions.**
4. When the Extensions page loads, go to where Chrome downloaded the `.crx` file and drag that file into the Extensions page.
5. When Chrome asks you if you want to add Kaomojify, click **Add.**
6. **Hooray!** You've successfully installed Kaomojify.

## Building

Kaomojify's options page (`index.html`) uses dependencies from the Polymer Project, which are available from Bower and are specified in `bower.json`. Install them through `bower install`.

Should you decide to add any scripts or HTML imports from Bower to the options page, add your desired entries to `.imports` and build the options page through `./build.sh`. All scripts that don't come from Bower should be declared directly in `.imports`.

However, with this approach, auto-update does not work at the moment; because Chrome only auto-updates through the Web Store. A future release is planned to work around this by having its own update mechanism.

## Progress

- [x] Rename project to Kaomojify
- [x] Use random kaomojis in place of "***"
- [x] Material UI
- [x] Update check
- [x] Add option to choose between kaomojis, asterisks, and custom string for censoring profanity
- [ ] **Bugfixes, optimizations, etc.**
