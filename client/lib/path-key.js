
//format path string as key

module.exports = function (str) {
	return str.replace(/\\/g, "/").replace(/\/+$/, "");
}
