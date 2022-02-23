rem tool from tpsvr @ npm

chcp 65001

set nodeModulesPath=%tpsvrPath%/node_modules
set browserifyPath=%nodeModulesPath%/.bin/browserify
set terserPath=%nodeModulesPath%/.bin/terser

if not exist ./bundle md bundle

set destFile=./bundle/main-bundle-minimized.js

call "%browserifyPath%" ^
	-o %destFile% ^
	-v ^
	-p "%nodeModulesPath%/bundle-collapser/plugin" ^
	-g [ "%nodeModulesPath%/browserify-stringify-minimize-css-content" --minimizeExtensions [ .css ] ] ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] --minify true ] ^
	-r "../%moduleMainFile%:%moduleName%"

call "%terserPath%" %destFile% -o %destFile% -c -m
