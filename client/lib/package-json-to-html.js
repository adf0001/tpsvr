
//format package.json to html text

function formatName(name, style) {
	return "<span style=\"" + (style || "color:gray;display:inline-block;min-width:6em;margin-right:0.5em;") + "\">" + name + ": </span>";
}

/*
options: {
	nameStyle: "",		//for all items

	versionStyle: "",

	packageDir: "",
	rootPackageDir: "",

	packageDirUrl: "",

	localLabel: "",		//for local url, class='local-label'
	localLabelTitle: "",

}
*/
module.exports = function (pkg, options) {
	if (!options) options = {};

	var nameStyle = options.nameStyle;

	var localLabel = options.localLabel
		? (
			"<span class='local-label' " +
			" style='margin-left:1em;font-size:9pt;color:gray;font-style:italic;cursor:pointer;' " +
			(options.localLabelTitle ? (" title='" + options.localLabelTitle + "'") : "") + ">" +
			options.localLabel +
			"</span>"
		)
		: "";

	var a = [];

	a[a.length] = formatName("name", nameStyle) +
		"<a target='_blank' href='https://www.npmjs.com/package/" + pkg["name"] + "'>" + pkg["name"] + "</a>";

	a[a.length] = formatName("version", nameStyle) +
		"<span style=\"" + (options.versionStyle || "") + "\">" + pkg["version"] + "</span>";

	a[a.length] = formatName("description", nameStyle) + (pkg["description"] || "");

	if (pkg["main"]) {
		if (options.packageDirUrl) {
			a[a.length] = formatName("main", nameStyle) +
				"<a target='_blank' href='" + options.packageDirUrl + pkg["main"] + "'>" + pkg["main"] + "</a>" +
				localLabel;
		}
		else {
			a[a.length] = formatName("main", nameStyle) + pkg["main"];
		}
	}

	if (pkg["author"]) {
		a[a.length] = formatName("author", nameStyle) + (pkg["author"].name || pkg["author"]);
	}

	a[a.length] = formatName("license", nameStyle) + (pkg["license"] || "");

	if (pkg["homepage"]) {
		a[a.length] = formatName("homepage", nameStyle) +
			"<a target='_blank' href='" + pkg["homepage"] + "'>" + pkg["homepage"] + "</a>";
	}

	if (pkg["bugs"]) {
		var url = pkg["bugs"].url;
		a[a.length] = formatName("bugs", nameStyle) + "<a target='_blank' href='" + url + "'>" + url + "</a>";
	}

	if (pkg["repository"]) {
		if (pkg["repository"].type == "git") {
			var repo = pkg["repository"].url;
			if (repo.match(/^git\+https?\:/)) {
				var url = repo.slice(4);
				repo = "git+" + "<a target='_blank' href='" + url + "'>" + url + "</a>";
			}
		}
		else {
			var repo = JSON.stringify(pkg["repository"])
		}

		a[a.length] = formatName("repository", nameStyle) + repo;
	}

	if (pkg.keywords) {
		a[a.length] = formatName("keywords", nameStyle) +
			pkg.keywords.map(
				function (v) {
					return "<a target='_blank' href='https://www.npmjs.com/search?q=keywords:" + v + "'>" + v + "</a> ";
				}
			).join("");
	}

	//packageDir
	if (options.packageDir) {
		a[a.length] = "";	//line break

		var packageDir = options.packageDir.replace(/[\\\/]/g, "/").replace(/\/+$/, "");
		var rootPackageDir = options.rootPackageDir
			? options.rootPackageDir.replace(/[\\\/]/g, "/").replace(/\/+$/, "")
			: packageDir;

		var dirHtml = (packageDir == rootPackageDir || (packageDir == (rootPackageDir + "/node_modules/" + pkg.name)))
			? packageDir
			: (
				packageDir.slice(0, rootPackageDir.length + 14) +	//len("/node_modules/")=14
				"<span style='color:orange'>" + packageDir.slice(rootPackageDir.length + 14) + "</span>"
			);

		if (options.packageDirUrl) {
			a[a.length] = formatName("path", nameStyle) + "<a target='_blank' style='color:gray;' href='" + options.packageDirUrl + "'>" +
				dirHtml + "</a>" + localLabel;
		}
		else {
			a[a.length] = formatName("path", nameStyle) + "<span style='color:gray;'>" + dirHtml + "</span>";
		}
	}

	return a.join("<br>");
}
