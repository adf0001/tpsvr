rem tool from tpsvr @ npm

chcp 65001

set nodeModulesPath=./node_modules
set browserifyPath=%nodeModulesPath%/.bin/browserify
set terserPath=%nodeModulesPath%/.bin/terser

set destFile=./application/client/root/bundle-client.minimized.latest-compatible.js

set babelifyPluginsForLatestCompatible= ^
	%nodeModulesPath%/@babel/plugin-transform-arrow-functions ^
	%nodeModulesPath%/@babel/plugin-transform-destructuring ^
	%nodeModulesPath%/@babel/plugin-transform-classes ^
	%nodeModulesPath%/@babel/plugin-transform-template-literals ^
	%nodeModulesPath%/@babel/plugin-transform-block-scoping ^
	%nodeModulesPath%/@babel/plugin-transform-for-of ^
	%nodeModulesPath%/@babel/plugin-transform-spread ^
	%nodeModulesPath%/@babel/plugin-transform-shorthand-properties ^
	%nodeModulesPath%/@babel/plugin-transform-parameters ^
	%nodeModulesPath%/@babel/plugin-transform-regenerator

call %browserifyPath% ^
	-o %destFile% ^
	-v ^
	-p "%nodeModulesPath%/bundle-collapser/plugin" ^
	-g [ "%nodeModulesPath%/browserify-stringify-minimize-css-content" --minimizeExtensions [ .css ] ] ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] --minify true ] ^
	-g [ "%nodeModulesPath%/babelify" --plugins [ %babelifyPluginsForLatestCompatible% ] ] ^
	-e ./application/client/for-latest-compatible-bundle.js ^
	-r ./node_modules/htm-tool:htm-tool ^
	-r ./application/client/main-view.js:main-view ^
	-r ./package.json:_package_json

call "%terserPath%" %destFile% -o %destFile% -c -m
