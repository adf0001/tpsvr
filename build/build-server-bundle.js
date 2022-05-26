
//------------------------------
// config

var nodeModulesDir = __dirname + "/../node_modules",
	projectDir = __dirname + "/..",
	outputFileName = "tpsvr-main.bundle.js";

var watchMode = false;
var minimizeMode = false;

//------------------------------
// arguments

process.argv.forEach((v, i, a) => {
	if (v.match(/^\-\-(outputFileName)$/)) eval(v.slice(2) + "=a[i+1]");
	else if (v.match(/^\-\-(watchMode|minimizeMode)$/)) eval(v.slice(2) + "=true");
});

var files = [
	projectDir + "/application/server/tpsvr-main.js",
];

var excludeFiles = [
	projectDir + "/application/server/tpsvr-config.js",
];

var outputFile = projectDir + "/application/server/" + outputFileName;

if (watchMode && minimizeMode) minimizeMode = false;	//minimizing is disabled in watch mode;

//------------------------------
// process

var fs = require("fs");
var path = require("path");

outputFile = path.normalize(outputFile);

//browserify
var b = require(nodeModulesDir + "/browserify")({
	node: true, basedir: path.normalize(projectDir + "/application/server"),
	cache: {}, packageCache: {},	//cache for watchify
});

files.forEach((v) => { b.add(path.normalize(v)); });
excludeFiles.forEach((v) => { b.exclude(path.normalize(v)); });

if (minimizeMode) {
	b.plugin(nodeModulesDir + "/bundle-collapser/plugin");

	b.transform(nodeModulesDir + "/browserify-stringify-minimize-css-content", { global: true, });
}

b.transform(nodeModulesDir + "/stringify", {
	global: true, minify: minimizeMode,
	extensions: [".html", ".css", ".htm"],
});
b.transform(nodeModulesDir + "/browserify-falafel-tool", {
	global: true, sourceComment: !minimizeMode, debugInfo: !minimizeMode,
	falafelPlugins: [nodeModulesDir + "/export-to-module-exports", nodeModulesDir + "/static-import-to-require"],
});

function outputCode(code) {
	if (outputFile === "stdout") console.log(code);
	else {
		fs.writeFileSync(outputFile, code);
		if (!watchMode) console.log("output file " + outputFile);
	}
}

var onBundle = function (err, buf) {
	if (err) {
		console.error(err);
		if (!watchMode) process.exit(1);	//don't exit, for watchify
		return;
	}

	var code = buf.toString();

	if (minimizeMode) {
		// terser
		var terser = require(nodeModulesDir + "/terser");
		terser.minify(code).then(
			result => {
				outputCode(result.code);
			},
			reason => {
				console.error(reason);
				process.exit(2);
			}
		);
	}
	else {
		outputCode(code);
	}
}

if (watchMode) {
	//watchify
	var watchify = require(nodeModulesDir + '/watchify');
	b.plugin(watchify, { ignoreWatch: true });	// ignore '**/node_modules/**'

	b.on('update', function (ids) {
		console.log("files udpated, " + ids);
		b.bundle(onBundle);
	});

	b.on('log', function (msg) {
		console.log(msg + ", at " + (new Date()).toLocaleString() + ", " + outputFile);
	});
}

//bundle
b.bundle(onBundle);
