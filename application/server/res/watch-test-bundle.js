
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
b.transform(nodeModulesDir + "/browserify-falafel-tool", { global: true, falafelPlugins: [nodeModulesDir + "/export-to-module-exports", nodeModulesDir + "/static-import-to-require"], sourceComment: true, debugInfo: true });

var onBundle = function (err, buf) {
	if (err) {
		console.error(err);
		//process.exit(1);	//don't exit for watchify
		return;
	}

	if (outputFile === "stdout") console.log(buf.toString());
	else require("fs").writeFileSync(outputFile, buf);
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
