
call ../node_modules/.bin/supervisor -i ../node_modules,../output,../client -RV -- ../server/tpsvr-main.js --by-supervisor --start foreground

exit
