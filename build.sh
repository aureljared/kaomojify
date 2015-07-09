#!/bin/bash
function showHelp() {
	echo "Usage: `basename $0` <input html> <output html>"
	echo "To show help, execute `basename $0` -h"
	echo "This script requires the vulcanize and the crisper utilities."
	echo "Install them by \"sudo npm install -g vulcanize crisper\"."
}
dist=(
	css
	js
	img
	options.html
	popup.html
	manifest.json
	default.txt
	LICENSE.txt
)
clear && printf '\e[3J'
inh="$1"
ouh="$ouh"
if [[ ! $1 ]]; then
	echo "Warning: Missing arguments. Assuming defaults: index.html, options.html."
	echo "To show help, execute `basename $0` -h."
	echo
	inh="index.html"
	if [[ ! -e "$inh" ]]; then
		echo "Error: Input file \"$inh\" does not exist."
		exit 1
	fi
	ouh="options.html"
elif [[ $1 != "" ]] && [[ ! $ouh ]]; then
	echo "Warning: Missing output file. Assuming default: options.html."
	ouh="options.html"
elif [[ $1 == "-h" ]]; then
	showHelp
	exit 0
fi

# Build tools
vul=`which vulcanize`
csp=`which crisper`
if [[ "$vul" == "" ]]; then
	echo "Error: vulcanize not found."
	showHelp
	exit 1
elif [[ "$csp" == "" ]]; then
	echo "Error: crisper not found."
	showHelp
	exit 1
fi

# Concatenate all other scripts into one file
cat "$inh" | sed 's/<!-- build.sh - imports -->/<link rel="import" href="js\/..html"\/>/' > .output.html
echo '<!-- Autogenerated file. Do not edit. -->' > js/..html
. .imports
echo "[*] Concatenating imports."
for f in ${poly[@]}; do
	echo "    => $f"
	echo -n '<!-- ' >> js/..html && echo "$f -->" >> js/..html
	echo "<link rel='import' href='../.bower/$f'/>" >> js/..html
done

# Build
if [[ -e "$ouh" ]]; then rm -f "$ouh"; fi
echo "[*] Vulcanizing and stripping inline scripts into \"js/polymer-project.js\"."
$vul --inline-scripts .output.html | $csp --html "$ouh.tmp" --js js/polymer.js
echo "[*] Importing external scripts."
cat "$ouh.tmp" | sed 's/<\/body><\/html>//' > "$ouh"
for f in ${js[@]}; do
	echo "    ==> $f"
	echo "<script type='text/javascript' src='$f'></script>" >> "$ouh"
done
echo "[*] Copying files into distribution folder."
mkdir -p dist/.bower/paper-toggle-button
for f in ${dist[@]}; do
	echo "    ==> $f"
	cp -fpr "$f" dist/
done
echo "    ==> .bower/paper-toggle-button/paper-toggle-button.css"
cp -fp .bower/paper-toggle-button/paper-toggle-button.css dist/.bower/paper-toggle-button/
echo "[*] Minifying."
cd dist
for f in ${minq[@]}; do
	echo "    ==> $f"
	minify "$f" > .minified
	rm -f "$f"
	mv .minified "$f"
done
cd ../
echo "[*] Cleaning up."
echo "</body></html>" >> "$ouh"
rm -f .output.html "$ouh.tmp" js/..html dist/js/..html
echo -e "\nComplete. Total unpacked extension size is approx. `du -k -s dist | cut -f 1` kilobytes"
exit 1