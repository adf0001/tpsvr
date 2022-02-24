
var ht = require("htm-tool");
var to_px_by_offset = require("to-px-by-offset");
var explore_package = require("./explore-package.js");

var package_json_data_set = require("package-json-data-set");

module.exports = {
	config: {
		htmlText: require("./main-view.htm"),
		cssText: require("./main-view.css"),

		bindArray: [
			"project-list.list", ["on", "click", "onClickProjectList"],
			"project-list.tool", ["on", "click", "onClickProjectTool"],
			"top-bar.view-type", ["on", "click", "updateProjectView"],
			"top-bar.operate.bundle", ["on", "click", "onClickBundle"],
			"top-bar.operate.more", ["on", "click", "onClickMore"],
			".iframe-page", ["on", "load", "onIframeChange"],
			"top-bar.browse-tool.vscode", ["on", "click", "onClickVscode"],
			"top-bar.add-package", ["on", "click", "onClickAddPackage"],
			"top-bar.refresh-view", ["on", "click", "onClickRefreshView"],
		],

		init: "init",
	},

	projectData: null,		//map project name to {name,path,config}

	lastSelected: null,

	init: function (el) {
		var _this = this;

		ht.ui.radio_group(this.nme("top-bar.view-type"));

		//offset splitter left half width
		var elSplitter = this.nme('splitter');
		to_px_by_offset.left(elSplitter);
		elSplitter.style.left = Math.round(parseInt(elSplitter.style.left) - (elSplitter.offsetWidth / 2)) + "px";

		ht.ui.width_splitter(elSplitter, this.nme('project-list'), null,
			[this.nme('top-bar'), this.nme('iframe-page').parentNode, this.nme('iframe-mask')], null,
			{
				min: 50,
				callback: function (name) {
					if (name === "start") _this.nme('iframe-mask').style.visibility = "visible";
					else if (name === "move") _this.onTopbarResize();
					else if (name === "stop") _this.nme('iframe-mask').style.visibility = "hidden";
				}
			}
		);

		window.addEventListener('resize', this.onTopbarResize.bind(this));
		this.onTopbarResize();

		ht.httpRequestJson("/?cmd=listProject", "GET", "", "",
			function (err, data) {
				if (err) { _this.nme("project-list.list").innerHTML = JSON.stringify(err); return; }
				_this.projectData = data.responseJson;

				var ks = Object.keys(_this.projectData);
				ks.sort();
				var i, a = [];
				for (i = 0; i < ks.length; i++) {
					a[a.length] = "<span class='ht cmd' name=\"" + ks[i] + "\">" + ks[i] + "</span>";
				}
				_this.nme("project-list.list").innerHTML = a.join("<br>");
				_this.updateListCount();;
			}
		);

		setTimeout(function () { _this.getLongPollState(); }, 1000);		//fix bug: project list will be duplicated, if longPoll is received before listProject.
	},

	onClickProjectList: function (evt) {
		var el = evt.target;
		if (el.tagName.toUpperCase() != "SPAN" || el.className.indexOf("cmd") < 0) return;

		if (this.lastSelected) this.lastSelected.classList.remove("selected");
		el.classList.add("selected");
		this.lastSelected = el;

		this.nme("top-bar.operate").style.display = "";

		this.updateProjectView();

		this.updateSelectedBundleState();
	},

	getViewType: function () {
		return ht.ui.radio_group.getValue(this.nme("top-bar.view-type"));
	},

	lastFrameUrl: "",
	lastFrameTime: 0,	//to avoid multiple events from 1 click, but accept refreshing page on click.

	onClickRefreshView: function () {
		this.updateProjectView();
	},

	updateProjectView: function (evt) {
		//skip from <label>, accept only from <input>
		if (evt && evt.target && evt.target.tagName.toUpperCase() != "INPUT") return;

		if (!this.lastSelected) return;
		var name = this.lastSelected.textContent;
		//var item = this.data[name];

		var viewType = this.getViewType();
		//console.log((new Date()).getTime(), viewType, evt && evt.target);

		var src = "/";

		if (viewType == "browse") src += name + "/*/";
		else if (viewType == "console") src += "?cmd=viewConsole&project=" + encodeURIComponent(name);
		else src += name + "/*/test/test.htm";		//test page

		if (src === this.lastFrameUrl &&
			((new Date()).getTime() - this.lastFrameTime) < 1000) return;	//enable refresh after 1 second

		this.lastFrameUrl = src;
		this.lastFrameTime = (new Date()).getTime();

		this.nme("top-bar.address-link").textContent = "";
		this.nme("top-bar.address-link").href = "";

		this.nme(".iframe-page").src = src;
	},

	onTopbarResize: function () {
		var elTopbar = this.nme("top-bar");
		var h = elTopbar.scrollHeight + 2;	//chrome: scrolling up textarea will cover top horizontal line
		var elFrame = this.nme(".iframe-page").parentNode;
		var elFrameMask = this.nme('iframe-mask');
		if (Math.abs(parseInt(elFrame.style.top) - h) > 1) {
			//console.log("topbar h=" + h);
			elFrame.style.top = h + "px";
			elFrameMask.style.top = h + "px";
		}
	},

	onIframeChange: function () {
		var elIframe = this.nme(".iframe-page");

		var url = elIframe.contentWindow.location.href;
		this.nme("top-bar.address-link").textContent = decodeURIComponent(url);
		this.nme("top-bar.address-link").href = url;

		this.onTopbarResize();

		var location = elIframe.contentWindow.location;
		var pathname = location.pathname;

		var viewType = this.getViewType();
		var isBrowse = (viewType === "browse" && location.href != "about:blank") ? 1 : 0;
		var isBrowseFile = isBrowse && !pathname.match(/[\\\/]$/);

		this.nme("top-bar.browse-tool").style.display = isBrowse ? "" : "none";
		this.nme("go-back").style.display = isBrowseFile ? "" : "none";

		//show add project button
		var elAddPackage = this.nme("top-bar.add-package");
		var enable = false;

		if (url && url.match(/\/package\.json$/)) {
			var pkg = JSON.parse(elIframe.contentWindow.document.body.textContent);
			if (pkg.name && !(pkg.name in this.projectData)) {
				enable = true;
			}
		}

		elAddPackage.style.display = enable ? "" : "none";
	},

	onClickAddPackage: function () {
		var name = this.lastSelected.textContent;
		//console.log(this.projectData[name].path);
		var url = this.nme(".iframe-page").contentWindow.location.href;

		var path = this.projectData[name].path + url.slice(url.indexOf("/*/") + 2).replace(/package\.json$/, "");
		//console.log(path);

		ht.httpRequestJson("/?cmd=addProject&path=" + encodeURIComponent(path), "GET", "", "",
			function (err, data) {
				if (err) { ht.show_log(err.responseText || err); return; }
			}
		);
		//this.nme("top-bar.add-package").style.display = "none";	//behaviour is somehow strange
	},

	onClickVscode: function () {
		var filePath = this.nme("top-bar.address-link").textContent;
		var i = filePath.indexOf("/*/");
		if (i < 0) return;
		filePath = filePath.slice(i + 2);

		var name = this.lastSelected.getAttribute("name");
		var prj = this.projectData[name];

		//console.log(filePath,prj);
		filePath = prj.path + filePath;

		window.open("vscode://file/" + filePath, '_blank');
	},

	onClickBundle: function () {
		if (!this.lastSelected) return;

		var chk = this.nme("top-bar.operate.bundle").checked;
		this.nme("top-bar.operate.bundle").checked = !chk;	//reset, wait state change
		var name = this.lastSelected.textContent;

		ht.httpRequestJson(
			"/?cmd=" + (chk ? "startBundle" : "stopBundle") + "&project=" + encodeURIComponent(name),
			"GET", "", "",
			function (err, data) {
				//console.log(err, data);
				if (err) ht.show_log(err.responseText || err);
			}
		);
	},

	longPoll: null,	// { tmid, xhr, lastState, errorCount }

	getLongPollState: function () {
		var longPoll = this.longPoll || (this.longPoll = { lastState: null, errorCount: 0 });

		if (longPoll.tmid) { clearTimeout(longPoll.tmid); longPoll.tmid = null; }

		if (longPoll.xhr) { longPoll.lastState = null; longPoll.xhr.abort(); longPoll.xhr = null; }

		var _this = this;
		var state_version = (longPoll.lastState && longPoll.lastState.version)
			? encodeURIComponent(JSON.stringify(longPoll.lastState.version))
			: "";

		var xq = longPoll.xhr = ht.httpRequest(
			"/?cmd=getLongPollState&" + (state_version ? ("state_version=" + state_version) : "current=1"),
			"GET", "", "",
			function (err, data) {
				if (longPoll.xhr === xq) longPoll.xhr = null;

				longPoll.tmid = setTimeout(
					_this._getLongPollState || (_this._getLongPollState = _this.getLongPollState.bind(_this)),
					(longPoll.errorCount < 3) ? 1000 : 20000);

				if (err || !data.responseText || !data.responseText.match(/^\/+\s+/)) {
					if (err && err.status !== 0) {
						ht.show_log("long poll state fail, " + err);
						longPoll.lastState = null;
						longPoll.errorCount++;
					}
					return;
				}

				longPoll.errorCount = 0;

				longPoll.lastState = JSON.parse(data.responseText.replace(/^\/+\s+/, ""));
				//console.log(JSON.stringify(longPoll.lastState), longPoll.lastState);
				_this.updateState(longPoll.lastState);
			}
		);
	},

	lastState: null,

	updateState: function (state) {
		var lastState = this.lastState || (this.lastState = { version: {}, data: {} });

		var i, j, si, lsi;
		for (i in state.data) {
			si = state.data[i];
			lsi = lastState.data[i];
			if (!lsi) lsi = lastState.data[i] = {};

			for (j in si) {
				if (si[j] != lsi[j]) {
					lsi[j] = si[j];
					if (i === "bundle") this.updateBundleState(j, si[j]);
					else if (i === "projects") this.updateProjectState(j, si[j]);
				}
			}
			for (j in lsi) {
				if (si[j] != lsi[j]) {
					lsi[j] = si[j];
					if (i === "bundle") this.updateBundleState(j, si[j]);
					else if (i === "projects") this.updateProjectState(j, si[j]);
				}
			}
		}
		this.lastState.version = state.version;

		this.updateSelectedBundleState();
	},


	updateSelectedBundleState: function () {
		if (!this.lastSelected || !this.lastState) return;

		var name = this.lastSelected.getAttribute("name");
		var state = this.lastState.data["bundle"] && this.lastState.data["bundle"][name];
		this.updateBundleState(name, state);

		this.nme("top-bar.operate.bundle").checked = !!state;
	},

	updateListCount: function () {
		this.nme("project-list.list-count").innerHTML = Object.keys(this.projectData).length;
	},

	updateProjectState: function (name, state) {
		var el = this.nme('project-list.list').querySelector("span[name='" + name + "']");
		if (el && !state) {
			//console.log("remove single project");
			if (el === this.lastSelected) this.unselectProject();

			//remove <br>
			if (el.previousSibling) el.parentNode.removeChild(el.previousSibling);
			else if (el.nextSibling) el.parentNode.removeChild(el.nextSibling);
			//remove item
			el.parentNode.removeChild(el);

			delete this.projectData[name];
			this.updateListCount();
		}
		else if (!el && state) {
			//console.log("add single project");
			var _this = this;
			ht.httpRequestJson("/?cmd=listProject&project=" + name, "GET", "", "",
				function (err, data) {
					if (err) { ht.show_log(err.responseText || err); return; }
					_this.projectData[name] = data.responseJson;
					var elList = _this.nme("project-list.list");
					ht.appendHtml(elList,
						(elList.firstChild ? "<br>" : "") +		//add <br> if list already has children
						"<span class='ht cmd' name=\"" + name + "\">" + name + "</span>"
					);
					_this.updateListCount();
				}
			);
		}
	},

	updateBundleState: function (name, state) {
		//console.log(name, state);

		var el = this.nme('project-list.list').querySelector("span[name='" + name + "']");
		if (!el) return;

		state ? el.classList.add("state-bundle") : el.classList.remove("state-bundle");
	},

	onClickMore: function () {
		var _this = this;
		var shExt = this.lastState.data.sys.platform;
		shExt = (shExt && shExt.match(/^win/i)) ? "bat" : "sh";

		var el = ht.ui.selectButtonList("Project operations",
			[
				["createTestData", "<div style='text-align:left;' title='create test code, required.'>Create file 'test-data.js'</div>"],
				["createBundleTool", "<div style='text-align:left;' title='create test module bundle tool, optional.'>Create file 'test-bundle." + shExt + "' (optional)</div>"],
				["createTestHtm", "<div style='text-align:left;' title='create test page, optional.'>Create file 'test.htm' (optional)</div>"],
				["tryMinimizeBundle", "<div style='text-align:left;' title='try bundling only main module, and minimize it.'>Try minimize bundle</div>"],
				["createMiniBundleTool", "<div style='text-align:left;' title='create main module minimize bundle tool, optional.'>Create file 'main-minimize." + shExt + "' (optional)</div>"],
			],
			{ maxHeight: "15em", },
			function (err, data) {
				if (!data) return;

				/*
				if (data === "createTestData") _this.createTestData();
				else if (data === "createTestHtm") _this.createTestHtm();
				else if (data === "createBundleTool") _this.createBundleTool();
				else if (data === "tryMinimizeBundle") _this.tryMinimizeBundle();
				else if (data === "createMiniBundleTool") _this.createMiniBundleTool();
				*/
				if (_this[data]) _this[data]();
			}
		)
	},

	sendProjectCmd: function (cmd) {
		var name = (this.lastSelected && this.lastSelected.getAttribute("name")) || "";
		if (!name) { this.unselectProject(); return; }

		ht.httpRequestJson("/?cmd=" + cmd + "&project=" + name, "GET", "", "",
			function (err, data) {
				if (err) { ht.show_log(err.responseText || err); return; }

				var msg = data.responseJson;
				if (typeof msg !== "string") msg = JSON.stringify(msg, null, "\t");
				ht.alert(msg.replace(/[\n\r]+/g, "<br>"), false);
			}
		);
	},

	createTestData: function () { this.sendProjectCmd("createTestData"); },
	createTestHtm: function () { this.sendProjectCmd("createTestHtm"); },
	createBundleTool: function () { this.sendProjectCmd("createBundleTool"); },
	tryMinimizeBundle: function () { this.sendProjectCmd("tryMinimizeBundle"); },
	createMiniBundleTool: function () { this.sendProjectCmd("createMiniBundleTool"); },

	onClickProjectTool: function () {
		var name = (this.lastSelected && this.lastSelected.getAttribute("name")) || "";

		var a = [
			["addProject", "Add project"],
			name ? ["removeProject", "Detach project / " + name] : null,
			//"-",
			name ? ["explorePackage", "Explore package / " + name] : null,
			"-",
			["reloadProject", "Reload all projects"],
		];

		var _this = this;
		ht.ui.selectButtonList("Projects tool",
			a,
			function (err, data) {
				if (!data) return;

				/*
				if (data === "addProject") _this.addProject();
				else if (data === "removeProject") _this.removeProject();
				else if (data === "exploreProject") _this.exploreProject();
				*/

				if (_this[data]) _this[data]();
			}
		)
	},

	explorePackageView: null,

	packageDataset: null,

	loadPackage: function (pathFrom, name, cb) {
		ht.httpRequestJson("/?cmd=loadPackage&name=" + encodeURIComponent(name) +
			"&path=" + encodeURIComponent(pathFrom), "GET", "", "",
			function (err, data) {
				if (err) { ht.show_log(err.responseText || err); cb(err); return; }

				var packagePath = decodeURIComponent(data.headers["package-path"]);
				packagePath = ht.dirPart(packagePath, true);
				//console.log(packagePath);

				cb(null, { path: packagePath, pkg: data.responseJson });
			}
		);
	},
	_loadPackage: null,		//bind .loadPackage() with this

	explorePackage: function () {

		var el = this.nme(".package-view");
		if (!this.explorePackageView) {
			el.innerHTML = "<div class='ht popup-body' style='min-width:30em;min-height:15em;'></div>";
			this.explorePackageView = new explore_package.class(el.firstChild);

			var _this=this;
			this.explorePackageView.setLocalLabel("tpsvr","open in tpsvr ui",
				function(evt){
					if (!evt.target.classList.contains("local-label")) return;
					
					var url = evt.target.previousSibling.href;
					if (!url) return;

					if (_this.getViewType() === "browse") {
						ht.ui.radio_group.setValue(_this.nme("top-bar.view-type"), "browse");
					}
	
					setTimeout(function () { _this.nme(".iframe-page").src = url; }, 200);
				}
			);
		}

		var name = this.lastSelected.getAttribute("name");
		var prj = this.projectData[name];

		//update package data every time, to avoid load sub package from other top project
		if (!this.packageDataset || !this.packageDataset.isTop({ pkg: prj.config, path: prj.path }, true)) {
			this.packageDataset = new package_json_data_set.class(prj.config, prj.path,
				this._loadPackage || (this._loadPackage = this.loadPackage.bind(this))
			);

			this.explorePackageView.updateView(this.packageDataset);
		}


		ht.popup.show(el, this.explorePackageView.popupOptions);
	},

	unselectProject: function () {
		if (!this.lastSelected) return;

		this.nme(".iframe-page").src = "about:blank";
		this.lastSelected = null;

		this.nme("top-bar.operate").style.display = "none";
	},

	removeProject: function () {
		var name = (this.lastSelected && this.lastSelected.getAttribute("name")) || "";
		if (!name) { this.unselectProject(); return; }

		ht.confirm("detach project '" + name + "'?", function (err, data) {
			if (err || !data) return;

			//remove project by 'name' not 'path'
			ht.httpRequestJson("/?cmd=removeProject&name=" + name, "GET", "", "",
				function (err, data) {
					if (err) { ht.show_log(err.responseText || err); return; }
				}
			);
		});

	},

	reloadProject: function () {
		ht.httpRequestJson("/?cmd=reloadProject", "GET", "", "",
			function (err, data) {
				if (err) { ht.show_log(err.responseText || err); return; }
				window.location.reload();
			}
		);
	},

	addProject: function () {
		ht.prompt("add new project path", "", function (err, data) {
			if (err || !data) return;

			ht.httpRequestJson("/?cmd=addProject&path=" + data, "GET", "", "",
				function (err, data) {
					if (err) { ht.show_log(err.responseText || err); return; }
				}
			);
		});

	},

};

module.exports.class = function (el, cb) {
	return ht.bindUi(el, Object.create(module.exports), null, cb);
}
