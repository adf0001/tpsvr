
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
	[projectDir + "/" + _package_json.main, _package_json.name],
];

var outputFile = projectDir + "/test/bundle/main-bundle-minimized.js";

//------------------------------
// process

// browserify
var b = require(nodeModulesDir + "/browserify")();

files.forEach((v) => { (typeof v === "string") ? b.add(v) : b.require(v[0], { expose: v[1] }); });

b.plugin(nodeModulesDir + "/bundle-collapser/plugin");

b.transform(nodeModulesDir + "/browserify-stringify-minimize-css-content", { global: true, });
b.transform(nodeModulesDir + "/stringify", { global: true, minify: true, extensions: [".html", ".css", ".htm"] });
b.transform(nodeModulesDir + "/browserify-falafel-tool", {
	global: true,
	falafelPlugins: [nodeModulesDir + "/export-to-module-exports", nodeModulesDir + "/static-import-to-require"]
});

var onBundle = function (err, buf) {
	if (err) {
		console.error(err);
		process.exit(1);
		return;
	}
	//console.log(buf.toString());

	// terser
	var terser = require(nodeModulesDir + "/terser");
	terser.minify(buf.toString()).then(
		result => {
			var code = result.code;
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

			console.log("output file " + outputFile);
		},
		reason => {
			console.error(reason);
			process.exit(2);
		}
	);
}

b.bundle(onBundle);
