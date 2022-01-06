rem tool from tpsvr @ npm

chcp 65001

set nodeModulesPath=./node_modules
set browserifyPath=%nodeModulesPath%/.bin/browserify
set terserPath=%nodeModulesPath%/.bin/terser

set destFile=./client/root/bundle-client.minimized.js

call %browserifyPath% ^
	-o %destFile% ^
	-v ^
	-p "%nodeModulesPath%/bundle-collapser/plugin" ^
	-g [ "%nodeModulesPath%/browserify-stringify-minimize-css-content" --minimizeExtensions [ .css ] ] ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] --minify true ] ^
	-r ./node_modules/htm-tool:htm-tool ^
	-r ./client/main-view.js:main-view ^
	-r ./package.json:_package_json

call "%terserPath%" %destFile% -o %destFile% -c -m
