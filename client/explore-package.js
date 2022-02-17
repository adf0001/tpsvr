
var width_splitter = require("htm-tool-ui/lib/width-splitter.js");

var to_px_by_offset = require("to-px-by-offset");
var package_json_to_html = require("package-json-to-html");

var package_json_tool = require("package-json-tool");

var package_dependent = require("./lib/package-dependent.js");
var ui_model_treeview = require("ui-model-treeview");
var path_tool = require("path-tool");
var bind_ui = require("bind-ui");

require("htm-tool-css");	//require ht css

var semver_satisfies = require("package-json-version-tool").satisfy;

module.exports = {
	config: {
		htmlText: require("./explore-package.htm"),

		bindArray: [
			"package-list.list", ["on", "click", "onClickPackageList"],
			"info", ["on", "click", "onClickInfo"],
		],

		init: "init",
	},

	packageDataset: null,		//a package_json_data_set object, refer package-json-data-set @ npm

	packageDependent: null,		//a package_dependent object

	lastSelected: null,		//the name item of the tree-item

	init: function (el) {
		var _this = this;

		//offset splitter left half width
		var elSplitter = this.nme('splitter');
		to_px_by_offset.left(elSplitter);
		elSplitter.style.left = Math.round(parseInt(elSplitter.style.left) - (elSplitter.offsetWidth / 2)) + "px";

		width_splitter(elSplitter, this.nme('package-list'), null,
			[this.nme('info'),], null,
			{
				min: 50,
				callback: function (name) {
					if (name === "move") {
						_this.onInfoResize();
					}
				},
			}
		);

		window.addEventListener('resize', this.onInfoResize.bind(this));
		this.onInfoResize();

	},

	updateVersion: function (elArray, mainVer) {
		if (!(elArray instanceof Array)) elArray = [elArray];

		var i, imax = elArray.length, el, elVer, verMatch;
		for (i = 0; i < imax; i++) {
			el = ui_model_treeview.getNode(elArray[i]);
			elVer = ui_model_treeview.nodePart(el, "pkg-version");

			verMatch = semver_satisfies(mainVer, elVer.textContent);
			elVer.style.color = verMatch ? "black" : "red";
			elVer.title = verMatch ? "" : ('top version is ' + mainVer);
		}
	},

	loadFromNode: function (elNode, cb) {
		var elName = ui_model_treeview.nodeName(elNode);
		var elVersion = ui_model_treeview.nodePart(elNode, 'pkg-version');
		var _this = this;

		var name = elName.textContent;

		var isNew = !this.packageDataset.get(name);

		this.packageDataset.load(this.getParentPath(elNode), name, elVersion.textContent,
			function (err, data) {
				if (err) { cb(err, data); return; }

				elNode.setAttribute("pkg-path", path_tool.keyString(data.path));

				var mainItem = _this.packageDataset.get(name);
				_this.updateVersion(elNode, mainItem.pkg.version);
				if (isNew) {
					//update unloaded nodes
					var depItem = _this.packageDependent.data[name];
					if (depItem) {
						_this.updateVersion(Object.keys(depItem.ids), mainItem.pkg.version);
					}
				}

				if (package_json_tool.anyDependencies(data.pkg)) {
					if (!ui_model_treeview.nodeChildren(elNode)) {
						_this.addPackageChildren(elNode, data, false, true);
					}
				}
				else {
					ui_model_treeview.setToExpandState(elNode, "disable");
					ui_model_treeview.nodeToExpand(elNode).classList.remove("cmd");
				}
				cb(err, data);
			}
		);
	},

	onClickPackageList: function (evt) {
		var el = evt.target;
		if (!el.classList.contains("cmd")) return;
		var _this = this;

		if (el.classList.contains("tree-to-expand")) {
			var elChildren = ui_model_treeview.nodeChildren(el.parentNode);
			if (elChildren) {
				var toShow = (elChildren.style.display == "none");

				ui_model_treeview.setToExpandState(el.parentNode, toShow ? false : true);
				elChildren.style.display = toShow ? "" : "none";
			}
			else {
				var elNode = ui_model_treeview.getNode(el);

				this.loadFromNode(elNode, function (err, data) {
					if (err) return;

					if (package_json_tool.anyDependencies(data.pkg)) {
						ui_model_treeview.setToExpandState(elNode, false);
						ui_model_treeview.nodeChildren(elNode).style.display = "";
					}
				});
			}
			return;
		}
		else if (el.classList.contains("pkg-dev")) {
			var elNode = ui_model_treeview.getNode(el.parentNode.parentNode);
			var elName = ui_model_treeview.nodeName(elNode);
			this.addPackageChildren(elNode, this.packageDataset.get(elName.textContent), true);
			return;
		}
		else if (el.classList.contains("tree-name")) {
			if (this.lastSelected) this.lastSelected.classList.remove("selected");
			el.classList.add("selected");
			this.lastSelected = el;

			var elNode = ui_model_treeview.getNode(el);

			this.loadFromNode(elNode, function (err, data) {
				if (err) return;
				_this.updateInfo(data);
			});

			return;
		}
	},

	getParentPath: function (elNode) {
		var elParent = ui_model_treeview.getNode(elNode.parentNode);
		return elParent && elParent.getAttribute("pkg-path");
	},

	formatContent: function (name, versionText, toExpand, isDevelope) {
		var a = [];

		a[a.length] = "<span" +
			(toExpand ? " class='ht cmd tree-to-expand'" : "") +
			" style='padding:0em 0.5em;text-decoration:none;font-family:monospace;font-size:9pt;'>" +
			(toExpand ? "+" : ".") +
			"</span>";

		a[a.length] = "<span class='ht cmd tree-name'" + (isDevelope ? " style='color:black;'" : "") + ">" + name + "</span>";

		//check version
		var pkgItem = this.packageDataset.get(name);

		var verMatch = pkgItem ? semver_satisfies(pkgItem.pkg.version, versionText) : null;

		var verColor = pkgItem ? (verMatch ? "black" : "red") : "gray";
		var verTitle = pkgItem ? (verMatch ? "" : (" title='top version is " + pkgItem.pkg.version + "'")) : "";

		a[a.length] = "<span class='pkg-version' style='margin-left:0.5em;font-size:9pt;" +
			"color:" + verColor + ";" + "'" + verTitle +
			">" + versionText + "</span>";

		a[a.length] = "<span class='pkg-dependent' style='margin-left:1em;font-size:9pt;'></span>";

		return a.join("");
	},

	addDependItems: function (elChildren, items, isDevelope) {
		var parentName = ui_model_treeview.nodeName(elChildren).textContent;

		var i, content, el;
		for (i in items) {
			content = this.formatContent(i, items[i], true, isDevelope);
			el = ui_model_treeview.addChild(elChildren, { content: content }, true);
			this.packageDependent.add(i, parentName, ui_model_treeview.nodePart(el, "pkg-dependent"));
		}
	},

	addPackageChildren: function (elNode, pkgItem, isDevelope, hide) {
		var pkg = pkgItem.pkg;

		if (!package_json_tool.anyDependencies(pkg)) {
			ui_model_treeview.setToExpandState(elNode, "disable");
			return;
		}

		var elChildren = ui_model_treeview.nodePart(elNode, "tree-children", true);
		if (elChildren && hide) elChildren.style.display = "none";

		if (!isDevelope) {
			if (pkg.dependencies) {
				this.addDependItems(elChildren, pkg.dependencies);
			}
			if (package_json_tool.hasDependencies(pkg, "dev")) {
				var html = "<div class='tree-delay'><span class='ht cmd pkg-dev' style='color:gray;margin-left:1em;text-decoration:none;'>... devDependencies</span></div>";
				ui_model_treeview.addChild(elChildren, { html: html }, true);
			}
		}
		else {
			if (elChildren.lastChild && elChildren.lastChild.classList.contains("tree-delay")) {
				elChildren.removeChild(elChildren.lastChild);

				this.addDependItems(elChildren, pkg.devDependencies, true);
			}
		}
	},

	localUrlCallback: null,

	onClickInfo: function (evt) {
		if (evt.target.classList.contains("local-label")) {
			var url = evt.target.previousSibling.href;
			if (url && this.localUrlCallback) this.localUrlCallback(url);
		}
	},

	updateInfo: function (pkgItem) {
		var isDirect = this.packageDataset.isDirect(pkgItem);

		var opt = {
			packageDir: pkgItem.path,
			rootPackageDir: this.packageDataset.top.path,
			packageDirUrl: ("/" + this.packageDataset.top.name + "/\*\/" +
				pkgItem.path.slice(this.packageDataset.top.path.length) + "/")
				.replace(/\\/g, "/").replace(/\/+/g, "/"),

			localLabel: "tpsvr",
			localLabelTitle: "open in tpsvr ui",

			versionStyle: isDirect ? "" : "color:red;",
		};

		this.nme('info').innerHTML = "<div style='overflow:auto;height:100%;white-space:nowrap;'>" +
			package_json_to_html(pkgItem.pkg, opt) + "</div>";
	},

	onInfoResize: function () {
		var titleHeight = this.nme("title", true).parentNode.offsetHeight;
		var elList = this.nme("package-list.list");
		if (parseInt(elList.style.top) != titleHeight) elList.style.top = titleHeight + "px";

	},

	popupOptions: { dragMode: "first", maximized: true },	//default popup options

	updateView: function (packageDataset) {

		var elList = this.nme('package-list.list');

		this.packageDataset = packageDataset;

		this.packageDependent = new package_dependent.class();

		this.lastSelected = null;

		//add root
		elList.innerHTML = "";

		var topItem = packageDataset.top;
		var topPkg = topItem.pkg;

		var elRoot = ui_model_treeview.addChild(elList,
			{ contentHtml: this.formatContent(topPkg.name, topPkg.version), }, true);

		//console.log(topItem.path);
		elRoot.setAttribute("pkg-path", path_tool.keyString(topItem.path));

		//children
		this.addPackageChildren(elRoot, topItem);

		//info
		this.updateInfo(topItem);
	},
};

module.exports.class = function (el, cb) {
	return bind_ui(el, Object.create(module.exports), null, cb);
}
