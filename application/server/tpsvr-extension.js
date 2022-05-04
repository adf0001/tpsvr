
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

var reloadProject = function (req, res, config) {
	project_data.load();
	return responseErrorOrData(res, null, project_data.data);
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

		bundleCmd = path.normalize(__dirname + "/../../node_modules/.bin/watchify");
		bundleArgs = [
			"-v ",
			"-o", prj.path + "/test/bundle/test-bundle.js",
			"-g", "[ stringify --extensions [.html .css .htm ] ]",
			"-g", "[ browserify-falafel-tool --falafelPlugins [ export-to-module-exports static-import-to-require ] --sourceComment --debugInfo ]",
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
		minimizeCmd = path.normalize(__dirname + "/../../node_modules/.bin/browserify");
		minimizeArgs = [
			"-v ",
			"-o", prj.path + "/test/bundle/main-bundle-minimized.js",
			"-p", "bundle-collapser/plugin",
			"-g", "[ browserify-stringify-minimize-css-content --minimizeExtensions [ .css ] ]",
			"-g", "[ stringify --extensions [.html .css .htm ] --minify true ]",
			"-g", "[ browserify-falafel-tool --falafelPlugins [ export-to-module-exports static-import-to-require ] ]",
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
				minimizeCmd = path.normalize(__dirname + "/../../node_modules/.bin/terser");
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
	sFile = sFile.replace(/\%tpsvrPath\%/g, path.normalize(__dirname + "/../.."))
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
	sFile = sFile.replace(/\%tpsvrPath\%/g, path.normalize(__dirname + "/../.."))
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
	"reloadProject": reloadProject,
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
