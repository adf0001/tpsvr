#!/bin/sh

#tool from tpsvr @ npm

nodeModulesPath=%tpsvrPath%/node_modules
browserifyPath=$nodeModulesPath/.bin/browserify
terserPath=$nodeModulesPath/.bin/terser

[ -d ./bundle ] || mkdir bundle

destFile=./bundle/main-bundle-minimized.js

"$browserifyPath" \
	-o $destFile \
	-v \
	-p "$nodeModulesPath/bundle-collapser/plugin" \
	-g [ "$nodeModulesPath/browserify-stringify-minimize-css-content" --minimizeExtensions [ .css ] ] \
	-g [ "$nodeModulesPath/stringify" --extensions [.html .css .htm ] --minify true ] \
	-g [ "$nodeModulesPath/browserify-falafel-tool" --falafelPlugins [ $nodeModulesPath/export-to-module-exports $nodeModulesPath/static-import-to-require ] ] \
	-r "../%moduleMainFile%:%moduleName%"

"$terserPath" $destFile -o $destFile -c -m
