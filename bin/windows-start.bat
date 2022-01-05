
if "%1"=="" (
	set bundle_ver=
) else (
	set bundle_ver=%1
)

call ../node_modules/.bin/supervisor -w ../server -i ../node_modules,../output,../client -RV -- ../server/tpsvr-main%bundle_ver%.js --by-supervisor --start foreground --bundle_ver %bundle_ver%

exit
