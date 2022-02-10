
//data set of package.json, as project data.

var ht = require("htm-tool");

var semver_satisfies = require("semver/functions/satisfies.js");

var path_key = require("./path-key.js");

var packageProject = {

	data: null,		//map project name to {name,path,config,versionConfig={path:config},main}
	top: null,

	init: function (topProject) {
		this.data = {};

		this.top = topProject;
		this.data[topProject.name] = topProject;
	},

	isDirect: function (project) {
		if (project === this.top) return true;
		if (project.main) return false;

		return project.path.replace(/\\/g, "/") ==
			(this.top.path + "/node_modules/" + project.name).replace(/\\/g, "/");
	},

	isTop: function (project) {
		return project && project === this.top;
	},

	get: function (name, pathKey) {
		var prj = this.data[name];
		if (!prj) return null;

		return pathKey ? prj.versionConfig[pathKey] : prj;
	},

	load: function (pathFrom, name, versionRange, cb) {
		var prj = this.data[name];
		if (prj) {
			if (versionRange == prj.config.version || semver_satisfies(prj.config.version, versionRange)) {
				cb(null, prj);
				return;
			}
		}

		var _this = this;
		ht.httpRequestJson("/?cmd=loadPackage&name=" + encodeURIComponent(name) +
			"&path=" + encodeURIComponent(pathFrom), "GET", "", "",
			function (err, data) {
				if (err) { ht.show_log(err.responseText || err); return; }

				var packagePath = decodeURIComponent(data.headers["package-path"]);
				packagePath = ht.dirPart(packagePath).replace(/[\\\/]+$/, "");
				//console.log(packagePath);

				var srcPrj = { name: name, path: packagePath, config: data.responseJson };

				if (_this.isDirect(srcPrj)) {
					_this.data[name] = srcPrj;	//save data
					cb(null, srcPrj);
					return;
				}

				//load from top
				ht.httpRequestJson("/?cmd=loadPackage&name=" + encodeURIComponent(name) +
					"&path=" + encodeURIComponent(_this.top.path), "GET", "", "",
					function (err, data) {
						if (err) { ht.show_log(err.responseText || err); return; }

						var packagePath = decodeURIComponent(data.headers["package-path"]);
						packagePath = ht.dirPart(packagePath).replace(/[\\\/]+$/, "");
						//console.log(packagePath);

						var mainPrj = { name: name, path: packagePath, config: data.responseJson, versionConfig: {} };
						mainPrj.versionConfig[path_key(srcPrj.path)] = srcPrj;
						_this.data[name] = mainPrj;	//save main data

						srcPrj.main = mainPrj;

						cb(null, srcPrj);
					}
				);

			}
		);
	},

}

//module

exports["class"] = function (topProject) {
	var o = Object.create(packageProject);
	o.init(topProject);
	return o;
}
