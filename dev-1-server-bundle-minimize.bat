rem tool from tpsvr @ npm

chcp 65001

cd application/server

set nodeModulesPath=../../node_modules
set browserifyPath=%nodeModulesPath%/.bin/browserify
set terserPath=%nodeModulesPath%/.bin/terser

set destDir=./tpsvr-main.bundle.minimized.js

call %browserifyPath% ^
	./tpsvr-main.js ^
	-v ^
	-u ./tpsvr-config.js ^
	-o %destDir% ^
	-p "%nodeModulesPath%/bundle-collapser/plugin" ^
	-g [ "%nodeModulesPath%/browserify-stringify-minimize-css-content" --minimizeExtensions [ .css ] ] ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] --minify true ] ^
	--node

call "%terserPath%" %destDir% -o %destDir% -c -m

cd ../..
