#!/bin/sh

#tool from tpsvr @ npm

nodeModulesPath=%tpsvrPath%/node_modules
watchifyPath=$nodeModulesPath/.bin/watchify

[ -d ./bundle ] || mkdir bundle

destFile=./bundle/test-bundle.js

"$watchifyPath" \
	-o $destFile \
	-v \
	-g [ "$nodeModulesPath/stringify" --extensions [.html .css .htm ] ] \
	-r ../package.json:_package_json \
	-r ./test-data.js:_test_data \
	-r "../%moduleMainFile%:%moduleName%"
