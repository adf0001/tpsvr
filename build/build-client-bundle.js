
//------------------------------
// config

var nodeModulesDir = __dirname + "/../node_modules",
	projectDir = __dirname + "/..",
	outputFileName = "bundle-client.debug.js";

var compatibleMode = false;
var watchMode = false;
var minimizeMode = false;

//------------------------------
// arguments

process.argv.forEach((v, i, a) => {
	if (v.match(/^\-\-(outputFileName)$/)) eval(v.slice(2) + "=a[i+1]");
	else if (v.match(/^\-\-(compatibleMode|watchMode|minimizeMode)$/)) eval(v.slice(2) + "=true");
});

var files = [
	[projectDir + "/package.json", "_package_json"],
	[projectDir + "/application/client/main-view.js", "main-view"],
	//[projectDir + "/node_modules/htm-tool", "htm-tool"],
];

var outputFile = projectDir + "/application/client/root/" + outputFileName;

var checkJsCompatible = projectDir + "/application/server/res/check-js-compatible.js";	//to disable, set null or remove the file;

if (watchMode && minimizeMode) minimizeMode = false;	//minimizing is disabled in watch mode;

//------------------------------
// process

var path = require("path");
var fs = require("fs");

outputFile = path.normalize(outputFile);

//browserify
var b = require(nodeModulesDir + "/browserify")({ cache: {}, packageCache: {} });	//cache for watchify

files.forEach((v) => {
	if (typeof v === "string") b.add(path.normalize(v));
	else b.require(path.normalize(v[0]), { expose: v[1] });
});

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

if (compatibleMode) {
	b.transform(nodeModulesDir + "/babelify", {
		global: true, retainLines: !minimizeMode, compact: minimizeMode, sourceType: 'script',
		presets: [[nodeModulesDir + "/@babel/preset-env", { targets: { browsers: ["ie >= 11", "safari >= 5.1.7"] } }]],
		plugins: [nodeModulesDir + "/@babel/plugin-transform-object-assign"],
	});
}

function outputCode(code) {
	if (!compatibleMode && checkJsCompatible && fs.existsSync(checkJsCompatible)) {
		//prefix check-js-compatible.js
		var prefixCode = fs.readFileSync(checkJsCompatible);
		if (minimizeMode) {
			code = prefixCode.toString()
				.replace(/[\r\n]+\s*\/\/.*[\r\n]+/g, "\n") +	//remove single line comment
				"\n" + code;
		}
		else {
			code = "//" + checkJsCompatible.replace(projectDir, "").replace(/^[\\\/]+/, "") +
				"\n" + prefixCode + "\n" + code;
		}
	}

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
