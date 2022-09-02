
//global variable, for html page, refer tpsvr @ npm.
package_name_var = require("../package-main-file");

module.exports = {

	"package_name_var": function (done) {
		//if (typeof window !==/=== "undefined") throw "disable for browser/nodejs";

		package_name_var;

		done(!(
			package_name_var
		));
	},

	"check exports": function (done) {
		var m= package_name_var;
		for (var i in m) {
			if (typeof m[i] === "undefined") { done("undefined: " + i); return; }
		}
		done(false);

		console.log(m);
		var list = "export list: " + Object.keys(m).join(", ");
		console.log(list);
		return list;
	},

};

// for html page
//if (typeof setHtmlPage === "function") setHtmlPage("title", "10em", 1);	//page setting
if (typeof showResult !== "function") showResult = function (text) { console.log(text); }

//for mocha
if (typeof describe === "function") describe('package_name_var', function () { for (var i in module.exports) { it(i, module.exports[i]).timeout(5000); } });
