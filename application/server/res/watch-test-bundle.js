
//------------------------------
// config

var nodeModulesDir = "node_modules",
	projectDir = __dirname + "/../..";

//------------------------------
// arguments

process.argv.forEach((v, i, a) => {
	if (v.match(/^\-\-(nodeModulesDir|projectDir)$/)) eval(v.slice(2) + "=a[i+1]");
});

var _package_json = require(projectDir + "/package.json");

var files = [
	[projectDir + "/package.json", "_package_json"],
	[projectDir + "/test/test-data.js", "_test_data"],
	[projectDir + "/" + _package_json.main, _package_json.name],
];

var outputFile = projectDir + "/test/bundle/test-bundle.js";

//------------------------------
// process

//browserify
var b = require(nodeModulesDir + "/browserify")({ cache: {}, packageCache: {} });	//cache for watchify

files.forEach((v) => { (typeof v === "string") ? b.add(v) : b.require(v[0], { expose: v[1] }); });

b.transform(nodeModulesDir + "/stringify", { global: true, extensions: [".html", ".css", ".htm"], });
b.transform(nodeModulesDir + "/browserify-falafel-tool", {
	global: true, sourceComment: true, debugInfo: true,
	falafelPlugins: [nodeModulesDir + "/export-to-module-exports", nodeModulesDir + "/static-import-to-require"],
});

var onBundle = function (err, buf) {
	if (err) {
		console.error(err);
		//process.exit(1);	//don't exit, for watchify
		return;
	}

	var code = buf.toString();
	var fs = require("fs");

	//optional prefix check-js-compatible.js; remove the file to disable;
	var fn = projectDir + "/test/build/check-js-compatible.js";
	if (fs.existsSync(fn)) {
		code = fs.readFileSync(fn).toString()
			.replace(/[\r\n]+\s*\/\/.*[\r\n]+/g, "\n")	//remove single line comment
			.replace(/[\r\n]+$/, "\n") +	//remove tail line break
			"\n" + code;
	}

	if (outputFile === "stdout") console.log(code);
	else fs.writeFileSync(outputFile, code);
}

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

//bundle
b.bundle(onBundle);
