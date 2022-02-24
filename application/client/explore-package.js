
var bind_ui = require("bind-ui");
var package_json_explore_view = require("package-json-explore-view");

explorePackage = {
	config: {
		htmlText: require("./explore-package.htm"),

		bindArray: [
			".refresh", ["on", "click", "onClickRefresh"],
		],

		init: "init",
	},

	packageView: null,		//a package_json_explore_view object
	packageDataset: null,		//a package_json_data_set object, refer package-json-data-set @ npm

	init: function (el) {
		this.packageView = package_json_explore_view.class(this.nme("package-view"));
	},

	setLocalLabel: function (label, title, clickListener) {
		this.packageView.localLabel = label;
		this.packageView.localLabelTitle = title;

		if (clickListener) this.packageView.nme(".info").addEventListener("click", clickListener);
	},

	onClickRefresh: function () {
		this.updateView(this.packageDataset);
		this.nme(".package-view").firstChild.scrollTop = 0;
	},

	onInfoResize: function () {
		var titleHeight = this.nme("title", true).parentNode.offsetHeight;
		var elList = this.nme("package-list.list");
		if (parseInt(elList.style.top) != titleHeight) elList.style.top = titleHeight + "px";

	},

	popupOptions: { dragMode: "first", maximized: true },	//default popup options

	updateView: function (packageDataset) {
		this.packageDataset = packageDataset;
		this.packageView.updateView(packageDataset);
	},
};

module.exports.class = function (el, cb) {
	return bind_ui(el, Object.create(explorePackage), null, cb);
}
