rem tool from tpsvr @ npm

chcp 65001

set nodeModulesPath=./node_modules
set watchifyPath=%nodeModulesPath%/.bin/watchify

title watchify - tpsvr-client latest-compatible

set destFile=./client/root/bundle-client.debug.latest-compatible.js

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

%watchifyPath% ^
	-o %destFile% ^
	-v ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] ] ^
	-g [ "%nodeModulesPath%/babelify" --plugins [ %babelifyPluginsForLatestCompatible% ] ] ^
	-e ./client/for-latest-compatible-bundle.js ^
	-r ./node_modules/htm-tool:htm-tool ^
	-r ./client/main-view.js:main-view ^
	-r ./package.json:_package_json
