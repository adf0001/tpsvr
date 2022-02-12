#!/bin/sh

#tool from tpsvr @ npm

nodeModulesPath=./node_modules
watchifyPath=$nodeModulesPath/.bin/watchify

destFile=./client/root/bundle-client.debug.js

$watchifyPath \
	-o $destFile \
	-v \
	-g [ "$nodeModulesPath/stringify" --extensions [.html .css .htm ] ] \
	-r ./node_modules/htm-tool:htm-tool \
	-r ./client/main-view.js:main-view \
	-r ./package.json:_package_json