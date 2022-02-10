
//tools for package.json

var hasChildren = function (pkg) {
	return (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) ||
		(pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0);
}

module.exports = {
	hasChildren: hasChildren,
}
