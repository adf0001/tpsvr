
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

var outputFile = projectDir + "/test/bundle/test-bundle-compatible.js";

//------------------------------
// process

//browserify
var b = require(nodeModulesDir + "/browserify")();

files.forEach((v) => { (typeof v === "string") ? b.add(v) : b.require(v[0], { expose: v[1] }); });

b.transform(nodeModulesDir + "/stringify", { global: true, extensions: [".html", ".css", ".htm"], });
b.transform(nodeModulesDir + "/browserify-falafel-tool", {
	global: true, sourceComment: true, debugInfo: true,
	falafelPlugins: [nodeModulesDir + "/export-to-module-exports", nodeModulesDir + "/static-import-to-require"],
});
b.transform(nodeModulesDir + "/babelify", {
	global: true, retainLines: true, compact: false, sourceType: 'script',
	presets: [[nodeModulesDir + "/@babel/preset-env", { targets: { browsers: ["ie >= 11", "safari >= 5.1.7"] } }]],
});

var onBundle = function (err, buf) {
	if (err) {
		console.error(err);
		process.exit(1);
		return;
	}

	if (outputFile === "stdout") console.log(buf.toString());
	else require("fs").writeFileSync(outputFile, buf);

	console.log("output file " + outputFile);
}

b.bundle(onBundle);
