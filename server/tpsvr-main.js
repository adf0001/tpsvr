
var fs = require('fs');
var path = require('path');

var easy_http_server = require('easy-http-server');
var argv_config = require("argv-config");

var default_tpsvr_config = require("./tpsvr-config.js");
var tpsvr_extension = require("./tpsvr-extension.js");

//config
/*
	--cwd
	--by-supervisor
*/

var argvConfig = argv_config({}, null, null);
if (argvConfig.cwd) {
	//reload by cwd
	argvConfig = argv_config({}, null, argvConfig.cwd);
}

var cwd = argvConfig.cwd || process.cwd();
console.log(cwd, __dirname);

var userConfig;
if (cwd !== __dirname) {
	var cwdCfgPath = cwd + "/tpsvr-config.js";
	if (fs.existsSync(cwdCfgPath)) {
		try {
			console.log("try loading user config ...")
			userConfig = require(cwdCfgPath);	//load config file in working dir
		} catch (ex) {
			console.log("userConfig fail", ex)
		}
	}
}

var cfg = Object.assign({}, default_tpsvr_config, userConfig || {}, argvConfig);
//console.log(cfg.http_port);

if (cfg.extension && (cfg.extension instanceof Array)) cfg.extension.push(tpsvr_extension);
else cfg.extension = [tpsvr_extension];

cfg.root_path = path.normalize(__dirname + "/../client/root");	//root path is in tpsvr project

easy_http_server(cfg);		//start server, sync call
