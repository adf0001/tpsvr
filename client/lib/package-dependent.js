
//data set of package.json dependent.

var ht = require("htm-tool");

var packageDependent = {
	data: null,		//map name to {count, dependent:{parent->1},ids:{elId->1}}

	init: function () {
		this.data = {};
	},

	//return dependent item
	add: function (name, parentName, elDependent) {
		var depItem = this.data[name];
		if (!depItem) depItem = this.data[name] = { count: 0, dependent: {}, ids: {} };

		if (elDependent) {
			depItem.ids[ht.eleId(elDependent)] = 1;
			this.formatEl(elDependent, depItem);
		}

		if (!depItem.dependent[parentName]) {
			depItem.dependent[parentName] = 1;
			depItem.count++;
			if (depItem.count > 1) {
				var i, el;
				for (i in depItem.ids) {
					el = ht(i);
					this.formatEl(el, depItem);
				}
			}
		}

		return depItem;
	},

	formatEl: function (elDependent, dependItem) {
		if (dependItem.count < 2) return;

		elDependent = ht(elDependent);

		elDependent.title = "Dependents count: " + dependItem.count + "\n" + Object.keys(dependItem.dependent).join(", ");
		elDependent.textContent = "[" + dependItem.count + "]";
	},

}

//module

exports["class"] = function () {
	var o = Object.create(packageDependent);
	o.init();
	return o;
}
