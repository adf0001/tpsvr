
//var readline = require('readline');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

var supervisor = require("supervisor");

var http_request_text = require("http-request-text");
var cq = require("callq");
var argv_config = require("argv-config");

var default_tpsvr_config = require("./tpsvr-config.js");
var tpsvr_extension = require("./tpsvr-extension.js");

var _package_json = require("../package.json");

//config

var helpList = [
	"test-page-server cli, v" + _package_json.version,
	"",
	"Usgae: tpsvr [options]",
	"",
	"The default behaviour is trying",
	"	to start test-page-server,",
	"	or to add current directory to project list,",
	"	or to process work according options.",
	"",
	"options:",
	"	-h, --help              show help",
	"",
	"	-a, --add [<dir>]       add directory",
	"	-r, --remove [<dir>]    detach directory",
	"	-o, --open              open default browser",
];

var userConfig;
try {
	userConfig = require(process.cwd() + "/tpsvr-config.js");	//load config file in working dir
} catch (ex) {
	userConfig = {};
}

argv_config(userConfig, null, null, { "-r": "remove", "-a": "add", "-o": "open", "-h": "help" })

var cfg = Object.assign(Object.create(default_tpsvr_config), userConfig || {});

if (cfg.extension && (cfg.extension instanceof Array)) cfg.extension.push(tpsvr_extension);
else cfg.extension = [tpsvr_extension];

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

cq(null, [
	//help 
	function (err, data, que) {
		if ("help" in cfg) {
			console.log(helpList.join("\n"));
			return que.final(err, data, "exit-forcely");
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

				//start server, by supervisor
				supervisor.run([
					"-i",
					__dirname + "/../node_modules," +
					__dirname + "/../output," +
					__dirname + "/../client",
					"-RV",
					"--", __dirname + "/tpsvr-main.js", "--cwd", process.cwd(), "--by-supervisor"])

				if ("open" in cfg) {
					console.log("opening default browser ...");
					child_process.exec('cmd /c start http://' + ip + ":" + cfg.http_port + '/');
				}
				return;
			}
			console.log(err);
			que.final(err, data, "exit-forcely");
			return;
		}

		console.log("tpsvr is already running, " + data.responseJson +
			", http://" + ip + ":" + cfg.http_port);

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
		if ("open" in cfg) {
			console.log("opening default browser ...");
			child_process.execSync('cmd /c start http://' + ip + ":" + cfg.http_port + '/');
		}
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
