rem tool from tpsvr @ npm

chcp 65001

set nodeModulesPath=./node_modules
set watchifyPath=%nodeModulesPath%/.bin/watchify

title watchify - tpsvr-client

set destFile=./application/client/root/bundle-client.debug.js

%watchifyPath% ^
	-o %destFile% ^
	-v ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] ] ^
	-r ./node_modules/htm-tool:htm-tool ^
	-r ./application/client/main-view.js:main-view ^
	-r ./package.json:_package_json
