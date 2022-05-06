
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

var load = function (reload) {
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
			ret = add(projectList[i], true, reload);
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

var add = function (projectPath, isRestore, reload) {
	if (!projectPath) return Error("empty project path");
	//console.log(projectPath);

	var projectPath = path.normalize(projectPath.replace(/[\\\/]+$/, ""));
	var projectPathU = projectPath.toUpperCase();
	if (projectPathU in dataFlag) {
		if (!reload) return Error("project duplicated, " + dataFlag[projectPathU]);

		//remove old for reloading
		var nm = dataFlag[projectPathU];
		delete data[nm];
		delete dataFlag[projectPathU];
	}

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
