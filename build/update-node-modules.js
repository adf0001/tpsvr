/*
	Update /node_modules/ by user-definition replacement list.
*/

//------------------------------
// config

var nodeModulesDir = __dirname + "/../node_modules";

var replaceList = [
	"bundle-collapser/lib/replace.js", [
		"ecmaVersion: 8,", "ecmaVersion: 2020,"
	]
];

//------------------------------
// process

var fs = require("fs");
var path = require("path");

nodeModulesDir = path.normalize(nodeModulesDir + "/");

var i, imax = replaceList.length, ri, j, jmax;
var fn, code0, code, codei, updateCount = 0;

function saveCode(fn, code0, code) {
	if (code0 === code) {
		console.log("!!! skip " + fn);
	}
	else {
		fs.writeFileSync(fn, code);
		console.log("file updated, " + fn);
		updateCount++;
	}
}

for (i = 0; i < imax; i++) {
	ri = replaceList[i];
	if (typeof ri === "string") {
		//save previous
		if (fn) saveCode(fn, code0, code);

		fn = path.normalize(nodeModulesDir + ri);
		code = code0 = fs.readFileSync(fn).toString();
		continue;
	}
	if (!(ri instanceof Array)) continue;

	jmax = ri.length;
	for (j = 0; j < jmax; j += 2) {
		codei = code.replace(ri[j], ri[j + 1]);

		console.log(((codei === code) ? "! unchanged" : "updated") + ", " +
			fn.slice(nodeModulesDir.length) + ", replace (" + ri[j] + ") with (" + ri[j + 1] + ")");

		if (codei !== code) code = codei;
	}
}

//save last
if (fn) saveCode(fn, code0, code);

//final message
if (updateCount > 0) console.log("\ndirectory /node_modules/ has been updated, try 'npm i'.");
else console.log("\nnothing updated");
