rem tool from tpsvr @ npm

chcp 65001

cd server

set nodeModulesPath=../node_modules
set browserifyPath=%nodeModulesPath%/.bin/browserify
set terserPath=%nodeModulesPath%/.bin/terser

set dest=./tpsvr-main.bundle.minimized.js

call %browserifyPath% ^
	./tpsvr-main.js ^
	-v ^
	-u ./tpsvr-config.js ^
	-o %dest% ^
	-p "%nodeModulesPath%/bundle-collapser/plugin" ^
	-g [ "%nodeModulesPath%/browserify-stringify-minimize-css-content" --minimizeExtensions [ .css ] ] ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] --minify true ] ^
	--node

call "%terserPath%" %dest% -o %dest% -c -m

cd ..
