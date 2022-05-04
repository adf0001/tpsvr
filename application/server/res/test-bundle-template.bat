rem tool from tpsvr @ npm

chcp 65001

set nodeModulesPath=%tpsvrPath%/node_modules
set watchifyPath=%nodeModulesPath%/.bin/watchify

rem title watchify - %moduleName%

if not exist ./bundle md bundle

set dest=./bundle/test-bundle.js

"%watchifyPath%" ^
	-o %dest% ^
	-v ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] ] ^
	-g [ "%nodeModulesPath%/browserify-falafel-tool" --falafelPlugins [ %nodeModulesPath%/export-to-module-exports %nodeModulesPath%/static-import-to-require ] --sourceComment --debugInfo ] ^
	-r ../package.json:_package_json ^
	-r ./test-data.js:_test_data ^
	-r "../%moduleMainFile%:%moduleName%"
