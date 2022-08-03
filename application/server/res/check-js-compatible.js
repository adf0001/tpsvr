(function check_js_compatible() {
	// add/remove checking statement for your project

	var a = (v) => v + 1;	// arrow function
	var { b, c } = a, a = [], [b] = a;	// destructuring
	a = { b, c };	// shorthand properties
	b = `c=
		${c}`;	// template literals
	b = a?.b?.c;	// optional chaining
	a = { b, ...a };	// spread syntax

	if (!Object.assign) throw "!Object.assign";	// Object.assign
})();