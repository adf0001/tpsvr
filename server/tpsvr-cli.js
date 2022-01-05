
//var readline = require('readline');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var supervisor = require("supervisor");
var open_url_by_browser = require("open-url-by-browser");

var http_request_text = require("http-request-text");
var cq = require("callq");
var argv_config = require("argv-config");

var default_tpsvr_config = require("./tpsvr-config.js");

var _package_json = require("../package.json");

//config

var helpList = [
	"test-page-server cli, v" + _package_json.version,
	"",
	"Usgae: tpsvr [options]",
	"",
	"The default behaviour is trying",
	"	to start test-page-server in foreground,",
	"	or to add current directory to project list,",
	"	or to process work according options.",
	"",
	"options:",
	"	-h, --help              show help.",
	"",
	"	--start                 start server in background.",
	"	--start foreground|f    start server in foreground.",
	"	--stop                  stop server.",
	"	-c, --check             only check the server, don't start and don't add project.",
	"	--bundle                use bundle version.",
	"",
	"	-a, --add [<dir>]       add directory.",
	"	-r, --remove [<dir>]    detach directory/project.",
	"",
	"	-o, --open              open default browser.",
	"	-o chrome|c|firefox|f|edge|e|none|n",
	"	                        try to open with special browser.",

];

var userConfig;
try {
	userConfig = require(process.cwd() + "/tpsvr-config.js");	//load config file in working dir
} catch (ex) {
	userConfig = {};
}

argv_config(userConfig, null, null, {
	"-r": "remove",
	"-a": "add",
	"-o": "open",
	"-h": "help",
	"-c": "check",
});

var cfg = Object.assign(Object.create(default_tpsvr_config), userConfig || {});

cfg.root_path = path.normalize(__dirname + "/../client/root");

//check running
var ip = cfg.http_ip;
if (!ip || ip === "0.0.0.0") ip = "127.0.0.1";

/*
// readline interface
const rli = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
*/

function openServerUrl(serverUrl, cfg) {
	if (!("open" in cfg)) return;

	if (cfg.open) {
		if (cfg.open.match(/none|n/i)) return;	//don't open

		if (cfg.open.match(/chrome|c/i)) {
			console.log("opening chrome browser ...");
			open_url_by_browser.chrome(serverUrl);
			return;
		}
		else if (cfg.open.match(/firefox|f/i)) {
			console.log("opening firefox browser ...");
			open_url_by_browser.firefox(serverUrl);
			return;
		}
		else if (cfg.open.match(/edge|e/i)) {
			console.log("opening edge browser ...");
			open_url_by_browser.edge(serverUrl);
			return;
		}
	}

	console.log("opening default browser ...");
	open_url_by_browser(serverUrl);
}

cq(null, [
	//help 
	function (err, data, que) {
		if ("help" in cfg) {
			console.log(helpList.join("\n"));
			return que.final(err, data, "exit-forcely");
		}
		if ("stop" in cfg) {
			console.log("try to stop server ...");

			http_request_text(
				'http://' + ip + ":" + cfg.http_port + '/?cmd=stopTpsvr',
				{ method: "GET", timeout: 1000 }, "", null,
				function (err, data) {
					console.log(err ? err.responseText : (data && data.responseText));

					que.final(err, data, "exit-forcely");
				}
			);

			return;
		}

		return true;
	},
	//"load version", 
	function (err, data, que) {
		http_request_text.requestJson(
			'http://' + ip + ":" + cfg.http_port + '/?cmd=getVersion&cwd=' + encodeURIComponent(process.cwd()),
			{ method: "GET", timeout: 1000 }, "", null, que.wait());
	},
	//"on version", 
	function (err, data, que) {
		if (err) {
			//console.log(err, err.message);
			if (err.message && err.message.indexOf("ECONNREFUSED") > 0) {
				que.final(err, data);

				if ("check" in cfg) {		//only check state
					console.log("tpsvr is not running");
					return;
				}

				//start server, by supervisor

				var bundleVer = "";
				if ('bundle' in cfg) { bundleVer = ".bundle" + (cfg.bundle ? ("." + cfg.bundle) : ""); }

				//check main file
				var mainFile = __dirname + "/tpsvr-main" + bundleVer + ".js";
				if (!fs.existsSync(mainFile)) {
					var mainFile0 = mainFile;

					if (!bundleVer) {
						//try .bundle.minimized
						bundleVer = ".bundle.minimized";
						mainFile = __dirname + "/tpsvr-main" + bundleVer + ".js";
					}

					if (!fs.existsSync(mainFile)) {
						console.log("main file unfound, " + mainFile0);
						return;
					}
				}

				var startArgs = [
					"-i",
					__dirname + "/../node_modules," +
					__dirname + "/../output," +
					__dirname + "/../client",
					"-RV",
					"--", mainFile, "--cwd", process.cwd(), "--by-supervisor",
					"bundle_ver", bundleVer,
				];

				var background = ("start" in cfg) && (!cfg['start'] || !cfg['start'].match(/^(foreground|f)$/i));

				if (background) {
					console.log("to start tpsvr in background");

					//child_process.spawn("cmd", ["/c", /*"start", " ", "/b",*/ __dirname + "/../node_modules/.bin/supervisor"]
					//	.concat(startArgs), { detached: true, windowsHide: true, });

					//https://github.com/nodejs/node/issues/21825			//2022-1-3

					child_process.spawn("cscript.exe", [__dirname + "/../bin/windows-start-background.vbs", bundleVer],
						{ cwd: __dirname + "/../bin/", detached: true, windowsHide: true });
				}
				else {
					console.log("to start tpsvr in foreground");
					supervisor.run(startArgs);
				}

				if ("open" in cfg) openServerUrl('http://' + ip + ":" + cfg.http_port + '/', cfg);

				if (background) {
					//process.exit(0);	//don't wait background process
				}
				return;
			}
			console.log(err);
			que.final(err, data, "exit-forcely");
			return;
		}

		console.log("tpsvr is already running, " + data.responseJson +
			", http://" + ip + ":" + cfg.http_port);

		if (("check" in cfg) || ("start" in cfg)) return que.final(err, data, "exit-forcely");		//check state or to start

		if (("add" in cfg) || ("remove" in cfg) ||
			!fs.existsSync(process.cwd() + "/package.json") ||
			data.responseJson.indexOf("cwd=0") < 0) { que.jump(err, data, "arg-start"); return; }

		/*
		rli.question("add current working directory to project? y/n (y): ", function (answer) {
			if (!answer || answer === "y" || answer === "Y") { que.next(); }
			else { que.jump(err, data, "exit-forcely"); }
		});
		*/
		return que.pick(null, process.cwd(), ["add-project", "on-add-project"]);
	},
	":add-project", function (err, path, que) {
		console.log("try adding project, " + path);

		http_request_text.requestJson('http://' + ip + ":" + cfg.http_port + '/?cmd=addProject&path=' + encodeURIComponent(path),
			{ method: "GET", timeout: 1000 }, "", null, que.wait());
	},
	":on-add-project", function (err, data, que) {
		if (err) { console.log("error: " + err.message); }
		else {
			var prj = data && data.responseJson;
			if (prj) console.log("add project ok, " + prj.name + ", " + prj.path);
		}
		return true;
	},
	"arg-start",
	//"arg-add", 
	function (err, data, que) {
		if (!cfg.remove && cfg.add && fs.existsSync(cfg.add)) que.pick(null, cfg.add, ["add-project", "on-add-project"]);
		else que.next();
	},
	":remove-project", function (err, path, que) {
		console.log("try removing project, " + path);

		var item = (fs.existsSync(path) ? 'path' : 'name') + '=' + encodeURIComponent(path);

		http_request_text.requestJson('http://' + ip + ":" + cfg.http_port + '/?cmd=removeProject&' + item,
			{ method: "GET", timeout: 1000 }, "", null, que.wait());
	},
	":on-remove-project", function (err, data, que) {
		if (err) { console.log("error: " + err.message); }
		else {
			var name = data && data.responseJson;
			if (name) console.log("remove project ok, " + name);
		}
		return true;
	},
	//"arg-remove", 
	function (err, data, que) {
		if (!("remove" in cfg)) { que.next(); return; }

		var removePath = cfg.remove || process.cwd();	//default removing current working directory

		return que.pick(null, removePath, ["remove-project", "on-remove-project"]);
	},
	//other
	function (err, data, que) {
		//open default browser
		if ("open" in cfg) openServerUrl('http://' + ip + ":" + cfg.http_port + '/', cfg);
		return true;
	},
	"exit-forcely", function (err, data, que) {
		//exit forcely
		if (process.ppid && ("by-supervisor" in cfg)) {		//kill parent process, like supervisor.
			//console.log("killing parent process ...");
			process.kill(process.ppid);
		}
		process.exit(0);
		return true;
	},
	function (err, data, que) {
		//exit normally
		return true;
	},
]);
