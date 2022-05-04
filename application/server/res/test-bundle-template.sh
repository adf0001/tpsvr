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
	-g [ "$nodeModulesPath/browserify-falafel-tool" --falafelPlugins [ $nodeModulesPath/export-to-module-exports $nodeModulesPath/static-import-to-require ] --sourceComment --debugInfo ] \
	-r ../package.json:_package_json \
	-r ./test-data.js:_test_data \
	-r "../%moduleMainFile%:%moduleName%"
