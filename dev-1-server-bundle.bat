rem tool from tpsvr @ npm

chcp 65001

cd server

set nodeModulesPath=../node_modules
set watchifyPath=%nodeModulesPath%/.bin/watchify

title watchify - tpsvr-server

set dest=./tpsvr-main.bundle.js

call %watchifyPath% ^
	./tpsvr-main.js ^
	-u ./tpsvr-config.js ^
	-o %dest% ^
	-v ^
	-g [ "%nodeModulesPath%/stringify" --extensions [.html .css .htm ] ] ^
	--node

cd ..
