
var ht = require("htm-tool");
var to_px_by_offset = require("to-px-by-offset");

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
		],

		init: "init",
	},

	projectData: null,

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
					a[a.length] = "<span class='ht-cmd' name=\"" + ks[i] + "\">" + ks[i] + "</span>";
				}
				_this.nme("project-list.list").innerHTML = a.join("<br>");
				_this.updateListCount();;
			}
		);

		this.getLongPollState();
	},

	onClickProjectList: function (evt) {
		var el = evt.target;
		if (el.tagName.toUpperCase() != "SPAN" || el.className.indexOf("ht-cmd") < 0) return;

		if (this.lastSelected) this.lastSelected.classList.remove("ht-selected");
		el.classList.add("ht-selected");
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
		var h = elTopbar.scrollHeight + 1;
		var elFrame = this.nme(".iframe-page").parentNode;
		var elFrameMask = this.nme('iframe-mask');
		if (Math.abs(parseInt(elFrame.style.top) - h) > 1) {
			//console.log("topbar h=" + h);
			elFrame.style.top = h + "px";
			elFrameMask.style.top = h + "px";
		}
	},

	onIframeChange: function () {
		var url = this.nme(".iframe-page").contentWindow.location.href;
		this.nme("top-bar.address-link").textContent = decodeURIComponent(url);
		this.nme("top-bar.address-link").href = url;

		this.onTopbarResize();

		var location = this.nme(".iframe-page").contentWindow.location;
		var pathname = location.pathname;

		var viewType = this.getViewType();
		var isBrowse = (viewType === "browse" && location.href != "about:blank") ? 1 : 0;
		var isBrowseFile = isBrowse && !pathname.match(/[\\\/]$/);

		this.nme("top-bar.browse-tool").style.display = isBrowse ? "" : "none";
		this.nme("go-back").style.display = isBrowseFile ? "" : "none";

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
						"<span class='ht-cmd' name=\"" + name + "\">" + name + "</span>"
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
		var el= ht.ui.selectButtonList("project operations",
			[
				["createTestData", "<div style='text-align:left;' title='create test code, required.'>create file 'test-data.js'</div>"],
				["createBundleTool", "<div style='text-align:left;' title='create test module bundle tool, optional.'>create file 'test-bundle.bat' (optional)</div>"],
				["createTestHtm", "<div style='text-align:left;' title='create test page, optional.'>create file 'test.htm' (optional)</div>"],
				["tryMinimizeBundle", "<div style='text-align:left;' title='try bundling only main module, and minimize it.'>try minimize bundle</div>"],
				["createMiniBundleTool", "<div style='text-align:left;' title='create main module minimize bundle tool, optional.'>create file 'main-minimize.bat' (optional)</div>"],
			],
			{maxHeight:"15em",},
			function (err, data) {
				if (!data) return;

				if (data === "createTestData") _this.createTestData();
				else if (data === "createTestHtm") _this.createTestHtm();
				else if (data === "createBundleTool") _this.createBundleTool();
				else if (data === "tryMinimizeBundle") _this.tryMinimizeBundle();
				else if (data === "createMiniBundleTool") _this.createMiniBundleTool();
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
		var a = [["addProject", "add project"]];

		var name = (this.lastSelected && this.lastSelected.getAttribute("name")) || "";
		if (name) a[a.length] = ["removeProject", "detach project / " + name];

		var _this = this;
		ht.ui.selectButtonList("projects tool",
			a,
			function (err, data) {
				if (!data) return;

				if (data === "addProject") _this.addProject();
				else if (data === "removeProject") _this.removeProject();
			}
		)
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

	addProject: function () {
		ht.prompt("add new project path", function (err, data) {
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
	ht.bindUi(el, Object.create(module.exports), null, cb);
}
