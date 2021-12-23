rem tool from test.htm @ npm

set watchifyPath="watchify.cmd"

set module=tpsvr

title watchify - %module%-client

rem if not exist ./debug md debug

for /F %%i in ('npm root -g') do ( set globalModulePath=%%i)

%watchifyPath% -o ./client/root/bundle-client.debug.js -v ^
	-g [ "%globalModulePath%/stringify" --extensions [.html .css .htm ] ] ^
	-r ./node_modules/htm-tool:htm-tool ^
	-r ./client/main-view.js:main-view ^
	-r ./package.json:_package_json
