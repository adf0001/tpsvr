(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (__dirname){(function (){

//project data

var fs = require("fs");
var path = require("path");

var data = {};	//map project name to {name,path,config}
var dataFlag = {};		//map project-config-path to name, to checked duplicated.

var save = function () {
	var i, a = [];
	for (i in data) { a[a.length] = data[i].path; }
	a.sort();
	var saveDir = __dirname + "/../../../output";

	if (!fs.existsSync(saveDir)) {
		fs.mkdirSync(saveDir);
	}
	fs.writeFileSync(saveDir + "/project-list.json", JSON.stringify(a, null, "\t"));
}

var load = function () {
	var loadFile = path.normalize(__dirname + "/../../../output/project-list.json");
	//console.log(__dirname, loadFile);

	if (!fs.existsSync(loadFile)) return;

	var projectList;
	try {
		projectList = require(loadFile);
	}
	catch (ex) {
		console.log("load project list fail", loadFile, ex);
		return;
	}
	if (!projectList) return;

	var i, ret;
	for (i = 0; i < projectList.length; i++) {
		try {
			ret = add(projectList[i], true);
			if (ret instanceof Error) {
				console.log("load project fail", projectList[i], ret.message);
			}
			else {
				console.log("load project from " + projectList[i]);
			}
		}
		catch (ex) {
			console.log("load project fail", projectList[i], ex);
		}
	}
}

var add = function (projectPath, isRestore) {
	if (!projectPath) return Error("empty project path");
	//console.log(projectPath);

	var projectPath = path.normalize(projectPath.replace(/[\\\/]+$/, ""));
	var projectPathU = projectPath.toUpperCase();
	if (projectPathU in dataFlag) return Error("project duplicated, " + dataFlag[projectPathU]);

	if (!fs.existsSync(projectPath + "/package.json")) return Error("unfound project config");

	var cfg;
	try { cfg = require(projectPath + "/package.json") } catch (ex) { }
	if (!cfg) return Error("fail to load project config");

	var nm = cfg.name, i = 2;
	while (nm in data) {
		nm = cfg.name + "-" + i;
		i++;
	}

	data[nm] = { name: nm, path: projectPath, config: cfg };
	dataFlag[projectPathU] = nm;
	//console.log("nm",nm);

	if (!isRestore) save();

	return data[nm];
}

var exists = function (projectPath) {
	if (!projectPath) return Error("empty project path");
	//console.log(projectPath);

	var projectPath = path.normalize(projectPath.replace(/[\\\/]+$/, ""));
	var projectPathU = projectPath.toUpperCase();
	return dataFlag[projectPathU] || "";
}

var remove = function (projectPath, byName) {
	if (byName) {
		//remove by name
		var nm = projectPath;
		if (!(nm in data)) return Error("project name unfound, " + nm);
		var projectPathU = data[nm].path.toUpperCase();
	}
	else {
		var projectPath = path.normalize(projectPath.replace(/[\\\/]+$/, ""));
		var projectPathU = projectPath.toUpperCase();
		if (!(projectPathU in dataFlag)) return Error("project unfound");
		var nm = dataFlag[projectPathU];
	}

	delete data[nm];
	delete dataFlag[projectPathU];

	save();

	return nm;
}

// module

module.exports = {
	data: data,

	add: add,
	remove: remove,
	exists: exists,

	save: save,
	load: load,
};

}).call(this)}).call(this,require("path").join(__dirname,"lib"))
},{"fs":undefined,"path":undefined}],2:[function(require,module,exports){
(function (__dirname){(function (){

var path = require("path");

var multiple_spawn = require("multiple-spawn");
var response_long_poll_state = require("response-long-poll-state");
var verion_value_set = require("version-value-set");
var delay_set_timeout = require("delay-set-timeout");

var config = require("../tpsvr-config-ref.js");

var project_data = require("./project-data.js");

//state data

var tmidLongPoll = null;

var versionState = new verion_value_set.class(
	//versionState update callback
	function () {
		tmidLongPoll = delay_set_timeout(
			[response_long_poll_state.defaultEventEmitter, "state-change"],
			config.long_poll_state_delay,
			tmidLongPoll,
			config.long_poll_state_delay + 3000
		);
	}
);

// long poll

var lastLongPollState = { version: {} };

/*
function refreshLongPoll() {
	if (lastLongPollState) lastLongPollState.data = null;
	response_long_poll_state.defaultEventEmitter.emit("state-change");
}
*/

function getLongPollState() {
	if (lastLongPollState.data) return lastLongPollState;

	//get new versioned state
	var newState = versionState.getDiff(lastLongPollState.version);

	//save as last
	Object.assign(lastLongPollState.version, newState.version);	//save as different object
	lastLongPollState.data = newState.data;

	return lastLongPollState;
}

//state: sys
var updateSys = function () {
	if (lastLongPollState) lastLongPollState.data = null;

	versionState.update("sys", {
		dirname: path.normalize(__dirname + "/.."),
		server_file_exec: config.extension_server_file_exec,
		platform: process.platform,
	});
}
updateSys();

//state: bundle
var updateFromMultipleSpawn = function (groupName) {
	if (lastLongPollState) lastLongPollState.data = null;

	var item = multiple_spawn.spawnItem(groupName);

	var state = {};
	for (var i in item) {
		if (item[i]) state[i] = 1;
	}
	versionState.update(groupName, state);
}

var updateBundle = function () { updateFromMultipleSpawn("bundle"); }
updateBundle();

//state: projects
var updateProjects = function () {
	if (lastLongPollState) lastLongPollState.data = null;

	var state = {};
	for (var i in project_data.data) {
		state[i] = 1;
	}
	versionState.update("projects", state);
}
//updateProjects();		//empty when start, don't update

// module

module.exports = {
	versionState: versionState,

	//refreshLongPoll: refreshLongPoll,
	getLongPollState: getLongPollState,

	updateSys: updateSys,
	updateBundle: updateBundle,
	updateProjects: updateProjects,
};

}).call(this)}).call(this,require("path").join(__dirname,"lib"))
},{"../tpsvr-config-ref.js":3,"./project-data.js":1,"delay-set-timeout":7,"multiple-spawn":10,"path":undefined,"response-long-poll-state":13,"version-value-set":17}],3:[function(require,module,exports){

//to exclude tpsvr-config.js when bundling

module.exports = require("./tpsvr-config.js");

},{"./tpsvr-config.js":undefined}],4:[function(require,module,exports){
(function (__dirname){(function (){

// easy-http-server extension

var url = require("url");
var fs = require("fs");
var path = require("path");
//var os = require("os");

var response_tool = require("response-tool");
var multiple_spawn = require("multiple-spawn");
var response_long_poll_state = require("response-long-poll-state");
//var property_by_name_list = require("property-by-name-list");

var _package_json = require("../../package.json");

var project_data = require("./lib/project-data.js");
var state_tool = require("./lib/state-tool.js");
var child_process = require("child_process");

var shExt = process.platform.match(/^win/i) ? "bat" : "sh";

var responseErrorOrData = function (res, error, data) {
	if (error) console.log(error.message || error);
	response_tool.errorOrData(res, error, data);
	return true;
}

var getVersion = function (req, res, config) {
	var cwdExists = project_data.exists(decodeURIComponent(req.reqUrl.query.cwd));
	cwdExists = (cwdExists && !(cwdExists instanceof Error)) ? 1 : 0;

	//console.log(config);

	return responseErrorOrData(res, null, _package_json.name + ", " + _package_json.version +
		(config.bundle_ver ? (", " + config.bundle_ver.replace(/^\.+/, "")) : "") +
		", cwd=" + cwdExists);
}

var addProject = function (req, res, config) {
	var prj = project_data.add(decodeURIComponent(req.reqUrl.query.path));
	if (!prj || (prj instanceof Error)) return responseErrorOrData(res, prj || "add project fail");

	console.log("add project " + prj.name + ", " + prj.path);

	state_tool.updateProjects();

	return responseErrorOrData(res, null, prj);
}

var removeProject = function (req, res, config) {
	var name;
	if (req.reqUrl.query.path) name = project_data.remove(decodeURIComponent(req.reqUrl.query.path));
	else if (req.reqUrl.query.name) name = project_data.remove(decodeURIComponent(req.reqUrl.query.name), true);

	if (!name || (name instanceof Error)) return responseErrorOrData(res, name || "remove project fail");

	multiple_spawn.remove(["bundle", name]);

	state_tool.updateProjects();

	return responseErrorOrData(res, null, name);
}

var listProject = function (req, res, config) {
	var name = req.reqUrl.query.project;
	if (name) {
		if (!(name in project_data.data)) {
			return responseErrorOrData(res, "project unfound, " + name);
		}
		return responseErrorOrData(res, null, project_data.data[name]);
	}
	else return responseErrorOrData(res, null, project_data.data);
}

function loadProjectFile(name, filePath, req, res, config) {
	var prj = project_data.data[name];
	if (!prj) {
		return responseErrorOrData(res, "project unfound, " + name);
	}

	var cfg = Object.create(config);
	cfg.filePath = prj.path + "/" + filePath;
	cfg.isRoot = (cfg.filePath.replace(/[\\\/]+$/, "") == prj.path);
	//console.log(cfg.filePath);

	if (filePath === "test/test.htm" && !fs.existsSync(cfg.filePath)) {
		if (fs.existsSync(path.dirname(cfg.filePath) + "/test-data.js")) {
			cfg.filePath = __dirname + "/../client/root/res/test-template.htm";
		}
		else {
			return response_tool.text(res, "(file not exists, 'test/test-data.js', project " + name + ")");
		}
	}

	config.default_process(req, res, cfg);
}

var regBundleClient = /^\/bundle-client(\.[\w\-]+)?\.js$/;

function getClientBundle(req, res, config) {
	var mr = req.reqUrl.pathname.match(regBundleClient);
	if (!mr) {
		response_tool.error(res, "unfound client bundle, " + req.reqUrl.pathname, 404);
		return true;
	}

	var cfg = Object.create(config);
	cfg.filePath = __dirname + "/../client/root/bundle-client.debug" + (mr[1] || "") + ".js";
	//console.log("getClientBundle")

	if (!fs.existsSync(cfg.filePath)) {
		cfg.filePath = __dirname + "/../client/root/bundle-client.minimized" + (mr[1] || "") + ".js";
	}
	cfg.isRoot = false;

	config.default_process(req, res, cfg);

	return true;
}

var startBundle = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);
	var prj = project_data.data[name];
	if (!prj) { return responseErrorOrData(res, "project unfound, " + name); }

	var bundleCmd = prj.path + "/test/test-bundle." + shExt;
	var bundleArgs = null;
	var byShell = false;

	if (!fs.existsSync(bundleCmd)) {
		if (!fs.existsSync(prj.path + "/test/test-data.js")) {
			return responseErrorOrData(res, "files unfound, test-bundle." + shExt + ", test-data.js, " + name);
		}

		byShell = true;

		//create ./test/bundle directory
		if (!fs.existsSync(prj.path + "/test")) fs.mkdirSync(prj.path + "/test");
		if (!fs.existsSync(prj.path + "/test/bundle")) fs.mkdirSync(prj.path + "/test/bundle");

		bundleCmd = path.normalize(__dirname + "/../node_modules/.bin/watchify");
		bundleArgs = [
			"-v ",
			"-o", prj.path + "/test/bundle/test-bundle.js",
			"-g", "[ stringify --extensions [.html .css .htm ] ]",
			"-r", prj.path + "/package.json:_package_json",
			"-r", prj.path + "/test/test-data.js:_test_data",
			"-r", prj.path + "/" + prj.config.main + ":" + name,
		];
		//console.log(bundleCmd, bundleArgs);

		//return responseErrorOrData(res, "user bundle tool unfound, " + bundleCmd);
	}

	var ret = multiple_spawn.start(["bundle", name], bundleCmd, bundleArgs, { shell: byShell, keepHistoryConsole: true },
		function (state) {
			state_tool.updateBundle();
		}
	);

	return responseErrorOrData(res, (!ret || (ret instanceof Error)) ? (ret || "start bundle fail") : null, !!ret);
}

function responseResultFile(res, resultFilePath) {
	fs.stat(
		resultFilePath,
		(err, stats) => {
			responseErrorOrData(res, err,
				err ? ""
					: ("result file, " + stats.size + " bytes,\n" + path.normalize(resultFilePath))
			);
		}
	);
	return true;
}

var tryMinimizeBundle = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);
	var prj = project_data.data[name];
	if (!prj) { return responseErrorOrData(res, "project unfound, " + name); }

	var minimizeCmd = prj.path + "/test/main-minimize." + shExt;
	var minimizeArgs = null;
	var byUserBatch = true;
	var byShell = false;

	if (!fs.existsSync(minimizeCmd)) {
		byUserBatch = false;
		byShell = true;

		//create ./test/bundle directory
		if (!fs.existsSync(prj.path + "/test")) fs.mkdirSync(prj.path + "/test");
		if (!fs.existsSync(prj.path + "/test/bundle")) fs.mkdirSync(prj.path + "/test/bundle");

		//step 1: browserify
		minimizeCmd = path.normalize(__dirname + "/../node_modules/.bin/browserify");
		minimizeArgs = [
			"-v ",
			"-o", prj.path + "/test/bundle/main-bundle-minimized.js",
			"-p", "bundle-collapser/plugin",
			"-g", "[ browserify-stringify-minimize-css-content --minimizeExtensions [ .css ] ]",
			"-g", "[ stringify --extensions [.html .css .htm ] --minify true ]",
			"-r", prj.path + "/" + prj.config.main + ":" + name,
		];
		//console.log(bundleCmd, bundleArgs);
	}

	var nameList = ["minimize", name];
	var ret = multiple_spawn.start(nameList, minimizeCmd, minimizeArgs, { shell: byShell, keepHistoryConsole: true },
		function (state) {
			if (state == "exit") {
				//copy history to "bundle"
				var historyMinimize = multiple_spawn.historyConsole(nameList);
				if (historyMinimize) {
					multiple_spawn.historyConsole(["bundle", name], historyMinimize);
				}

				multiple_spawn.remove(nameList);

				//user batch contain both step 1 & 2
				if (byUserBatch) {
					responseResultFile(res, prj.path + "/test/bundle/main-bundle-minimized.js");
					return;
				}

				//step 2: terser
				minimizeCmd = path.normalize(__dirname + "/../node_modules/.bin/terser");
				minimizeArgs = [
					prj.path + "/test/bundle/main-bundle-minimized.js",
					"-o", prj.path + "/test/bundle/main-bundle-minimized.js",
					"-c",
					"-m"
				];
				ret = multiple_spawn.start(nameList, minimizeCmd, minimizeArgs, { shell: byShell, keepHistoryConsole: true },
					function (state) {
						if (state == "exit") {
							//copy history to "bundle"
							var historyMinimize = multiple_spawn.historyConsole(nameList);
							if (historyMinimize) {
								multiple_spawn.historyConsole(["bundle", name], historyMinimize);
							}

							multiple_spawn.remove(nameList);	//for next time minimized history

							responseResultFile(res, prj.path + "/test/bundle/main-bundle-minimized.js");
						}
					}
				);
				if (ret instanceof Error) return responseErrorOrData(res, ret || "start minimize bundle fail, terser");
			}
		}
	);

	if (ret instanceof Error) return responseErrorOrData(res, ret || "start minimize bundle fail, browserify");

	return true;
}

var stopBundle = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);

	var ret = multiple_spawn.stop(["bundle", name]);

	return responseErrorOrData(res, (!ret || (ret instanceof Error)) ? (ret || "stop bundle fail") : null, ret);
}

var viewConsole = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);
	var nameList = ["bundle", name];

	var history = (req.reqUrl.query.history == "1");
	var clearHistory = (req.reqUrl.query.clearHistory == "1");

	if (clearHistory) {
		multiple_spawn.historyConsole(nameList, null);
	}

	var ret = multiple_spawn.getConsole(nameList, history);
	if (ret instanceof Error) return responseErrorOrData(res, ret || "get console fail");

	if (ret === null && !history) {
		history = true;
		ret = multiple_spawn.getConsole(nameList, history);
		if (ret instanceof Error) return responseErrorOrData(res, ret || "get history console fail");
	}

	//console.log(ret, JSON.stringify(ret));

	var isVoid = true;
	if (ret === null) { ret = "(not exists, [" + nameList + "])"; }
	else if (!ret) { ret = "(void, [" + nameList + "])"; }
	else { isVoid = false; }

	var sa = [
		"<div style='font-size:9pt;'>",
		(history && !isVoid) ? ("<a style='float:right;' href='/?cmd=viewConsole&project=" + encodeURIComponent(name) + "&clearHistory=1'>[clear history]</a><br>") : "",
		(!history) ? ("<a style='float:right;' href='/?cmd=viewConsole&project=" + encodeURIComponent(name) + "&history=1'>[history]</a><br>") : "",
		ret.replace(/^\s+/, "").replace(/\n\n\n+/g, "\n\n").replace(/\n/g, "<br>"),
		"</div>",
	];

	response_tool.text(res, sa.join(""), null, { 'Content-Type': 'text/html;charset=UTF-8' });

	return true;
}

var createTestData = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);
	var prj = project_data.data[name];
	if (!prj) { return responseErrorOrData(res, "project unfound, " + name); }

	if (fs.existsSync(prj.path + "/test/test-data.js")) {
		return responseErrorOrData(res, "file already exists, test/test-data.js, " + name);
	}

	var sFile = fs.readFileSync(__dirname + "/../client/root/res/test-data-template.js", 'utf-8');
	sFile = sFile.replace(/package-main-file/g, prj.config.main)
		.replace(/package_name_var/g, prj.config.name.replace(/\W/g, "_"));

	//create ./test directory
	if (!fs.existsSync(prj.path + "/test")) fs.mkdirSync(prj.path + "/test");

	fs.writeFileSync(prj.path + "/test/test-data.js", sFile);

	return responseResultFile(res, prj.path + "/test/test-data.js");
}

var createTestHtm = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);
	var prj = project_data.data[name];
	if (!prj) { return responseErrorOrData(res, "project unfound, " + name); }

	if (fs.existsSync(prj.path + "/test/test.htm")) {
		return responseErrorOrData(res, "file already exists, test/test.htm, " + name);
	}

	//create ./test directory
	if (!fs.existsSync(prj.path + "/test")) fs.mkdirSync(prj.path + "/test");

	fs.copyFileSync(
		__dirname + "/../client/root/res/test-template.htm",
		prj.path + "/test/test.htm"
	);

	return responseResultFile(res, prj.path + "/test/test.htm");
}

var createBundleTool = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);
	var prj = project_data.data[name];
	if (!prj) { return responseErrorOrData(res, "project unfound, " + name); }

	var destFile = prj.path + "/test/test-bundle." + shExt;

	if (fs.existsSync(destFile)) {
		return responseErrorOrData(res, "file already exists, test/test-bundle." + shExt + ", " + name);
	}

	var sFile = fs.readFileSync(__dirname + "/res/test-bundle-template." + shExt, 'utf-8');
	sFile = sFile.replace(/\%tpsvrPath\%/g, path.normalize(__dirname + "/.."))
		.replace(/\%moduleName\%/g, prj.config.name)
		.replace(/\%moduleMainFile\%/g, prj.config.main)
		;

	if (shExt === "bat") {
		sFile = sFile.replace(/(\r\n|\n\r|\n|\r)/g, "\r\n");	//win7 bug: (bat utf8)+( not-ascii string )+(\r as line break )+(chcp 65001) => bat exec fail
	}

	//create ./test directory
	if (!fs.existsSync(prj.path + "/test")) fs.mkdirSync(prj.path + "/test");

	fs.writeFileSync(destFile, sFile, 'utf8');

	//chmod +x for *.sh
	if (shExt === "sh") {
		child_process.exec("chmod +x " + destFile, (err, data) => {
			if (err) console.log(err);
		});
	}

	return responseResultFile(res, destFile);
}

var loadPackage = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.name);
	var pathFrom = decodeURIComponent(req.reqUrl.query.path);

	var pathParent, unfound = false, packagePath;
	while (!fs.existsSync(packagePath = (pathFrom + "/node_modules/" + name + "/package.json"))) {
		pathParent = path.normalize(pathFrom + "/..");
		if (!pathParent || pathParent == pathFrom || pathParent.length >= pathFrom.length) { unfound = true; break; }
		pathFrom = pathParent;
		//console.log("pathFrom=" + pathFrom);
	}

	if (unfound) {
		response_tool.error(res, "unfound, " + name, 404);
		return true;
	}

	res.setHeader("package-path", encodeURIComponent(packagePath));		//HTTP/2 header in lowcase

	var cfg = Object.create(config);
	cfg.filePath = packagePath;
	cfg.isRoot = false;

	config.default_process(req, res, cfg);
	return true;
}

var createMiniBundleTool = function (req, res, config) {
	var name = decodeURIComponent(req.reqUrl.query.project);
	var prj = project_data.data[name];
	if (!prj) { return responseErrorOrData(res, "project unfound, " + name); }

	var destFile = prj.path + "/test/main-minimize." + shExt;

	if (fs.existsSync(destFile)) {
		return responseErrorOrData(res, "file already exists, test/main-minimize." + shExt + ", " + name);
	}

	var sFile = fs.readFileSync(__dirname + "/res/main-minimize-template." + shExt, 'utf-8');
	sFile = sFile.replace(/\%tpsvrPath\%/g, path.normalize(__dirname + "/.."))
		.replace(/\%moduleName\%/g, prj.config.name)
		.replace(/\%moduleMainFile\%/g, prj.config.main)
		;

	if (shExt === "bat") {
		sFile = sFile.replace(/(\r\n|\n\r|\n|\r)/g, "\r\n");	//win7 bug: (bat utf8)+( not-ascii string )+(\r as line break )+(chcp 65001) => bat exec fail
	}

	//create ./test directory
	if (!fs.existsSync(prj.path + "/test")) fs.mkdirSync(prj.path + "/test");

	fs.writeFileSync(destFile, sFile, 'utf8');

	//chmod +x for *.sh
	if (shExt === "sh") {
		child_process.exec("chmod +x " + destFile, (err, data) => {
			if (err) console.log(err);
		});
	}

	return responseResultFile(res, destFile);
}

var getLongPollState = function (req, res, config) {
	if (req.reqUrl.query.current == "1") {
		response_long_poll_state.getCurrent(res, state_tool.versionState.getDiff());
	}
	else if (req.reqUrl.query.state_version) {
		var state_version = decodeURIComponent(req.reqUrl.query.state_version);
		try {
			state_version = JSON.parse(state_version);
		}
		catch (ex) {
			return responseErrorOrData(res, "state version fail, " + ex.message);
		}

		var newState = state_tool.versionState.getDiff(state_version);
		if (newState.data) {
			response_long_poll_state.getCurrent(res, JSON.stringify(newState));
		}
		else {
			response_long_poll_state(res, state_tool.getLongPollState);
		}
	}
	else {
		response_long_poll_state(res, state_tool.getLongPollState);
	}
	return true;
}

var stopTpsvr = function (req, res, config) {
	response_tool.text(res, "tpsvr stopping ...");
	setTimeout(function () {
		if (process.ppid && ("by-supervisor" in config)) {		//kill parent process, like supervisor.
			console.log("killing parent process ...");
			process.kill(process.ppid);
		}
		process.exit(0);
	}, 200);
	return true;
}

var cmdMap = {
	"getVersion": getVersion,
	"stopTpsvr": stopTpsvr,
	"addProject": addProject,
	"removeProject": removeProject,
	"listProject": listProject,
	"startBundle": startBundle,
	"stopBundle": stopBundle,
	"viewConsole": viewConsole,
	"getLongPollState": getLongPollState,
	"createTestData": createTestData,
	"createTestHtm": createTestHtm,
	"createBundleTool": createBundleTool,
	"tryMinimizeBundle": tryMinimizeBundle,
	"createMiniBundleTool": createMiniBundleTool,
	//"getClientBundle": getClientBundle,
	"loadPackage": loadPackage,
};

var projectDataLoaded = false;

//if the request is processed, return true.
module.exports = function (req, res, config) {
	if (!projectDataLoaded) {
		project_data.load();
		projectDataLoaded = true;

		state_tool.updateProjects();
	}
	//access control
	res.setHeader('Access-Control-Allow-Origin', "*");
	res.setHeader('Access-Control-Allow-Methods', "GET");
	res.setHeader('Access-Control-Allow-Headers', "x-requested-with,content-type");

	var reqUrl = req.reqUrl = url.parse(req.url, true);

	var mr = decodeURIComponent(reqUrl.pathname).match(/^\/([^\*\/]+)\/\*\/(.*$)/);
	if (mr) {
		loadProjectFile(mr[1], mr[2], req, res, config);
		return true;
	}

	if (reqUrl.pathname && reqUrl.pathname.match(regBundleClient)) {
		return getClientBundle(req, res, config);
	}

	if (reqUrl.pathname !== "/") return;

	var query = reqUrl.query;

	//index.htm
	if (!query || !query.cmd) {
		var cfg = Object.create(config);
		cfg.filePath = __dirname + "/../client/root/index.html";
		//console.log(__dirname, cfg.filePath);

		return config.default_process(req, res, cfg);
	};

	if (query.cmd in cmdMap) {
		console.log("cmd=" + query.cmd + ", " + decodeURIComponent(reqUrl.search));
		return cmdMap[query.cmd](req, res, config);
	}

	return responseErrorOrData(res, "cmd unfound, " + query.cmd);
}

}).call(this)}).call(this,require("path").join(__dirname,"."))
},{"../../package.json":18,"./lib/project-data.js":1,"./lib/state-tool.js":2,"child_process":undefined,"fs":undefined,"multiple-spawn":10,"path":undefined,"response-long-poll-state":13,"response-tool":14,"url":undefined}],5:[function(require,module,exports){
(function (__dirname){(function (){

var fs = require('fs');
var path = require('path');

var easy_http_server = require('easy-http-server');
var argv_config = require("argv-config");

var default_tpsvr_config = require("./tpsvr-config-ref.js");
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

}).call(this)}).call(this,require("path").join(__dirname,"."))
},{"./tpsvr-config-ref.js":3,"./tpsvr-extension.js":4,"argv-config":6,"easy-http-server":9,"fs":undefined,"path":undefined}],6:[function(require,module,exports){

// argv-config @ npm
// transfer argv to a config object

module.exports = function (target, argv, workPath, shortKey) {
	if (!target) target = {};
	if (!argv) argv = process.argv;

	//prefix workPath/cwd before "." or "..", except workPath is `false`.
	if (!workPath && workPath !== false) workPath = process.cwd();

	var i, k, v;
	for (i = 0; i < argv.length; i++) {
		if ((k = argv[i]).slice(0, 2) !== "--") {
			if (!shortKey || !(k in shortKey)) continue;
			k = shortKey[k];
		}
		else {
			k = k.slice(2);
		}

		if (!(v = argv[i + 1]) || v.slice(0, 2) === "--" || (shortKey && (v in shortKey))) {
			target[k] = null;
			continue;
		}

		if (v.charAt(0) == "{" && v.slice(-1) == "}") v = eval("(" + v + ")");	//json string
		else if (workPath && v.match(/^\.\.?(\\|\/|$)/)) v = workPath + "/" + v;		//file path

		if (k === "config") Object.assign(target, (typeof v === "string") ? require(v) : v);
		else target[k] = v;

		i++;
	}
	return target;
}

},{}],7:[function(require,module,exports){

// delay-set-timeout @ npm, call setTimeout() with min/max delay.

var mapTimer = new Map();	//map tmid to final-time	//tmid from nodejs is not a number

var clearFinalTime = function (tmidLast) {
	if (!mapTimer.has(tmidLast)) return;

	var finalTime = mapTimer.get(tmidLast);
	mapTimer.delete(tmidLast);
	return finalTime;
}

//delaySetTimeout(callback / [eventEmitter, eventName], delay, tmidLast, maxDelay /*,arg1, arg2, ...*/)
var delaySetTimeout = function (callback, delay, tmidLast, maxDelay /*,arg1, arg2, ...*/) {
	//arguments for nodejs event emitter
	var eventEmitter, eventName;
	if (callback instanceof Array) {
		eventEmitter = callback[0];
		eventName = callback[1];
		if (!eventName) throw "delaySetTimeout emitter fail, event name empty.";
	}

	//final-time from last tmid
	var finalTime;
	if (tmidLast) {
		finalTime = clearFinalTime(tmidLast);
		clearTimeout(tmidLast);
	}

	//final-time from maxDelay
	if (maxDelay) {
		var newFinalTime = (new Date()).getTime() + maxDelay;
		//nearer final-time will replace the old final-time
		if (!finalTime || newFinalTime < finalTime) finalTime = newFinalTime;
	}

	//final delay
	if (finalTime) {
		var finalDelay = finalTime - (new Date()).getTime();
		if (finalDelay < delay) delay = finalDelay;
	}

	//setTimeout
	var args = (arguments.length > 4) ? Array.prototype.slice.call(arguments, 4) : null;
	if (eventEmitter) { (args || (args = [])).unshift(eventName); }
	//console.log(args);

	//console.log("delay-set-timeout delay: " + delay);
	tmidLast = setTimeout(
		function () {
			clearFinalTime(tmidLast);

			//console.log("call delay-set-timeout callback");
			if (eventEmitter) {
				//nodejs event emitter
				eventEmitter.emit.apply(eventEmitter, args);
			}
			else {
				args ? callback.apply(null, args) : callback();
			}
		},
		delay
	);

	if (finalTime) mapTimer.set(tmidLast, finalTime);	//save final-time for later calling

	return tmidLast;	//return same as setTimeout()
}

module.exports = exports = delaySetTimeout;

exports.clearFinalTime = clearFinalTime;

},{}],8:[function(require,module,exports){

module.exports = {
	http_ip: "127.0.0.1",		//http ip
	http_port: 8070,			//http port

	mime: {
		"*": "text/plain",		//default mime type

		"html": "text/html",
		"htm": "text/html",
		"jpg": "image/jpg",
		"css": "text/css",
		"js": "text/javascript",
		"bat": "text/bat",
		"txt": "text/plain",
		"md": "text/x-markdown",
	},

	head_text: "<style>a{display:block;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;text-decoration:none;}a:hover{text-decoration:underline;}div{column-width:10em;}</style>",		//head text for directory browsing

	//root_path: "",			//root path, default is process.cwd()

	//extension: [require("./my-extension.js")],		//extension module list
	//extension_default_process: require("./my-default.js"),		//extension module for default process

};

},{}],9:[function(require,module,exports){

var http = require("http");
var fs = require("fs");
var path = require("path");
//var url = require("url");

var default_config = require("./easy-http-server-config.js");

//process to browse directories and files, config= { ..., filePath, isRoot }
var browse_process = function (req, res, config) {
	var { filePath, isRoot } = config;

	if (!filePath) {
		//filePath = decodeURIComponent(url.parse(req.url).pathname);		//The Legacy URL API is deprecated?
		filePath = decodeURIComponent((new URL(req.url, "http://any/")).pathname);		//crap code by WHATWG URL API
		console.log("browse: " + filePath);
		isRoot = (filePath === "/");

		filePath = config.root_path + filePath;
	}

	//directory
	if (filePath.match(/[\\\/]$/)) {
		fs.readdir(filePath, { withFileTypes: true }, function (err, data) {
			if (err) { console.log(err); res.writeHead(500, { "Content-type": "text/plain;charset=UTF-8" }); res.end("" + err); return; }
			var a = data.map(v => { var dirSlash = v.isDirectory() ? "/" : ""; return "<a href='" + v.name + dirSlash + "'>" + dirSlash + v.name + "</a>"; });
			res.writeHead(200, { "Content-type": "text/html;charset=UTF-8" });
			res.end(config.head_text + "<div>" + (isRoot ? "" : "<a href='../'>/..</a>") + a.join("") + "</div>");
		});
		return true;
	}

	//file
	fs.readFile(filePath, function (err, data) {
		if (err) {
			if (err.code === "ENOENT") { res.writeHead(404, { "Content-type": "text/plain" }); res.end("404 NOT FOUND"); }
			else { console.log(err); res.writeHead(500, { "Content-type": "text/plain;charset=UTF-8" }); res.end("" + err); }
			return;
		};

		var mime = config.mime;
		res.writeHead(200, { "Content-type": mime[path.extname(filePath).toLowerCase().slice(1)] || mime["*"] || "application/octet-stream" });
		res.end(data);
	});

	return true;
}

module.exports = function (userConfig) {
	//config
	var config = Object.assign(Object.create(default_config), userConfig || {});

	["mime"].map(v => {		//combine sub object
		config[v] = Object.assign(Object.create(default_config[v]), (userConfig && userConfig[v]) || {});
	});

	//default root path
	if (!config.root_path) config.root_path = process.cwd();

	//extension
	var extension = config.extension || [];

	//default_process
	var default_process = config.extension_default_process || browse_process;
	config.default_process = default_process;

	//start
	console.log("=".repeat(50));
	console.log("http://" + config.http_ip + ":" + config.http_port + ", start at " + (new Date()));
	console.log("root: " + config.root_path);

	http.createServer(function (req, res) {
		for (var i in extension) { if (extension[i](req, res, config)) return; }

		default_process(req, res, config);

	}).listen(config.http_port, config.http_ip);
}

},{"./easy-http-server-config.js":8,"fs":undefined,"http":undefined,"path":undefined}],10:[function(require,module,exports){

// multiple-spawn @ npm, run multiple nodejs spawn.

var path = require("path");
var child_process = require("child_process");

var property_by_name_list = require("property-by-name-list");
var text_line_array = require("text-line-array");
var pid_descendant = require("pid-descendant");

var spawnData = {};	//map name list path to spawn item { console, commandPath, process, nameList, options }
var historyConsoleData = {};	//map name list path to console history

var spawnItem = function (nameList, value) {
	if (value) {
		//save normalized nameList
		value.nameList = (typeof nameList === "string") ? [nameList] : nameList;

		//property_by_name_list(historyConsoleData, nameList, null, true);	//delete history console

		return property_by_name_list(spawnData, nameList, value);		//set
	}
	else if (typeof value === "undefined") {
		return property_by_name_list(spawnData, nameList);		//get
	}
	else {
		property_by_name_list(spawnData, nameList, value, true);		//delete
	}
}

//var historyConsole = function (nameList [, appendText] )
//		appendText: undefined to get string; `null` to clear; others will append the text;
var historyConsole = function (nameList, appendText) {
	var item = property_by_name_list(historyConsoleData, nameList);
	if (typeof appendText !== "undefined") {
		if (appendText === null) {
			if (item) item.clear();
		}
		else {
			//set
			if (!item) { property_by_name_list(historyConsoleData, nameList, item = text_line_array()); };
			item.add(appendText);
		}
	}
	else {
		//get
		if (!item) return null;
		return item.toString();
	}
}

//options:{ maxConsoleLineNumber, keepHistoryConsole }
var start = function (nameList, commandPath, args, options, eventCallback) {
	var item = spawnItem(nameList);
	if (item) {
		var s = "spawn already started, " + nameList;
		console.log(s);
		return Error(s);
	}

	if (!options) options = {};
	if (!("cwd" in options)) options.cwd = path.dirname(commandPath);
	if (!("shell" in options)) options.shell = true;

	item = {
		console: text_line_array([commandPath + (args ? (" [" + args.join(", ") + "]") : ""), ""], { maxLineNumber: options.maxConsoleLineNumber }),
		commandPath: commandPath,
		options: options
	};
	item.process = child_process.spawn(commandPath, args, options);

	//console.log("pid=" + item.process.pid);

	item.process.stdout.on('data', (data) => {
		//console.log(data);
		var s = data.toString();
		item.console.add(s);
		console.log(nameList + ": " + s.replace(/\s+$/, ""));
	});

	item.process.stderr.on('data', (data) => {
		var s = data.toString();
		item.console.add(s, "stderr: ");
		console.error(nameList + ", stderr: " + s.replace(/\s+$/, ""));
	});

	item.process.on('close', (code) => {
		console.log("spawn closed with code " + code + ", pid=" + item.process.pid + ", " + nameList);

		if (options.keepHistoryConsole && item && item.console && !item.console.isEmpty()) {
			//save history console, if options.keepHistoryConsole is set true
			historyConsole(nameList, [""]);	//new line
			historyConsole(nameList, item.console);
			historyConsole(nameList, ["-----(exited, [" + nameList + "])-----", ""]);	//end note text
		}

		spawnItem(nameList, null);
		if (eventCallback) eventCallback("exit");
	});

	spawnItem(nameList, item);
	if (eventCallback) eventCallback("start");

	return item;
}

var stop = function (nameList) {
	var item = spawnItem(nameList);
	if (!item) return Error("spawn not exists, " + nameList);

	item.process.stdin.end();

	//item.process.kill();
	pid_descendant.kill(item.process.pid);

	return true;
}

//stop and clear history console
var remove = function (nameList) {
	var item = spawnItem(nameList);
	if (item && item.options) item.options.keepHistoryConsole = false;

	property_by_name_list(historyConsoleData, nameList, null, true);
	return stop(nameList);
}

//history: true or "auto"
//item: for debug
//var getConsole = function (nameList [, history [, item]] )
var getConsole = function (nameList, history, item) {
	if (history && history != "auto") return historyConsole(nameList);

	if (!item) item = spawnItem(nameList);

	if (!item) {
		return history ? historyConsole(nameList) : null;
	}

	return item.console ? item.console.toString() : null;
}

// module

module.exports = {
	spawnData: spawnData,

	spawnItem: spawnItem,
	historyConsole: historyConsole,

	start: start,
	stop: stop,
	remove: remove,

	getConsole: getConsole,

};

},{"child_process":undefined,"path":undefined,"pid-descendant":11,"property-by-name-list":12,"text-line-array":16}],11:[function(require,module,exports){

// pid-descendant @ npm, get pid descendant.

/*
comment text from ps-tree @ npm, thanks.

The `ps-tree` module behaves differently on *nix vs. Windows
by spawning different programs and parsing their output.

Linux:
1. " <defunct> " need to be striped
```bash
$ ps -A -o comm,ppid,pid,stat
COMMAND          PPID   PID STAT
bbsd             2899 16958 Ss
watch <defunct>  1914 16964 Z
ps              20688 16965 R+
```

Win32:
1. wmic PROCESS WHERE ParentProcessId=4604 GET Name,ParentProcessId,ProcessId,Status)
2. The order of head columns is fixed ----- !!!
```shell
> wmic PROCESS GET Name,ProcessId,ParentProcessId,Status
Name                          ParentProcessId  ProcessId   Status
System Idle Process           0                0
System                        0                4
smss.exe                      4                228
```
*/

var child_process = require('child_process');

var text_line_array = require('text-line-array');

//==============================
//define result-item as [ppid, pid, name, stat]

var COLUMN_COUNT = 4;

var INDEX_PPID = 0;
var INDEX_PID = 1;
var INDEX_NAME = 2;
var INDEX_STAT = 3;

//------------------------------

var isWindows = (process.platform.slice(0, 3) === 'win');

//getPidDescendant = function (pid, cb)		//set pid=null to get system pid
var getPidDescendant = function (pid, cb) {
	//arguments
	if (typeof (cb) !== "function") throw Error("getPidDescendant require callback function");
	if (!pid) { pid = isWindows ? 0 : 1; }

	pid = pid.toString();

	//exec ps
	var proc = isWindows
		//in windows, the Status is not implemented, and is always empty, refer to https://docs.microsoft.com/zh-cn/windows/win32/cimwin32prov/win32-process?redirectedfrom=MSDN
		? child_process.spawn('wmic.exe', ['PROCESS', 'GET', 'Name,ParentProcessId,ProcessId'])
		: child_process.spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']);

	//result variable
	var headLine = true;		//head line flag.
	var mapPpid = {};	//map ppid to result-item array
	var resultArray = [];		//array of result-item

	//line callback
	var lineCallback = function (lineText) {
		if (!proc || !lineText) return;	//stopped or empty line
		//console.log("[" + lineText + "]");

		var sa = lineText.trim().split(/(\s+)/);	//capture spaces, for name may contain continual spaces

		if (headLine) { headLine = false; return; }	//skip head line

		//parse item
		var item = isWindows
			? [
				sa[sa.length - 3],
				sa[sa.length - 1],
				sa.slice(0, -4).join("")
			]
			: [
				sa[0],
				sa[2],
				sa.slice(6).join(""),
				sa[4]
			];

		var ppid = item[INDEX_PPID];
		if (ppid != item[INDEX_PID]) {		//to avoid duplicated for "0, 0, System Idle Process"
			var ar = (ppid in mapPpid) ? mapPpid[ppid] : (mapPpid[ppid] = []);
			ar[ar.length] = item;	//append
		}

		if (item[INDEX_PID] == pid) resultArray.push(item);
	}

	//text line buffer
	var tla = text_line_array(lineCallback);
	tla.lineSplitter = /[\r\n]+/;		//for wmic.exe use '\r\r\n' to line break

	proc.stdout.on('data', (data) => { tla.add(data.toString()); });

	proc.stdout.on('close', (code) => {
		if (!proc) return;	//stopped

		tla.end();	//for last line
		//console.log(tla.lineArray);

		//collect result
		var i = resultArray.length - 1, ar;

		while (pid) {
			ar = mapPpid[pid];
			if (ar) Array.prototype.push.apply(resultArray, ar);

			i++;
			pid = resultArray[i] && resultArray[i][INDEX_PID];
		}
		cb(null, resultArray);
	});
};

//module

module.exports = exports = getPidDescendant;

exports.COLUMN_COUNT = COLUMN_COUNT;
exports.INDEX_PPID = INDEX_PPID;
exports.INDEX_PID = INDEX_PID;
exports.INDEX_NAME = INDEX_NAME;
exports.INDEX_STAT = INDEX_STAT;

//.kill = function (pid, signal) {
exports.kill = function (pid, signal) {
	getPidDescendant(pid, function (err, data) {
		if (err) { console.log(err); return; }

		for (var i = 0; i < data.length; i++) {
			process.kill(data[i][INDEX_PID], signal);
		}
	});
}

},{"child_process":undefined,"text-line-array":16}],12:[function(require,module,exports){

// property-by-name-list @ npm, get/set object property by name list.

//module.exports = function ( obj, nameList [, value [, deleteValue ] ] )
module.exports = function (obj, nameList, value, deleteValue) {
	if (typeof nameList === "string") nameList = [nameList];

	var i, imax = nameList.length - 1, nli, item;
	//path
	for (i = 0; i < imax; i++) {
		nli = nameList[i];
		item = obj[nli];
		if (!item) item = obj[nli] = {};
		obj = item;
	}
	//item
	if (deleteValue) {
		delete obj[nameList[imax]];
	}
	else if (typeof value !== "undefined") {
		return obj[nameList[imax]] = value;	//last, set
	}
	else {
		return obj[nameList[imax]];	//last, get
	}
}

},{}],13:[function(require,module,exports){

// response-long-poll-state @ npm, http response tool for long polling state

var EventEmitter = require('events');

var string_from_callback = require("string-from-callback");

var defaultEventEmitter = new EventEmitter();

var ACTIVE_PULSE_SECONDS = 20;
var ACTIVE_PULSE_SECONDS_DELAY = ACTIVE_PULSE_SECONDS + 15;	//add 15s

var ACTIVE_PULSE_MAX_COUNT = 1000;

/*
	options:
		.userKey						user-defined callback key
		.ACTIVE_PULSE_SECONDS			default 20 seconds
		.ACTIVE_PULSE_SECONDS_DELAY		default 35 seconds
		.ACTIVE_PULSE_MAX_COUNT			default 1000 times
		.eventEmitter					default global event emitter
*/
function longPollingState(res, stateStringCallback, options) {
	//options
	if (!options) options = {};
	options.ACTIVE_PULSE_SECONDS = options.ACTIVE_PULSE_SECONDS || ACTIVE_PULSE_SECONDS;
	options.ACTIVE_PULSE_SECONDS_DELAY = options.ACTIVE_PULSE_SECONDS_DELAY || ACTIVE_PULSE_SECONDS_DELAY;
	options.ACTIVE_PULSE_MAX_COUNT = options.ACTIVE_PULSE_MAX_COUNT || ACTIVE_PULSE_MAX_COUNT;
	//console.log(options);

	var eventEmitter = options.eventEmitter || defaultEventEmitter;

	//long polling
	console.log("state polling start");

	res.setHeader('Connection', "Keep-Alive");
	res.setHeader('Keep-Alive', "timeout=" + options.ACTIVE_PULSE_SECONDS_DELAY);
	res.writeHead(200, { "Content-type": "text/plain;charset=UTF-8" });
	res.write("/");

	var tmid = null, evtlistener = null;

	var finalCallback = function () {
		if (tmid) { clearTimeout(tmid); tmid = false; };
		if (evtlistener) { eventEmitter.removeListener("state-change", evtlistener); evtlistener = null; };
		if (!res.writableEnded) {

			try { res.end("\n" + string_from_callback(stateStringCallback, options.userKey)); } catch (ex) { }
		}
		console.log("state polling finished");
	}


	//connection timeout
	res.setTimeout(options.ACTIVE_PULSE_SECONDS_DELAY * 1000, finalCallback);
	res.on('close', finalCallback);
	res.on('error', finalCallback);

	//keep live pulse
	var keepLiveCount = 0;

	var keepLiveTimer = function () {
		//console.log("keep live");
		if (!tmid && tmid !== null) return;	//timer has stopped
		if (res.writableEnded) return;		//end()

		res.write("/");
		//console.log("keep live write, " + (new Date()));

		if (++keepLiveCount > options.ACTIVE_PULSE_MAX_COUNT) { finalCallback(); return; }

		if (tmid) { clearTimeout(tmid); tmid = null; }
		tmid = setTimeout(keepLiveTimer, options.ACTIVE_PULSE_SECONDS * 1000);
	}

	keepLiveTimer();

	//listen change event

	evtlistener = finalCallback;
	eventEmitter.once("state-change", evtlistener);
}

function getCurrent(res, stateStringCallback, options) {
	var stateStr = string_from_callback(stateStringCallback, options && options.userKey);
	res.writeHead(200, { "Content-type": "text/plain;charset=UTF-8" });
	res.end("//\n" + stateStr);
}

//module

module.exports = exports = longPollingState;

exports.longPollingState = longPollingState;
exports.defaultEventEmitter = defaultEventEmitter;

exports.getCurrent = getCurrent;

},{"events":undefined,"string-from-callback":15}],14:[function(require,module,exports){

// response-tool @ npm
// response tool

var outputText = function (res, text, status, header) {
	res.writeHead(status || 200, header || { 'Content-Type': 'text/plain;charset=UTF-8' });
	//console.log("text: " + text);
	res.end(text);
}

var outputJson = function (res, json, status, header) {
	outputText(res, JSON.stringify(json), status, header || { 'Content-Type': 'text/json;charset=UTF-8' });
}

var outputError = function (res, error, status, header) {
	var err;

	if (typeof error !== "object") { err = error; }
	else if (error instanceof Error) { err = error.message; }
	else { err = JSON.stringify(error); }

	outputText(res, err, status || 500, header);
}

var outputErrorOrData = function (res, error, data, status, header) {
	if (error) outputError(res, error, status, header);
	else outputJson(res, data, status, header);
}

//module

module.exports = {
	text: outputText,
	json: outputJson,
	error: outputError,
	errorOrData: outputErrorOrData,
}

},{}],15:[function(require,module,exports){

// string-from-callback @ npm, get string from callback.

module.exports = function (callback /*, arg ... */) {
	var typeofCallback = typeof callback;
	if (typeofCallback === "function") {
		callback = callback.apply(null, Array.prototype.slice.call(arguments, 1));
		typeofCallback = typeof callback;
	}

	if (typeofCallback === "string") return callback;
	else return JSON.stringify(callback);
}

},{}],16:[function(require,module,exports){

// text-line-array @ npm, text line array.

var DEAULT_MAX_LINE_NUMBER = 255;

//TextLineArrayClass( [lineArray] [, options] )
//options: { maxLineNumber, lineCallback } | maxLineNumber | lineCallback
function TextLineArrayClass(lineArray, options) {
	//arguments
	if (lineArray && !options && !(lineArray instanceof Array)) { options = lineArray; lineArray = null; }

	this.lineArray = lineArray || [];

	var typeofOptions = typeof options;

	if (typeofOptions === "function") this.lineCallback = options;
	else if (typeofOptions === "number") this.maxLineNumber = options;
	else if (options) {
		if (options.lineCallback) this.lineCallback = options.lineCallback;
		if (options.maxLineNumber) this.lineCallback = options.maxLineNumber;
	}
}

TextLineArrayClass.prototype = {
	lineArray: null,		//buffer

	maxLineNumber: DEAULT_MAX_LINE_NUMBER,
	lastLinePrefix: "",

	lineCallback: null,

	//in some cases, a special lineSplitter should be set, such as when wmic.exe use '\r\r\n' to split line.
	lineSplitter: /\r\n|\n\r|\n|\r/,	//can be replaced with /[\r\n]+/, if to skip void line.

	//.addText: function (text [, linePrefix] )
	addText: function (text, linePrefix) {
		//line prefix
		linePrefix = (linePrefix || "");

		var lineArray = this.lineArray;
		var lineCallback = this.lineCallback;

		//init line-array by linePrefix
		if (lineArray.length < 1) {
			lineArray[0] = linePrefix;
			if (linePrefix) this.lastLinePrefix = linePrefix;
		}

		var sa = text.split(this.lineSplitter);

		//for last line in lineArray and the 1st line of the text
		if (linePrefix === this.lastLinePrefix) {
			lineArray[lineArray.length - 1] = lineArray[lineArray.length - 1] + sa[0];	//append to last
		}
		else {
			if (lineCallback) lineCallback(lineArray[lineArray.length - 1]);

			lineArray[lineArray.length] = linePrefix + sa[0];	//new line for new line-prefix
			this.lastLinePrefix = linePrefix;
		}

		//add the rest
		var i, imax = sa.length - 1, s;
		if (imax > 0) {
			if (lineCallback) lineCallback(lineArray[lineArray.length - 1]);

			for (i = 1; i <= imax; i++) {
				lineArray[lineArray.length] = s = linePrefix ? (linePrefix + sa[i]) : sa[i];
				if (lineCallback && i != imax) lineCallback(s);		//line-callback for previous line
			}
		}

		//keep max line number
		if (lineArray.length > this.maxLineNumber) lineArray.splice(0, lineArray.length - this.maxLineNumber);
	},

	//.addLine: function (textArray [, linePrefix] )
	addLine: function (textArray, linePrefix) {
		if (textArray instanceof TextLineArrayClass) textArray = textArray.lineArray;
		else if (!(textArray instanceof Array)) textArray = [textArray];

		//line prefix
		linePrefix = linePrefix || "";

		var lineArray = this.lineArray;
		var lineCallback = this.lineCallback;

		//callback for last line
		if (lineCallback && lineArray.length > 0) lineCallback(lineArray[lineArray.length - 1]);

		var imax = textArray.length - 1, s;
		for (var i = 0; i <= imax; i++) {
			lineArray[lineArray.length] = s = linePrefix ? (linePrefix + textArray[i]) : textArray[i];
			if (lineCallback && i != imax) lineCallback(s);		//line-callback for previous line
		}

		//save .linePrefix
		if (linePrefix || this.lastLinePrefix) this.lastLinePrefix = linePrefix;

		//keep max line number
		if (lineArray.length > this.maxLineNumber) lineArray.splice(0, lineArray.length - this.maxLineNumber);
	},

	endLine: function () { return this.addLine(""); },

	isEmpty: function () {
		return (this.lineArray.length < 1 || (this.lineArray.length == 1 && !this.lineArray[0]));
	},

	clear: function () {
		this.lineArray = [];
		this.lastLinePrefix = "";
	},

	toString: function () { return this.lineArray.join("\n"); },

	//combine
	add: function (textOrArray, linePrefix) {
		return (typeof textOrArray === "string")
			? this.addText(textOrArray, linePrefix)
			: this.addLine(textOrArray, linePrefix);
	},

};

//shortcut
var shortcuts = { "end": "endLine" };
for (var i in shortcuts) {
	TextLineArrayClass.prototype[i] = TextLineArrayClass.prototype[shortcuts[i]];
}

//module

module.exports = exports = function (lineArray, options) {
	return new TextLineArrayClass(lineArray, options);
}

exports.class = TextLineArrayClass;

},{}],17:[function(require,module,exports){

// version-value-set @ npm, value set with version number

var seed = 0;		//version seed

var VersionValueSetClass = function (updateCallback) {
	this.data = {};
	this.version = {};
	this.updateCallback = updateCallback;
}

VersionValueSetClass.prototype = {
	data: null,		//map name to value
	version: null,		//map name to version number

	updateCallback: null,

	update: function (name, value) {
		this.data[name] = value;
		this.version[name] = ++seed;

		if (this.updateCallback) this.updateCallback(name, value, this.version[name]);
	},

	getDiff: function (oldVersion) {
		if (!oldVersion) return { data: this.data, version: this.version };
		//console.log("getDiff", oldVersion, this.version);

		var i, diffData = {}, cnt = 0;
		for (i in this.version) {
			if (oldVersion[i] !== this.version[i]) {
				diffData[i] = this.data[i];
				cnt++;
			}
		}
		//console.log(diffData);

		if (cnt > 0) return { data: diffData, version: this.version };
		else return { version: this.version };		//only `version` without `data`
	},

}

// module

module.exports = {
	"class": VersionValueSetClass,

	debugResetSeed: function () { seed = 0; },		//debug tool
};

},{}],18:[function(require,module,exports){
module.exports={
  "name": "tpsvr",
  "version": "1.0.1",
  "description": "test page server",
  "main": "application/server/tpsvr-main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "test",
    "http",
    "server"
  ],
  "author": "fwg",
  "license": "ISC",
  "bin": {
    "tpsvr": "bin/cmd.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/adf0001/tpsvr.git"
  },
  "bugs": {
    "url": "https://github.com/adf0001/tpsvr/issues"
  },
  "homepage": "https://github.com/adf0001/tpsvr#readme",
  "dependencies": {
    "@babel/core": "^7.17.5",
    "@babel/plugin-transform-arrow-functions": "^7.16.7",
    "@babel/plugin-transform-block-scoping": "^7.16.7",
    "@babel/plugin-transform-classes": "^7.16.7",
    "@babel/plugin-transform-destructuring": "^7.17.3",
    "@babel/plugin-transform-for-of": "^7.16.7",
    "@babel/plugin-transform-parameters": "^7.16.7",
    "@babel/plugin-transform-regenerator": "^7.16.7",
    "@babel/plugin-transform-shorthand-properties": "^7.16.7",
    "@babel/plugin-transform-spread": "^7.16.7",
    "@babel/plugin-transform-template-literals": "^7.16.7",
    "argv-config": "^1.0.4",
    "babelify": "^10.0.0",
    "browserify-stringify-minimize-css-content": "^1.0.1",
    "bundle-collapser": "^1.4.0",
    "core-js": "^3.21.1",
    "delay-set-timeout": "^1.0.2",
    "easy-http-server": "^1.0.1",
    "htm-tool": "^1.0.23",
    "http-request-text": "^1.0.5",
    "multiple-spawn": "^1.0.14",
    "open-url-by-browser": "^1.0.1",
    "package-json-data-set": "^1.0.2",
    "package-json-explore-view": "^1.0.2",
    "package-json-to-html": "^1.0.1",
    "package-json-tool": "^1.0.1",
    "package-json-version-tool": "^1.0.1",
    "response-long-poll-state": "^1.0.4",
    "response-tool": "^1.0.4",
    "stringify": "^5.2.0",
    "supervisor": "^0.12.0",
    "terser": "^5.11.0",
    "ui-model-treeview": "^1.0.1",
    "version-value-set": "^1.0.2",
    "watchify": "^4.0.0"
  },
  "devDependencies": {}
}

},{}]},{},[5]);
