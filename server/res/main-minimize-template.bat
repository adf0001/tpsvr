rem tool from tpsvr @ npm

chcp 65001

set nodeModulesPath=%tpsvrPath%/node_modules
set browserifyPath=%nodeModulesPath%/.bin/browserify
set terserPath=%nodeModulesPath%/.bin/terser

if not exist ./bundle md bundle

call "%browserifyPath%" -v ^
	-o ./bundle/main-bundle-minimized.js ^
	-p "%nodeModulesPath%/bundle-collapser/plugin" ^
	-g [ "%nodeModulesPath%/browserify-stringify-minimize-css-content" --minimizeExtensions [ .css ] ] ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] --minify true ] ^
	-r "../%moduleMainFile%:%moduleName%"

call "%terserPath%" ./bundle/main-bundle-minimized.js -o ./bundle/main-bundle-minimized.js -c -m
