require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = ".state-bundle:after{\n\tcontent: \"b\";\n\tbackground: lime;\n\tmargin-left:0.5em;\n}\n";

},{}],2:[function(require,module,exports){
module.exports = "<div name='project-list'\n\tstyle='width:10em;position:absolute;left:0px;top:0px;bottom:0px;border-right:1px solid gray;overflow:auto;'>\n\t<center>\n\t\t<span style='font-weight:bold;' name='title'>Projects</span>\n\t\t<span name='tool' class='ht-cmd' title='project tools' style='text-decoration:none;display:inline-block;\n\t\t\tborder:1px solid gray;height:1.1em;border-radius:25%;vertical-align:middle;'>\n\t\t\t•••\n\t\t</span>\n\t</center>\n\t<div name='list' style='padding:0.5em;'></div>\n\t<div style='font-size: 9pt;text-align:right;padding:0.5em;'>count: <i name='list-count'>0</i></div>\n</div>\n<div name='splitter' style='position:absolute;top:0px;bottom:0px;left:10em;width:8px;z-index:1;'></div>\n<div name='top-bar'\n\tstyle='padding-bottom:0.1em;position:absolute;left:10em;top:0px;right:0px;border-bottom:1px solid gray;overflow:auto;'>\n\t<div style=\"font-size:9pt;padding:0em 1em;vertical-align:top;\">\n\t\tView\n\t\t<span name=\"view-type\">\n\t\t\t<label title='test page, click to refresh'><input type=radio value='page' /> page</label>\n\t\t\t<label title='browse path files, click to refresh'><input type=radio value='browse' /> browse</label>\n\t\t\t<label title='executing console view, click to refresh'><input type=radio value='console' /> console</label>\n\t\t</span>\n\t\t<span name='operate' style=\"display:none;\">\n\t\t\t<span style='padding:0px 0.5em;'>|</span>\n\t\t\t<label title='bundle the test module, and watch code change.'><input type=checkbox name='bundle'>bundle</label>\n\t\t\t<span name='more' class='ht-cmd' title='more operations' style='text-decoration:none;display:inline-block;\n\t\t\t\tborder:1px solid gray;height:1.1em;border-radius:25%;vertical-align:text-top;'>\n\t\t\t\t•••\n\t\t\t</span>\n\t\t</span>\n\t\t<span name=\"browse-tool\" style=\"display:none;\">\n\t\t\t<span style='padding:0px 0.5em;'>|</span>\n\t\t\t<span class=\"ht-cmd\" name='vscode' title='open with local VsCode'>VsCode</span>\n\t\t\t<span name=\"file-exec\"></span>\n\t\t</span>\n\t\t<span style='float:right;'>\n\t\t\t<span name='go-back' title='go back' onclick=\"history.go(-1);\" style=\"display:none;cursor:pointer;\">\n\t\t\t\t<img border='0' src='res/arrow-left.png' style=\"height:1.2em;vertical-align:middle;\" />\n\t\t\t</span>\n\t\t\t<a style='color:blue;' href=\"about:blank\" target=\"_blank\" name='address-link'\n\t\t\t\ttitle='open in new window'>about:blank</a>\n\t\t</span>\n\t</div>\n</div>\n<div style=\"position:absolute;left:10em;top:1.5em;bottom:0px;right:0px;box-sizing:border-box;\">\n\t<iframe name=\"iframe-page\" src=\"about:blank\" style=\"width:100%;height:100%;border:none;\"></iframe>\n</div>\n<div name='iframe-mask'\n\tstyle=\"visibility:hidden;position:absolute;left:10em;top:1.5em;bottom:0px;right:0px;box-sizing:border-box;\"></div>";

},{}],3:[function(require,module,exports){

// add-css-text @ npm, add css text.

//if the element by `styleId` already exists, its cssText will be fully replaced.
module.exports = function (cssText, styleId) {
	var style;
	if (styleId && (style = document.getElementById(styleId))) {
		if (style.tagName.toUpperCase() != "STYLE") return;	//fail

		style.textContent = cssText;
	}
	else {
		style = document.createElement("style");
		style.type = "text/css";
		if (styleId) style.id = styleId;

		try {
			style.appendChild(document.createTextNode(cssText));
		}
		catch (ex) {
			style.styleSheet.cssText = cssText;
		}
		document.getElementsByTagName("head")[0].appendChild(style);
	}
};

},{}],4:[function(require,module,exports){

// add-event-listeners @ npm, like .addEventListener(), but add multiple listeners at one time.

//targetN: dom element or dom element id
//argArrayN: [type, listener, options/useCapture ... ], refer addEventListener()
module.exports = function (target1, argArray1 /* , argArray2, ... , target2, ... */) {
	var target, ai;
	for (var i = 0; i < arguments.length; i++) {
		ai = arguments[i];

		if (ai instanceof Array) {
			target.addEventListener.apply(target, ai);
		}
		else {
			target = (typeof ai === "string") ? document.getElementById(ai) : ai;
		}
	}
};

},{}],5:[function(require,module,exports){

// bind-element @ npm, make binding between dom element and js object.

"use strict";

var formatError = require("format-error-tool");
var ele = require("element-tool");
var query_by_name_path = require("query-by-name-path");

var script_tool = require("script-tool");
var findWithFilter = script_tool.findWithFilter,
	mapValue = script_tool.mapValue,
	enclosePropertyDescriptor = script_tool.enclosePropertyDescriptor;

var dom_document_tool = require("dom-document-tool");
var observeSingleMutation = dom_document_tool.observeSingleMutation,
	dispatchEventByName = dom_document_tool.dispatchEventByName;

/*
	bind item:
		an array to configure element binding,
		[ "type", typeOption, member, memberOption ]	//basic format
		where type and typeOption is related to dom object, 
		member and memberOption is related to js object.
		
		or shortcut format,
		[ "type", typeOption | "typeItem", member, memberOption | .biDirection/0x1 | ".notifyEvent" | .watchJs/0x2 ]	//shortcut format
		
			"type"
				dom type string, "on/event|evt/attr/style|css/class/prop|property"
			
			typeOption
				dom type option
				
				".typeItem" / ".item"
					dom type sub-item string;
					shortcut argument is a string;
				
				.valueMapper / .map
					a value mapper for setting dom item, refer to mapValue().
			
			member
				js member
					"propertyName" | "methodName" | function;
			
			memberOption
				js member option
				
				.biDirection / .bi
					set true to bind both from js to dom and from dom to js;
					if not set, bind in default way;
					shortcut argument is a boolean value, or a number value contain 0x1;
					
				.notifyEvent / .notify
					set name string of bi-direction notify event ( will automatically set biDirection=true );
					if not set, use default event "change";
					shortcut argument is a string;
				
				.watchJs / .watch
					if set true, for type "prop", watch dom property change from js ( will automatically set biDirection=true ).
					shortcut argument is a number value contain 0x2;
				
				.valueMapper / .map
					a value mapper for setting js member, refer to mapValue().
				
		type format:
			
			"on":
				event binding by setting GlobalEventHandlers[ "on" + typeItem ],
				
					[ "on", "click", "methodName" | function, extraArgument ]
			
			"evt|event":
				event binding by addEventListener()
				
					[ "event|evt", "click", "methodName" | function, extraArgument={ listenerOptions } ]
			
			"attr":
				attribute binding,
				
					[ "attr", "title", "propertyName", extraArgument={ biDirection } ]
					[ "attr", "title", "methodName" | function, extraArgument ]		//refer to MutationRecord
			
			"css|style":
				style binding
				
					[ "style", "display", "propertyName", extraArgument={ biDirection } ]
					[ "style", "display", "methodName" | function, extraArgument ]		//will also evoke on any other style change; refer to MutationRecord; 
			
			"class":
				element class binding. default binding member is boolean type.
				
					[ "class", "myClass", "propertyName", extraArgument={ biDirection } ]
					[ "class", "myClass", "methodName" | function, extraArgument ]		//will also evoke on any other class change; refer to MutationRecord;
			
			"prop|property":
				property binding,
				
					[ "prop", "value", "propertyName", extraArgument={ notifyEvent, biDirection, watchJs } ]
					[ "prop", "value", "methodName" | function, extraArgument={ notifyEvent, watchJs, listenerOptions } ]
*/

//bind-item index constant
var BI_TYPE = 0,
	BI_TYPE_OPTION = 1,
	BI_MEMBER = 2,
	BI_MEMBER_OPTION = 3;

//bindElement(el, obj, bindItem) or
//bindElement(el, obj, "type", typeOption, member, memberOption )
//return Error if fail, or `true` if success
var bindElement = function (el, obj, bindItem) {

	//-------------------------------------
	//arguments

	el = ele(el);
	var elId = ele.id(el);

	if (typeof bindItem === "string") bindItem = Array.prototype.slice.call(arguments, 2);

	//type
	var type = bindItem[BI_TYPE];

	//typeItem, typeOption
	var typeOption = bindItem[BI_TYPE_OPTION], typeItem, domValueMapper;
	if (typeof typeOption === "string") { typeItem = typeOption; typeOption = null; }
	else {
		typeItem = typeOption.typeItem || typeOption.item;
		domValueMapper = typeOption.valueMapper || typeOption.map;
	}

	if (!typeItem) return formatError("bind typeItem empty", bindItem);

	//member
	var member = bindItem[BI_MEMBER];

	var memberValue;
	if (typeof member === "function") { memberValue = member; }
	else if (member in obj) { memberValue = obj[member]; }
	else return formatError("member unfound", member, bindItem);

	var memberIsFunction = (typeof memberValue === "function");
	var memberThis = (!memberIsFunction || (memberValue !== member)) ? obj : null;

	//memberOption
	var memberOption = bindItem[BI_MEMBER_OPTION], biDirection, notifyEvent, watchJs, jsValueMapper;
	var typeofMo = typeof memberOption;

	if (typeofMo === "boolean") { biDirection = memberOption; memberOption = null; }
	else if (typeofMo === "number") {
		biDirection = memberOption & 0x1;
		watchJs = memberOption & 0x2;
		memberOption = null;
	}
	else if (typeofMo === "string") {
		if (memberOption) { notifyEvent = memberOption; memberOption = null; }
	}
	else if (memberOption) {
		notifyEvent = memberOption.notifyEvent || memberOption.notify;
		biDirection = notifyEvent || memberOption.biDirection || memberOption.bi;
		watchJs = memberOption.watchJs || memberOption.watch;
		jsValueMapper = memberOption.valueMapper || memberOption.map;
	}
	if (!biDirection && (notifyEvent || watchJs)) biDirection = true;

	//-------------------------------------
	//bind event
	if (type == "on" || type == "event" || type == "evt") {
		if (!memberIsFunction) return formatError("bind member is not a function", member, bindItem);

		var bindFunc = function (evt) { return memberValue.apply(memberThis || this, [evt, memberOption]); };

		if (type == "on") { el["on" + typeItem] = bindFunc; }
		else { el.addEventListener(typeItem, bindFunc, memberOption && memberOption.listenerOptions); }

		return true;
	}

	//-------------------------------------
	//bind attribute group
	if (type === "attr" || type === "style" || type === "css" || type === "class") {
		//bind attribute event
		if (memberIsFunction) {
			var attrName = (type === "attr") ? typeItem : type;
			if (attrName === "css") attrName = "style";

			observeSingleMutation(el, attrName,
				function (mutationItem) { return memberValue.apply(memberThis || this, [mutationItem, memberOption]); }
			);
			return true;
		}

		var v0;
		if (type === "attr") {		//bind attribute
			//variable member
			v0 = findWithFilter(null, memberValue, mapValue(jsValueMapper, el.getAttribute(typeItem) || ""), "");

			enclosePropertyDescriptor(obj, member,
				function (v) {
					v = "" + mapValue(domValueMapper, v);
					if (ele(elId).getAttribute(typeItem) !== v) ele(elId).setAttribute(typeItem, v);
				},
				function () { return mapValue(jsValueMapper, ele(elId).getAttribute(typeItem)); }
			);

			if (biDirection) {
				observeSingleMutation(el, typeItem,
					function (mutationItem) { obj[member] = mapValue(jsValueMapper, mutationItem.target.getAttribute(mutationItem.attributeName) || ""); }
				);
			}
		}
		else if (type === "style" || type === "css") {		//bind style
			//variable member
			var v0 = findWithFilter(null, memberValue, mapValue(jsValueMapper, el.style[typeItem] || ""), "");

			enclosePropertyDescriptor(obj, member,
				function (v) {
					v = "" + mapValue(domValueMapper, v);
					if (ele(elId).style[typeItem] !== v) ele(elId).style[typeItem] = v;
				},
				function () { return mapValue(jsValueMapper, ele(elId).style[typeItem]); }
			);

			if (biDirection) {
				observeSingleMutation(el, "style",
					function (mutationItem) { obj[member] = mapValue(jsValueMapper, mutationItem.target.style[typeItem] || ""); }
				);
			}
		}
		else if (type === "class") {		//bind class
			//variable member
			var v0 = findWithFilter(null, memberValue, mapValue(jsValueMapper, el.classList.contains(typeItem)), false);

			enclosePropertyDescriptor(obj, member,
				function (v) {
					v = !!mapValue(domValueMapper, v);
					if (v && !ele(elId).classList.contains(typeItem)) ele(elId).classList.add(typeItem);
					else if (!v && ele(elId).classList.contains(typeItem)) ele(elId).classList.remove(typeItem);
				},
				function () { return mapValue(jsValueMapper, ele(elId).classList.contains(typeItem)); }
			);

			if (biDirection) {
				observeSingleMutation(el, "class",
					function (mutationItem) { obj[member] = mapValue(jsValueMapper, mutationItem.target.classList.contains(typeItem)); }
				);
			}
		}

		//init value
		obj[member] = v0;

		return true;
	}

	//-------------------------------------
	//bind property
	if (type === "prop" || type === "property") {
		if (!(typeItem in el)) return formatError("bind property unfound", typeItem, bindItem);

		//function binding
		if (memberIsFunction) {
			var bindFunc = function (evt) { return memberValue.apply(memberThis || this, [evt, memberOption]); };
			el.addEventListener(notifyEvent || "change", bindFunc, memberOption && memberOption.listenerOptions);
			if (watchJs) {
				enclosePropertyDescriptor(el, typeItem,
					function (v) { dispatchEventByName(elId, notifyEvent || "change", 0); }
				);
			}
			return true;
		}

		//variable member
		var v0 = findWithFilter(null, memberValue, mapValue(jsValueMapper, el[typeItem] || ""));

		enclosePropertyDescriptor(obj, member,
			function (v) {
				v = mapValue(domValueMapper, v);
				if (ele(elId)[typeItem] != v) ele(elId)[typeItem] = v;
			},
			function () { return mapValue(jsValueMapper, ele(elId)[typeItem]); }
		);

		if (biDirection) {
			el.addEventListener(notifyEvent || "change", function (evt) { obj[member] = mapValue(jsValueMapper, ele(elId)[typeItem]); }, memberOption && memberOption.listenerOptions);
		}
		if (watchJs) {
			enclosePropertyDescriptor(el, typeItem,
				function (v) { dispatchEventByName(elId, notifyEvent || "change", 0); }
			);
		}

		//init value
		obj[member] = v0;

		return true;
	}

	return formatError("unknown bind type", type, bindItem);
}

/*
	bind item array:
		an array of bindItem/namePath, that is,
			[ bindItem|namePath, bindItem|namePath, ...  ]
		
		* namePath: refer query-by-name-path @ npm

		* the default namePath is "", for the entry element. 
*/

//return an object mapping namePath to dom id if success.
//return Error if fail.
var bindElementArray = function (el, obj, bindItemArray) {
	el = ele(el);

	var elLast = el, lastName = "";
	var i, imax = bindItemArray.length, bi, ret, namePath, lastBi;

	var nm = {			//name mapping;
		"": ele.id(elLast)	//map "" to entry element
	};

	for (i = 0; i < imax; i++) {
		bi = bindItemArray[i];
		if (typeof bi === "string") {
			namePath = bi;

			elLast = query_by_name_path(el, namePath);
			if (!elLast) return formatError("bind name path unfound", namePath, bi);
			nm[namePath] = ele.id(elLast);
			lastName = namePath;
			continue;
		}
		else if (!(bi instanceof Array)) return formatError("bindItem is not an array", namePath, bi);
		else if (i) {
			//copy other omitted item from previous value
			if (!bi[BI_TYPE] && ((lastBi = bindItemArray[i - 1]) instanceof Array)) {
				bi[BI_TYPE] = lastBi[BI_TYPE];	//fill back omitted "type"
				if (!bi[BI_TYPE_OPTION])
					bi[BI_TYPE_OPTION] = lastBi[BI_TYPE_OPTION];	//fill back omitted typeOption | "typeItem"
			}
		}

		ret = bindElement(elLast, obj, bi);
		if (ret instanceof Error) return ret;
	}
	return nm;
}

// module

module.exports = exports = bindElement;

exports.bindElement = bindElement;
exports.bindElementArray = bindElementArray;
exports.array = bindElementArray;

},{"dom-document-tool":10,"element-tool":13,"format-error-tool":14,"query-by-name-path":35,"script-tool":36}],6:[function(require,module,exports){

// bind-ui @ npm, htm-tool bind-ui module.

"use strict";

var cq = require("callq");
var http_request = require("browser-http-request");
var ele = require("element-tool");
var query_by_name_path = require("query-by-name-path");
var add_css_text = require("add-css-text");
var bind_element = require("bind-element");

//install mapping tool
var installMappingTool = function (mode, obj, nm) {
	if (mode === "disable" || (typeof mode !== "undefined" && !mode)) return;	//disable

	var topId = nm[""];
	if (mode && mode.slice(0, 4) === "dyna") {
		obj.nme = function (namePath) {
			return query_by_name_path(topId, namePath);
		}
	}
	else {
		obj.nme = function (namePath) {
			if (namePath in nm) return document.getElementById(nm[namePath]);
			var el = query_by_name_path(topId, namePath);
			if (el) nm[namePath] = ele.id(el);	//cache
			return el;
		}
	}
}

/*
	async binding dom-ui to js-object
	
	config:
		
		.cssUrl					// abs url, cssUrl => cssUrlText
		.cssText
		//.cssId				// internal, indicated dom style element id
		
		.htmlUrl				// abs url, htmlUrl => htmlUrlText
		.htmlText
		
		.bindArray				//refer to bindByName() & bindElement()
		
		.nameTool				//name mapping tools
			
			"static"	default
			
				add following members to `obj`,
			
					obj.nme( namePath )
						return the element from namePath, by static id mapping.
			
			"dyna"/"dynamic"
			
				add following members to `obj`,
				
					obj.nme( namePath )
						return the element from namePath, refer module `query-by-name-path`.
			
			"disable"/false
			
				don't add name mapping tools

		.init					//init function, or function name for obj[config.init](el)

*/

//bind_ui = function (el, obj [, [config,] cb] )
module.exports = function (el, obj, config, cb) {
	//arguments
	if (typeof config === "function" && arguments.length == 3) { cb = config; config = null; }

	if (!config) { config = obj.config || obj; }

	el = ele(el);

	//bind
	cq(null, [
		//get cssUrl to load
		function (err, data, que) {
			if (err) return que.final(err);

			if (config.cssId && ele(config.cssId)) return false;		//already loaded to dom
			if (config.cssText || config.cssUrlText) return "";

			return config.cssUrl || "";
		},
		":loadCssUrl", function (err, data, que) {
			http_request(config.cssUrl, 'GET', '', null,
				function (err, data) {
					config.cssUrlText = err ?
						("" + err.error) : //if error load message to dom
						(data.responseText || "");

					que.next(null, true);
				}
			);
		},
		cq.if(true, null, cq.joinAt(config.joinCss = config.joinCss || {}, "loadCssUrl")),
		//load cssText/cssUrlText to dom
		function (err, data, que) {
			if (err) return que.final(err);

			if ((config.cssUrlText || config.cssText) && !(config.cssId && ele(config.cssId))) {
				add_css_text(
					config.cssUrlText || config.cssText,
					config.cssId || (config.cssId = ele.id(null, "bind-css-"))
				);
				//console.log("addCssText " + config.cssId );
			}
			return true;
		},
		//get htmlUrl to load
		function (err, data, que) {
			if (err) return que.final(err);

			if (config.htmlText || config.htmlUrlText) return "";

			return config.htmlUrl || "";
		},
		":loadHtmlUrl", function (err, data, que) {
			http_request(config.htmlUrl, 'GET', '', null,
				function (err, data) {
					config.htmlUrlText = err ?
						("" + err.error) : //if error load message to dom
						(data.responseText || "");

					que.next(null, true);
				}
			);
		},
		cq.if(true, null, cq.joinAt(config.joinHtml = config.joinHtml || {}, "loadHtmlUrl")),
		//set htmlText - bind_element - install name-mapping tools - call init entry
		function (err, data, que) {
			if (err) return que.final(err);

			//set htmlUrlText/htmlText
			if (config.htmlUrlText || config.htmlText) {
				el.innerHTML = (config.htmlUrlText || config.htmlText).
					replace(/\{\{\s*([^\s\}\:]+)\s*(\:([^\}]*))?\}\}/g, "<span name='$1'>$3</span>");
			}

			//bindByName
			if (config.bindArray) {
				var nm = bind_element.array(el, obj, config.bindArray);
				if (nm instanceof Error) return nm;

				//install name-mapping tools
				if (nm) installMappingTool(config.nameTool, obj, nm);
			}

			//init entry
			var typeofInit = typeof (config.init);

			if (typeofInit === "function") {
				config.init.call(obj, el);
			}
			else if (typeofInit === "string") {
				if (obj && typeof (obj[config.init]) === "function") obj[config.init](el);
			}

			return true;
		},
		function (err, data, que) {
			if (cb) cb(err, data);
			else if (err) console.log(err);

			que.next(err, data);
		},
	]);

}

},{"add-css-text":3,"bind-element":5,"browser-http-request":7,"callq":8,"element-tool":13,"query-by-name-path":35}],7:[function(require,module,exports){

// browser-http-request @ npm
// enclose browser XMLHttpRequest for callback function

//parse headers string tool
var parseHeaders = function (headerText) {
	if (typeof headerText !== "string") return headerText;

	var headers = {}, i;
	headerText.trim().split(/[\r\n]\s*/).map(
		function (v) {
			i = v.indexOf(":");
			if (i > 0) headers[v.slice(0, i).trim()] = v.slice(i + 1).trim();
		}
	);
	return headers;
}

// methodOrOptions: string "POST"/"GET"/..., or user-defined options { method, headers:{}, timeout }
// callback: function( Error:{ data.* }, data:{ responseText, statusCode, statusMessage, headers, userData } )
// return the XMLHttpRequest object
var requestText = function (url, methodOrOptions, postData, headers, callback, userData) {
	//options
	var options = (typeof methodOrOptions === "string") ? { method: methodOrOptions } : (methodOrOptions || {});

	if (!options.headers) {
		if (headers) options.headers = headers;
		else if (options.method === "POST") options.headers =
			{ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
	}

	//cleanup
	var tmid;
	var cleanup = function () {
		if (tmid) { clearTimeout(tmid); tmid = null; };
		callback = null; 	//callback only once
	}

	//xq
	var xq = new XMLHttpRequest();

	xq.open(options.method, url, true);
	if (options.headers) {
		for (var i in options.headers) { xq.setRequestHeader(i, options.headers[i]); }
	}

	var lastReadyState = 0;
	xq.onreadystatechange = function () {
		if (xq.readyState === 4 || (xq.readyState === 0 && lastReadyState)) {	//DONE, or UNSENT by abort
			if (callback) {
				var headerText = xq.getAllResponseHeaders();

				var resData = {
					responseText: xq.responseText,
					statusCode: xq.status,
					statusMessage: xq.statusText,
					headerText: headerText,
					headers: parseHeaders(headerText),
				};
				if (userData) resData.userData = userData;

				if (xq.status == 200) {
					callback(null, resData);
				}
				else {
					var err = Error(xq.status + " " + xq.statusText +
						(xq.responseText ? ("," + xq.responseText.slice(0, 255)) : ""));
					for (var i in resData) err[i] = resData[i];
					callback(err);
				}
			}
			cleanup();
		}
		lastReadyState = xq.readyState;
	}

	if (options.timeout > 0) {		//waiting timeout
		tmid = setTimeout(function () {
			if (callback) {
				var err = Error("timeout, " + options.timeout);
				if (userData) err.userData = userData;
				callback(err);
			}
			tmid = null;
			cleanup();
			xq.abort();
		}, options.timeout)
	}

	xq.send(postData);

	return xq;
}

// callback: function( Error:{ data.* }, data:{ responseJson, data.* from requestText() } )
var requestJson = function (url, methodOrOptions, postData, headers, callback, userData) {
	return requestText(url, methodOrOptions, postData, headers, function (error, data) {
		if (!error) {
			try { data.responseJson = JSON.parse(data.responseText); }
			catch (ex) {
				console.log(ex);
				error = Error("JSON parse error, " + ex.message);
				for (var i in data) error[i] = data[i];
			}
		}
		callback && callback(error, data);
	}, userData);
}

// callback: function( error, data:responseText )
var _text = function (url, methodOrOptions, postData, headers, callback, userData) {
	return requestText(url, methodOrOptions, postData, headers, function (error, data) {
		callback && callback(error, error ? data : data.responseText);
	}, userData);
}

// callback: function( error, data:responseJson )
var _json = function (url, methodOrOptions, postData, headers, callback, userData) {
	return requestJson(url, methodOrOptions, postData, headers, function (error, data) {
		callback && callback(error, error ? data : data.responseJson);
	}, userData);
}

//module

module.exports = exports = requestText;

exports.requestText = requestText;
exports.requestJson = requestJson;
exports.text = _text;
exports.json = _json;

exports.parseHeaders = parseHeaders;

},{}],8:[function(require,module,exports){

// callq @ npm, call queue.

/*
convention:

	* an 'error-data-que' callback function, named `operator`, is defined as:
		function( error, data, que ){ ... }

			* `que`: a call-queue object.

			* sync process:
				* return an `Error` object, for `error`;
				* or throw an exception, for `error`;
				* or return anything neither `undefined` nor `Error`, for `data`;
				* or directly call `que.next()` and return nothing/`undefined`;

			* async callback:
				* return nothing/`undefined`.
					* directly call `que.next()` in callback;
					* or get an 'error-first' function from `que.wait()`, as a parameter for outside callback;
	
	* an `operator-set`, is a user-defined object with some operator functions.

	* operator-array:
		* an array of
			{ label:"labelN", timeout:timeoutN, op:operatorN }

			* label: default-label string for the operator;
				* a label prefixed ":" char is a sub procedure label.
					* the procedure will be skipped by normal process;
					* it can be called by .pick() later;
			* timeout: default-timeout number for the operator, in milliseconds;
			* op:
				* an operator function.
				* or an existing label string of an operator in the operator-set;
		
		* or an array like:
			[ ["label1",] [timeout1,] operator1, ["label2",] [timeout2,] operator2, ... ]

			* a new `labelN` here shouldn't be an existing label in the operator-set, otherwise it will be parsed as the existing operator;
		
			* the `label` here can be a label-range, defined as string "label1:label2",
					that is a new array extracted from an existig operator-array, that from `label1` to `label2`(included).
				* a label-range will clear preceding `label` and `timeout`

		* or a mixed array of the 2 above formats;

	* levels
		1. root: static call-queue object with a user-defined `operator-set`
		2. process: run user-defined `operator-array` by tools of call-queue class
		3. thread: run user-defined operator.
	
	* call stack
		queue
			.next()	/ .wait() / .waitVoid()	/ thread
				.jump()	/ thread
					.pick() / .run() / process
						.if()
						.loop()
						.fork()
						.final()
						.joinAt()

	* all *-timeout arguments are optional.

*/

//////////////////////////////////////////////////
// tools

var isOmitTimeout = function (v) { return typeof v !== "undefined" && typeof v !== "number"; };


//////////////////////////////////////////////////
// call queue class

function CallQueueClass(operatorSet) {
	this.root = this;

	this.operatorSet = operatorSet;
}

var STATE_ROOT_INIT = 0;			//initial root state

var STATE_PROCESS_RUNNING = 1;		//virtual process running
var STATE_PROCESS_FINISHED = 2;		//virtual process finished
var STATE_PROCESS_TIMEOUT = 3;		//virtual process timeout

var STATE_THREAD_PENDING = 11;	//virtual thread pending
var STATE_THREAD_FINISHED = 12;	//virtual thread finished
var STATE_THREAD_TIMEOUT = 13;	//virtual thread timeout

var processIdSeed = 0;

CallQueueClass.prototype = {

	debug: 1,		//debug output flag, 0: silent, 1: show warns, 2: verbose

	operatorSet: null,		//the `this` when operator function is called

	queue: null,		//queue data object
	labelSet: null,		//map label name to index

	index: 0,		//point to the next-call

	root: null,		//root CallQueueClass `this`
	process: null,		//process `this`

	processId: null,	//unique process id

	state: STATE_ROOT_INIT,		//state of process or thread

	//timer id: when timeout, it will be set to `false`; when stop normally, it will be set to `null`.
	processTmid: null,	//process timer id
	threadTmid: null,	//thread timer id

	/**
	 * get the index of a label
	 * @param {string} label - a label string.
	 * @param {bool} extendMode - flag to search and return the labeled function in `operatorSet`.
	 */
	labelIndex: function (label, extendMode) {
		if (label in this.labelSet) return this.labelSet[label];
		else if (extendMode && typeof this.operatorSet[label] === "function") return this.operatorSet[label];
		else throw Error("unknown label, " + label);
	},

	buildQueue: function (operatorArray, refProcess) {
		if (!(operatorArray instanceof Array)) operatorArray = [operatorArray];

		this.queue = [];
		this.labelSet = {}

		var i, imax = operatorArray.length, oai, oai_ts, op, timeout, defaultLabel, newLabel, qi, rqi;
		for (i = 0; i < imax; i++) {
			oai = operatorArray[i];
			oai_ts = typeof (oai);

			if (oai_ts === "number") { timeout = timeout || oai; continue; }	//timeout

			if (oai_ts === "function") {	//op
				op = oai;
				if (op.name && op.name != "anonymous") defaultLabel = defaultLabel || op.name;
			}
			else if (oai_ts === "string") {		//label or op
				if (oai.charAt(0) === ":") { newLabel = newLabel || oai; continue; }	//a sub procedure label

				if (refProcess && refProcess.queue && refProcess.operatorSet === this.operatorSet) {
					if (oai.indexOf(':') > 0) {
						//label-range, copy from source; preceding label and timeout is cleared.
						var sa = oai.split(":").map(function (si) { return refProcess.labelIndex(si); });
						for (var j = sa[0]; j <= sa[1]; j++) {
							rqi = refProcess.queue[j];	//in label-range, procedure is still procedure
							if (rqi.label) this.labelSet[rqi.label.replace(/^\:/, "")] = this.queue.length;
							this.queue.push(rqi);
						}
						op = timeout = defaultLabel = newLabel = null;
						continue;
					}
					else if (oai in refProcess.labelSet) {
						rqi = refProcess.queue[refProcess.labelIndex(oai)];

						rqi = {		//override rqi
							timeout: timeout || rqi.timeout,
							label: newLabel || defaultLabel ||
								(rqi.label && rqi.label.replace(/^\:/, "")),	//procedure is copied out
							op: rqi.op,
						};

						if (rqi.label) this.labelSet[rqi.label.replace(/^\:/, "")] = this.queue.length;
						this.queue.push(rqi);
						op = timeout = defaultLabel = newLabel = null;
						continue;
					}
				}

				if (this.operatorSet && oai in this.operatorSet) {
					op = this.operatorSet[oai];
					if (typeof op !== "function") throw "cq format fail, not function label, " + oai;
					defaultLabel = oai;
				}
				else {
					if (newLabel) {
						if (newLabel !== oai && this.debug > 0)		//warn if label and function name maybe mixed
							console.warn("WARN: cq parsing, duplicated label, " + newLabel + ", " + oai);
					}
					else newLabel = oai;
				}
			}
			else if (oai_ts === "object") {
				if (oai.label) { newLabel = newLabel || oai.label; }		//new label cover the old
				if (oai.timeout) { timeout = timeout || oai.timeout; }		//new timeout cover the old
				if (oai.op) {
					if (typeof oai.op === "function") {
						op = oai.op;
						if (op.name && op.name != "anonymous") defaultLabel = defaultLabel || op.name;
					}
					else {
						if (!this.operatorSet) throw "cq format fail, empty operatorSet for label, " + oai.op;
						op = this.operatorSet[oai.op];
						if (typeof op !== "function") throw "cq format fail, not function label, " + oai.op;
						defaultLabel = "" + oai.op;
					}
				}
			}

			if (!op) continue;		//wait op

			newLabel = newLabel || defaultLabel;
			if (newLabel) {
				this.labelSet[newLabel.replace(/^\:/, "")] = this.queue.length;		//old label index may be replaced
				qi = { label: newLabel, timeout: timeout, op: op };
			}
			else { qi = { timeout: timeout, op: op }; }

			this.queue.push(qi);

			op = timeout = defaultLabel = newLabel = null;
		}

		//build emulated root operatorSet when root operatorSet is empty in array mode
		if (!this.root.operatorSet) {
			var os = {};
			for (var i in this.labelSet) {
				os[i] = this.queue[this.labelSet[i]].op;
			}
			this.root.operatorSet = os;
		}
	},

	//run a new process
	"run": function (error, data, operatorArray, runTimeout, runTimeoutLabel, runDescription) {
		if (isOmitTimeout(runTimeout)) {		//optional runTimeout
			runDescription = runTimeoutLabel; runTimeoutLabel = runTimeout; runTimeout = 0;
		}

		var process = Object.create(this.root);

		process.process = process;
		process.processId = (++processIdSeed) + (runDescription ? ("-" + runDescription) : "");

		process.processTmid = null;
		process.threadTmid = null;
		process.index = 0;

		process.buildQueue(operatorArray, this);

		process.state = STATE_PROCESS_RUNNING;
		if (runTimeout > 0) {
			process.processTmid = setTimeout(
				function () {
					if (process.state === STATE_PROCESS_RUNNING) {
						process.state = STATE_PROCESS_TIMEOUT;

						if (runTimeoutLabel) {
							process.jump("cq process timeout, " + runTimeout + ", " + process.processId, null, runTimeoutLabel);
							//don't set process.processTmid = false, as a flag to run timeout label 1 time.
						}
						else { process.processTmid = false; }
					}
				},
				runTimeout
			);
		}

		return process.next(error, data);
	},

	//like `.run()` but continue current process; 
	//when `pickArray` is null or empty, `.pick()` is same as `.jump(finalLabel)`;
	pick: function (error, data, pickArray, pickTimeout, finalLabel, finalTimeout, pickDescription) {
		if (isOmitTimeout(pickTimeout)) {		//optional pickTimeout
			pickDescription = finalTimeout; finalTimeout = finalLabel; finalLabel = pickTimeout; pickTimeout = 0;
		}
		if (isOmitTimeout(finalTimeout)) {		//optional finalTimeout
			pickDescription = finalTimeout; finalTimeout = 0;
		}

		var isArray;
		if (!pickArray || ((isArray = (pickArray instanceof Array)) && !(pickArray.length > 0))) {
			return this.jump(error, data, finalLabel, finalTimeout);
		}

		var _this = this;
		var cb = function (error, data, que) {
			if (que.process.state == STATE_PROCESS_RUNNING) que.next();
			_this.jump(error, data, finalLabel, finalTimeout);
		};

		if (!isArray) pickArray = [pickArray];
		return this.run(error, data, pickArray.concat(cb), pickTimeout, cb, pickDescription);
	},

	/*
	condition:
		function
			a function(error, data) return boolean value;
		`null`
			to check ! `error`;
		boolean value
			to check ! `error` && boolean(`data`);
		other
			to check ! `error` && `data`==other;
	*/
	"if": function (error, data, condition, falseArray, trueArray, ifTimeout, finalLabel, finalTimeout, ifDescription) {
		if (isOmitTimeout(ifTimeout)) {		//optional ifTimeout
			ifDescription = finalTimeout; finalTimeout = finalLabel; finalLabel = ifTimeout; ifTimeout = 0;
		}
		if (isOmitTimeout(finalTimeout)) {		//optional finalTimeout
			ifDescription = finalTimeout; finalTimeout = 0;
		}

		if (typeof condition === "function") condition = condition(error, data);
		else if (condition === null) condition = !error;
		else if (condition === true) condition = !error && data;
		else if (condition === false) condition = !error && !data;
		else condition = !error && data == condition;

		return this.pick(error, data, condition ? trueArray : falseArray, ifTimeout, finalLabel, finalTimeout, ifDescription);
	},

	//initCondition: a function(condition:{error, data}), or directly a condition object whose shallow properties is protected;
	//checkCondition: a function(condition) return boolean value; or null to check error/data
	"loop": function (error, data, initCondition, checkCondition, loopArray, finalLabel, finalTimeout, loopDescription) {
		if (isOmitTimeout(finalTimeout)) {		//optional finalTimeout
			loopDescription = finalTimeout; finalTimeout = 0;
		}

		var condition;
		if (typeof initCondition === "function") initCondition(condition = { error: error, data: data });
		else condition = Object.create(initCondition) || {};	//re-use initCondition object, and protect its shallow properties.

		var cnt = 0;
		var cbLoop = function (error, data, que) {
			condition.data = data;
			condition.error = error;

			if ((checkCondition && checkCondition(condition)) || (!checkCondition && !error)) {
				return que.pick(error, data, loopArray, cbLoop, loopDescription ? (loopDescription + "-" + (cnt++)) : null);
			}
			else return que.jump(error, data, finalLabel, finalTimeout);
		}
		return cbLoop(error, data, this);
	},

	//when `jumpLabel` is null, `.jump()` is same as `.next()`
	"jump": function (error, data, jumpLabel, jumpTimeout) {
		if (jumpLabel) {
			if (typeof jumpLabel !== "function") jumpLabel = this.labelIndex(jumpLabel, true);

			if (typeof jumpLabel === "function") return jumpLabel.call(this.operatorSet, error, data, this);

			this.process.index = jumpLabel;
		}
		return this.next(error, data, jumpTimeout);
	},

	//jump to the last, or user-defined final step
	"final": function (error, data, finalArray, finalTimeout) {
		if (!finalArray) {
			this.process.index = this.queue.length - 1;	//jump to the last
			return this.next(error, data, finalTimeout);
		}

		//appoint final step

		this.process.index = this.queue.length;		//stop current process

		this.pick(error, data, finalArray, finalTimeout);
	},

	//next step
	next: function (error, data, nextTimeout) {
		//stop thread timer
		if (this.threadTmid) { clearTimeout(this.threadTmid); this.threadTmid = null; }

		//virtual thread checking
		if (this.state === STATE_THREAD_TIMEOUT) { if (this.debug > 0) console.warn("WARN: cq blocked by thread-timeout"); return; }
		if (this.state === STATE_THREAD_FINISHED) { if (this.debug > 0) console.warn("WARN: cq blocked by thread-finished"); return; }
		if (this.state === STATE_THREAD_PENDING) {
			this.state = STATE_THREAD_FINISHED;		//set finish flag when the 1st call ending
			return this.process.next(error, data, nextTimeout);		//call `process.next()`
		}

		if (this.state === STATE_PROCESS_TIMEOUT) {
			if (!this.processTmid) { if (this.debug > 0) console.warn("WARN: cq blocked by process-timeout"); return; }
			this.processTmid = false;		//set process timeout flag, and continue process step 1 time
		}
		else if (this.state === STATE_PROCESS_FINISHED) { if (this.debug > 0) console.warn("WARN: cq blocked by process-finished"); return; }
		else if (this.state === STATE_PROCESS_RUNNING) { }	//continue
		else { throw Error("cq state unexpected, " + this.state); }

		//check process pointer
		if (this.process !== this) { throw Error("cq process pointer fail"); }

		//normalize error
		if (error && !(error instanceof Error)) error = Error(JSON.stringify(error).slice(0, 300));;

		//get next queue item
		var qi;
		while ((qi = this.queue[this.index]) &&
			qi.label && qi.label.charAt(0) === ":") {		//skip sub procedure
			this.index++;
		}

		if (!qi) {
			//process finish
			if (this.state != STATE_PROCESS_TIMEOUT) this.state = STATE_PROCESS_FINISHED;	//keep process timeout state

			if (this.processTmid) { clearTimeout(this.processTmid); this.processTmid = null; }

			if (this.debug > 1) console.log("process finish, id='" + this.processId + "'");

			return error || data || null;	//call queue end
		}

		this.index++;

		//run next
		var thread = Object.create(this);
		thread.state = STATE_THREAD_PENDING;
		thread.processTmid = null;		//protect prototype's timer_id
		thread.threadTmid = null;		//protect prototype's timer_id

		var ret;
		try {
			ret = qi.op.call(this.operatorSet, error, data, thread);
		}
		catch (e) {
			if (this.debug > 0) console.warn("WARN: cq exception:", e);
			ret = (e instanceof Error) ? e : Error(e);
		}

		if (typeof ret !== "undefined") {
			//sync return

			//check sync thread ending, 
			if (thread.state === STATE_THREAD_FINISHED) { if (this.debug > 0) console.warn("WARN: cq sync thread blocked"); return; }
			if (thread.state === STATE_THREAD_TIMEOUT) { if (this.debug > 0) console.warn("WARN: cq sync thread timeout blocked"); return; }
			thread.state = STATE_THREAD_FINISHED;

			return (ret instanceof Error) ? this.next(ret) : this.next(null, ret);		//process.next()
		}
		else if (thread.state === STATE_THREAD_PENDING) {	//thread may have been finished
			//async return, timer
			var tmr = (nextTimeout > 0) ? nextTimeout : qi.timeout;
			if (tmr) {
				var _this = this;
				thread.threadTmid = setTimeout(
					function () {
						thread.threadTmid = false;
						thread.state = STATE_THREAD_TIMEOUT;
						_this.next("cq thread timeout, " + tmr);
					},
					tmr
				);
			}
		}
	},

	//enclose `.next()` to error-first callback( error, data )
	"wait": function (/*error, data,*/ waitTimeout, nextTimeout) {
		var tmid = null;
		var _this = this;

		if (waitTimeout > 0) {
			tmid = setTimeout(function () { tmid = false; _this.next("cq wait-timeout, " + waitTimeout); }, waitTimeout);
		}

		return function (error, data) {
			if (tmid === false) { if (_this.debug > 0) console.warn("WARN: cq blocked by wait-timeout, " + waitTimeout); return; }
			if (tmid) { clearTimeout(tmid); tmid = null; }

			return _this.next(error, data, nextTimeout);
		}
	},

	//enclose `.next()` to a void callback( ), with previous error and data.
	waitVoid: function (error, data, waitTimeout, nextTimeout) {
		var tmid = null;
		var _this = this;

		if (waitTimeout > 0) {
			tmid = setTimeout(function () { tmid = false; _this.next("cq waitVoid-timeout, " + waitTimeout); }, waitTimeout);
		}

		return function () {
			if (tmid === false) { if (_this.debug > 0) console.warn("WARN: cq blocked by waitVoid-timeout, " + waitTimeout); return; }
			if (tmid) { clearTimeout(tmid); tmid = null; }

			return _this.next(error, data, nextTimeout);
		}
	},

	markCallback: function (mark, callback, thisObject) {
		return function () {
			return callback.apply(thisObject, [mark].concat(Array.prototype.slice.apply(arguments)));
		}
	},

	/*
	forkSettings: {
		mode: "all"|"allOrError"|"any"|"anyData"|user-defined,
		timeout: 0,
		description:""
		pickSet:{
			labelN: pickArrayN | forkSettingsN,
			...
		},
	}

	async callback: ( error, [ result, resultCount, lastResultLabel ] )
	*/
	"fork": function (error, data, forkSettings, finalLabel, finalTimeout) {
		var result = {};	//map labelN to [ errorN, dataN ]
		var resultCount = 0, blocked = false;
		var resultCountMax = Object.keys(forkSettings.pickSet).length;

		var tmid = null;
		var _this = this;
		if (forkSettings.timeout > 0) {
			tmid = setTimeout(function () { tmid = false; blocked = true; _this.jump("cq fork-timeout, " + forkSettings.timeout, [result, resultCount, null], finalLabel, finalTimeout); }, forkSettings.timeout);
		}

		var mode = forkSettings.mode || "all";

		//prepare final callback
		var markCheck = function (mark, error, data, que) {
			if (tmid === false) { if (_this.debug > 0) console.warn("WARN: cq fork timeout blocked"); return; }

			if (blocked) { if (_this.debug > 0) console.warn("WARN: fork blocked - " + mode); return; }

			if (!result[mark]) { resultCount++; result[mark] = [error, data]; }

			if (mode === "all") { if (resultCount < resultCountMax) return; blocked = true; }
			else if (mode === "allOrError") { if (resultCount < resultCountMax && !error) return; blocked = true; }
			else if (mode === "any") { blocked = true; }
			else if (mode === "anyData") { if (!data && resultCount < resultCountMax) return; blocked = true; }

			if (blocked && tmid) { clearTimeout(tmid); tmid = null; }	//try stop fork timer

			var ret = que.jump(null, [result, resultCount, mark], finalLabel, finalTimeout);

			if (!blocked && ret) {
				blocked = true;	//block user-defined, if jump() return true.
				if (tmid) { clearTimeout(tmid); tmid = null; }	//try stop fork timer, after blocking user-defined.
			}

			return ret;
		}

		//run all
		var i, psi;
		for (var i in forkSettings.pickSet) {
			psi = forkSettings.pickSet[i];
			//console.log(psi);
			if ((psi instanceof Array) || !psi.pickSet) {
				this.pick(error, data, psi, this.markCallback(i, markCheck), (forkSettings.description || "") + ":" + i);
			}
			else {
				//cascading fork
				if (!psi.description) psi.description = i;
				this.fork(error, data, psi, this.markCallback(i, markCheck));
			}
		}
	},

	/*
	joinPoint: 
		A user-stored Object, into which internal control data will be filled, such as { running, queDataList }.
		If it's null or not an Object, .joinAt() is same as .pick().
	*/
	joinAt: function (error, data, joinPoint, firstJoinArray, firstJoinTimeout, finalLabel, finalTimeout, joinDescription) {
		if (isOmitTimeout(firstJoinTimeout)) {		//optional firstJoinTimeout
			joinDescription = finalTimeout; finalTimeout = finalLabel; finalLabel = firstJoinTimeout; firstJoinTimeout = 0;
		}
		if (isOmitTimeout(finalTimeout)) {		//optional finalTimeout
			joinDescription = finalTimeout; finalTimeout = 0;
		}

		if (!joinPoint || typeof joinPoint !== "object")
			return this.pick(error, data, firstJoinArray, firstJoinTimeout, finalLabel, finalTimeout, joinDescription);

		//enter join point
		if (!joinPoint.queDataList) joinPoint.queDataList = [];
		joinPoint.queDataList.push([this, finalLabel, finalTimeout]);

		if (joinPoint.running) return;		//alreading running, return to wait

		joinPoint.running = true;

		//join

		var cb = function (error, data, que) {
			var ret, ret0, ret0Done, queData;

			while (joinPoint.queDataList.length > 0) {
				try {
					queData = joinPoint.queDataList.shift();
					ret = queData[0].jump(error, data, queData[1], queData[2]);
				}
				catch (ex) {
					console.warn("cq join exception", ex);
					ret = ex;
				}

				if (queData[0] === que) { ret0 = ret; ret0Done = true; }		//get 1st ret
			}

			delete joinPoint.running;	//join finish
			if (ret0Done) return ret0;

			return que.jump(error, data, finalLabel, finalTimeout);		//if the 1st is not call, manually call it.
		}

		return this.pick(error, data, firstJoinArray, firstJoinTimeout, cb, joinDescription);
	},

}

//////////////////////////////////////////////////
//flow control

/*
var jump = function (jumpLabel, jumpTimeout) {
	return function (error, data, que) {
		return que.jump(error, data, jumpLabel, jumpTimeout);
	}
}

var pick = function (pickArray, pickTimeout, finalLabel, finalTimeout, pickDescription) {
	return function (error, data, que) {
		return que.pick(error, data, pickArray, pickTimeout, finalLabel, finalTimeout, pickDescription);
	}
}

var _if = function (condition, falseArray, trueArray, ifTimeout, finalLabel, finalTimeout, ifDescription) {
	return function (error, data, que) {
		return que["if"](error, data, condition, falseArray, trueArray, ifTimeout, finalLabel, finalTimeout, ifDescription);
	}
}

var _loop = function (initCondition, checkCondition, loopArray, finalLabel, finalTimeout, loopDescription) {
	return function (error, data, que) {
		return que.loop(error, data, initCondition, checkCondition, loopArray, finalLabel, finalTimeout, loopDescription);
	}
}

var _final = function (finalArray, finalTimeout) {
	return function (error, data, que) {
		return que.final(error, data, finalArray, finalTimeout);
	}
}

var joinAt = function (joinPoint, firstJoinArray, firstJoinTimeout, finalLabel, finalTimeout, joinDescription) {
	return function (error, data, que) {
		return que.joinAt(error, data, joinPoint, firstJoinArray, firstJoinTimeout, finalLabel, finalTimeout, joinDescription);
	}
}

*/

function createFlow(name) {
	return function (/*any*/) {
		var arguments0 = arguments;
		return function (error, data, que) {
			return que[name].apply(que, [error, data].concat(Array.prototype.slice.call(arguments0)));
		}
	}
}

var _fork = function (forkMode, pickSet, finalLabel, finalTimeout) {
	return function (error, data, que) {
		return que.fork(error, data, { mode: forkMode, pickSet: pickSet }, finalLabel, finalTimeout);
	}
}

//////////////////////////////////////////////////
//module

module.exports = exports = function (operatorSet, operatorArray, timeout, description) {
	if (!operatorArray) throw "cq empty operatorArray";

	if (isOmitTimeout(timeout)) {		//optional timeout
		description = timeout; timeout = 0;
	}

	var que = new CallQueueClass(operatorSet);
	return que.run(null, null, operatorArray, timeout, null, description);
}

exports.class = CallQueueClass;
exports.isQue = function (obj) { return (obj instanceof CallQueueClass); }

exports.jump = createFlow("jump");
exports.pick = createFlow("pick");
exports.if = createFlow("if");
exports.loop = createFlow("loop");
exports.final = createFlow("final");
exports.joinAt = createFlow("joinAt");

exports.fork = _fork;

},{}],9:[function(require,module,exports){

// create-assign @ npm, a combination of Object.create() and Object.assign().

// simply polyfill Object.assign(), from https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) {
	Object.assign = function (target, varArgs) {
		if (target === null || target === undefined) {
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);
		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];
			if (nextSource !== null && nextSource !== undefined) {
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	}
}

//derive object
module.exports = function (proto, properties /*, properties2, ...*/) {
	return Object.assign.apply(Object, [Object.create(proto)].concat(Array.prototype.slice.call(arguments, 1)));
}

},{}],10:[function(require,module,exports){

// dom-document-tool @ npm, dom document tool.

var ele= require("element-tool");

//insert adjacent 'beforeend', return the first inserted element
var appendHtml = function (parentNode, htmlText) {
	parentNode = ele(parentNode);
	var lastChild = parentNode.lastChild;

	parentNode.insertAdjacentHTML('beforeend', htmlText);
	return lastChild ? lastChild.nextSibling : parentNode.firstChild;
}

//insert adjacent 'beforeend' to document.body
var appendBodyHtml = function (htmlText) { return appendHtml(document.body, htmlText); }

//insert adjacent 'afterbegin', return the first inserted element
var prependHtml = function (parentNode, htmlText) {
	parentNode = ele(parentNode);
	parentNode.insertAdjacentHTML('afterbegin', htmlText);
	return parentNode.firstChild;
}

//call .querySelector() by attribute name and value
var querySelectorByAttr = function (el, head, attrName, attrValue, tail) {
	return ele(el).querySelector((head || "") + "[" + attrName + ((typeof attrValue !== "undefined" && attrValue !== null) ? ("='" + ("" + attrValue).replace(/(\<\>\'\"\:)/g, "\\$1") + "'") : "") + "]" + (tail || ""));
}

//get part value by name, default from window.location.search.
var getSearchPart = function (name, searchString) {
	if (!searchString) searchString = window.location.search;

	if (typeof URLSearchParams === "function") return (new URLSearchParams(searchString)).get(name);

	var mr = searchString.match(new RegExp("(^|\\?|\\&)" + name + "\\=([^\\&]*)($|\\&)"));
	return mr && mr[2];
}

//call MutationObserver.observe() for single object, default for single attribute.
//callback: function( mutationItem )
var observeSingleMutation = function (target, optionOrAttribute, callback) {
	if (typeof optionOrAttribute === "string") optionOrAttribute = { attributes: true, attributeFilter: [optionOrAttribute], attributeOldValue: true };

	var mo = new MutationObserver(function (mutationList) { return callback(mutationList[mutationList.length - 1]); });
	mo.observe(target, optionOrAttribute);
	return mo;
}

//compatible tool for dispatchEvent()
var dispatchEventByName = function (el, eventName, delay) {
	var evt;
	if (typeof Event === "function") { evt = new Event(eventName); }
	else {
		evt = document.createEvent('Event');	//ie11
		evt.initEvent(eventName, true, true);
	}

	if (delay >= 0) { setTimeout(function () { ele(el).dispatchEvent(evt); }, delay); }
	else { ele(el).dispatchEvent(evt); }
}

// module

module.exports = {

	appendHtml: appendHtml,
	appendBodyHtml: appendBodyHtml,
	prependHtml: prependHtml,

	querySelectorByAttr: querySelectorByAttr,

	getSearchPart: getSearchPart,

	observeSingleMutation: observeSingleMutation,

	dispatchEventByName: dispatchEventByName,

};

},{"element-tool":13}],11:[function(require,module,exports){

// ele-tool @ npm, enclose document.getElementById().

module.exports = function (idOrEl) { return (typeof idOrEl === "string") ? document.getElementById(idOrEl) : idOrEl; }

},{}],12:[function(require,module,exports){

// element-offset @ npm, get another element by offsetting the tail number of an element id.

module.exports = function (elOrId, offset) {
	var sid = (typeof elOrId === "string") ? elOrId : (elOrId.id || "");
	var m = sid.match(/\D(\d+)(\D*)$/);
	return m && document.getElementById(
		sid.slice(0, -m[0].length + 1) + (parseInt(m[1]) + offset) + m[2]
	);
}

},{}],13:[function(require,module,exports){

// element-tool @ npm, dom element tool, extend module ele-tool.

//extend module ele-tool
module.exports = exports = require("ele-tool");

//same as document.getElementById()
exports.fromId = function (id) { return document.getElementById(id); }

//seed for .id()
var seed = 0;

//create and set element a new unique id, or return the existed id.
exports.id = function (el, prefix) {
	if (el && el.id) return el.id;
	if (!prefix) prefix = "ele-id-";

	var sid;
	while (document.getElementById(sid = prefix + (++seed))) { };

	return el ? (el.id = sid) : sid;
}

},{"ele-tool":11}],14:[function(require,module,exports){

// format-error-tool @ npm, format error.

/*
	use case 1, format an error
		formatError( text, keyValue, json )

	use case 2, make sure return an Error
		formatError( textOrError )
*/
module.exports = function (text, keyValue, json) {
	if (typeof keyValue !== "undefined") text += ", " + JSON.stringify(keyValue);
	if (typeof json !== "undefined") text += ", " + JSON.stringify(json);
	return (text instanceof Error) ? text : Error(text);
}

},{}],15:[function(require,module,exports){

// htm-tool-css @ npm, htm-tool css module.

var ele = require("ele-tool");
var add_css_text = require("add-css-text");

// basic common css
add_css_text(require("./res/common.css"), "ht-common-css");

// css selected tool
var setSelected = function (selectList, unselectList, selected, selectedClass) {
	if (!selected) { var tmp = selectList; selectList = unselectList; unselectList = tmp; }	//exchange

	var i, imax;
	if (selectList) {
		if (!(selectList instanceof Array)) selectList = [selectList];

		imax = selectList.length;
		for (i = 0; i < imax; i++) {
			ele(selectList[i]).classList.add(selectedClass || "ht-selected");
		}
	}

	if (unselectList) {
		if (!(unselectList instanceof Array)) unselectList = [unselectList];

		imax = unselectList.length;
		for (i = 0; i < imax; i++) {
			ele(unselectList[i]).classList.remove(selectedClass || "ht-selected");
		}
	}
}

module.exports = {
	setSelected: setSelected,
};

},{"./res/common.css":16,"add-css-text":3,"ele-tool":11}],16:[function(require,module,exports){
module.exports = ".ht-cmd { \n\tcolor: green; \n\ttext-decoration: underline; \n\tcursor: pointer; \n\tfont-size: 9pt; \n} \n.ht-cmd:hover{ \n\tbackground:#eeeeee; \n} \n.ht-hover:hover{ \n\tbackground:#eeeeee; \n} \n.ht-selected{ \n\tbackground:lavender; \n} \n.ht-selected:hover{ \n\tbackground:#F0F0FA; \n}\n";

},{}],17:[function(require,module,exports){

// htm-tool-ui @ htm-tool ui module set.

"use strict";

var popup_common = require("./lib/popup-common.js");

// module

module.exports = {
	//tab
	tab: require("./lib/tab.js"),

	//radio group
	radio_group: require("./lib/radio-group.js"),

	//show log
	show_log: require("./lib/show-log.js"),

	//drag
	drag: require("./lib/drag-object.js"),

	//popup
	popup: require("./lib/popup.js"),

	//popup-common

	alert: popup_common.alert,
	confirm: popup_common.confirm,
	confirmYnc: popup_common.confirmYnc,
	prompt: popup_common.prompt,
	selectRadioList: popup_common.selectRadioList,
	selectCheckboxList: popup_common.selectCheckboxList,
	selectButtonList: popup_common.selectButtonList,

	//width splitter
	width_splitter: require("./lib/width-splitter.js"),

};

},{"./lib/drag-object.js":18,"./lib/popup-common.js":19,"./lib/popup.js":27,"./lib/radio-group.js":28,"./lib/show-log.js":30,"./lib/tab.js":32,"./lib/width-splitter.js":33}],18:[function(require,module,exports){
/*
drag tool, support mouse and multiple touches.

	example:
		
		<div onmousedown="htm_tool_ui.drag.start( arguments[0], this )" ontouchstart="htm_tool_ui.drag.start( arguments[0], this )">...</div>
*/

var create_assign = require("create-assign");
var ele = require("element-tool");

var dragObject = {

	dragSet: null,	//map drag start-key to drag start item; drag item: {itemArray,pageX0,pageY0,from,elStart,key}
	dragSetCount: 0,

	moveChanged: false,		//move changed flag

	init: function () {		//manually called constructor
		this.dragSet = {};
		this.dragSetCount = 0;
		this._onMove = this._onStop = this._onKey = null;		//clear binding from prototype

		//this.startDrag= this.start.bind(this);		//binding function for start()		//not usually, cancelled.
	},

	//start: function ( evt, el1, el2, ..., elN )
	start: function (evt, el1) {
		if (arguments.length < 2) return false;
		if (!evt) evt = window.event;

		//check if target is an input
		if (evt.target.tagName.match(/^(input|button|textarea|select|option.*|a|label)$/i) ||
			evt.target.classList.contains("ht-input") || evt.target.classList.contains("ht-cmd")) { return false; }

		//unify event and drag-data
		var dragEvt, dragItem, evtKey;
		if (evt.type == "mousedown") {
			dragEvt = evt;
			dragItem = { from: "mouse", elStart: evt.target, key: "mouse", };

			if ("mouse" in this.dragSet) this.onStop({ type: "mouseup" });
		}
		else if (evt.type == "touchstart") {
			dragEvt = evt.targetTouches[0];	//only the 1st
			evtKey = "touch-" + dragEvt.identifier;
			dragItem = { from: "touch", elStart: evt.target, key: evtKey, };

			if (evtKey in this.dragSet) this.onStop({ type: "touchend", changedTouches: [{ identifier: dragEvt.identifier }] });
		}
		else { return false; }	//unknown event

		//init drag-data
		dragItem.pageX0 = dragEvt.pageX;
		dragItem.pageY0 = dragEvt.pageY;

		dragItem.itemArray = [];
		var i, imax = arguments.length, el;
		for (i = 1; i < imax; i++) {
			el = ele(arguments[i]);
			dragItem.itemArray.push([el, parseInt(el.style.left) || 0, parseInt(el.style.top) || 0]);
		}

		this.dragSet[dragItem.key] = dragItem;
		this.dragSetCount++;

		if (this.dragSetCount === 1) {
			//global listener
			document.addEventListener("mousemove", this._onMove || (this._onMove = this.onMove.bind(this)), false);
			document.addEventListener("mouseup", this._onStop || (this._onStop = this.onStop.bind(this)), false);
			document.addEventListener("keyup", this._onKey || (this._onKey = this.onKey.bind(this)), false);
			document.addEventListener('touchmove', this._onMove, { passive: false });
			document.addEventListener('touchend', this._onStop, false);
		}

		this.moveChanged = false;
	},

	//return pairs array of [ evt1, dragItem1, evt2, dragItem2, ... ]
	getEventList: function (evt) {
		var list = [];
		var keyType = evt.type.slice(0, 5);

		if (keyType == "mouse") {
			list.push(evt, this.dragSet["mouse"]);
		}
		else if (keyType == "touch") {
			var touchList = (evt.type == "touchend") ? evt.changedTouches : evt.targetTouches;
			var i, imax = touchList.length, k;
			for (i = 0; i < imax; i++) {
				k = "touch-" + touchList[i].identifier;
				if (k in this.dragSet) list.push(touchList[i], this.dragSet[k]);
			}
		}
		else { return null; }	//unknown event

		return (list.length > 0) ? list : null;
	},

	onStop: function (evt) {
		//reset all
		if (evt === false) {
			for (var i in this.dragSet) {
				var dragItem = this.dragSet[i];
				var j, jmax = dragItem.itemArray.length, ai;
				for (j = 0; j < jmax; j++) {
					ai = dragItem.itemArray[j];
					ai[0].style.left = ai[1] + "px";
					ai[0].style.top = ai[2] + "px";
				}
			}
		}

		if (evt) {
			var list = this.getEventList(evt);
			if (!list) return false;

			var i, imax = list.length, dragItem;
			for (i = 0; i < imax; i += 2) {
				dragItem = list[i + 1];
				if (dragItem.key in this.dragSet) {
					delete this.dragSet[dragItem.key];
					this.dragSetCount--;
				}
			}
		}
		else {
			//stop all
			this.dragSet = {};
			this.dragSetCount = 0;
		}

		if (this.dragSetCount < 1) {
			//remove global listener
			//console.log("release drag listener");
			document.removeEventListener("mousemove", this._onMove, false);
			document.removeEventListener("mouseup", this._onStop, false);
			document.removeEventListener("keyup", this._onKey, false);
			document.removeEventListener('touchmove', this._onMove, { passive: false });
			document.removeEventListener('touchend', this._onStop, false);
		}

		if (this.dragSetCount < 0) {
			console.error("dragSetCount abnormal, " + this.dragSetCount);
			this.onStop(false);	//stop all
			this.dragSetCount = 0;
		}
	},

	onFirstMove: null,	//function (evt) {},

	onMove: function (evt) {
		var list = this.getEventList(evt);
		if (!list) return false;

		var i, imax = list.length, dragItem, changed;
		for (i = 0; i < imax; i += 2) {
			dragItem = list[i + 1];

			var dx = list[i].pageX - dragItem.pageX0;
			var dy = list[i].pageY - dragItem.pageY0;
			if (dx || dy) changed = 1;

			var j, jmax = dragItem.itemArray.length, ai;
			for (j = 0; j < jmax; j++) {
				ai = dragItem.itemArray[j];
				ai[0].style.left = (ai[1] + dx) + "px";
				ai[0].style.top = (ai[2] + dy) + "px";
			}
		}

		if (evt.type == "touchmove") { evt.preventDefault(); }

		//console.log("move "+ list[0].pageX +","+ list[0].pageY );

		if (!this.moveChanged && changed) {
			this.moveChanged = true;
			if (this.onFirstMove) this.onFirstMove(evt);
		}

	},

	onKey: function (evt) {
		var keyCode = evt.keyCode || evt.which || evt.charCode;

		if (keyCode == 27) { this.onStop(false); }		//ESC to reset
		else { this.onStop(); }		//others to stop
	},

	//listener tool
	startListener: function () {
		dragObject.start(arguments[0], this);
	},

};

dragObject.init();

// module

module.exports = exports = dragObject;

exports.class = function (extraProperties) {
	var o = create_assign(dragObject, extraProperties);
	o.init();
	return o;
};

},{"create-assign":9,"element-tool":13}],19:[function(require,module,exports){

var ele = require("element-tool");
var popup = require("./popup.js");
var query_by_name_path = require("query-by-name-path");
var htm_tool_css = require("htm-tool-css");
var dom_document_tool = require("dom-document-tool");

var alert = function (message, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/alert.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popup.closeListener);
}
var confirm = function (message, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/confirm.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);
}
var confirmYnc = function (message, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/confirm-ync.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".yes").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".no").addEventListener("click", popup.closeByNameListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);
}

//----------------------------------------------------------------------------------------

var promptListener = function () {
	popup.hide(this, query_by_name_path(this.parentNode.parentNode, '.input').value);
}

var prompt = function (message, defaultValue/*optional*/, modal/*optional*/, cb) {
	//args
	if (typeof defaultValue === "function" && typeof modal === "undefined" && !cb) { cb = defaultValue; defaultValue = ""; modal = false; }
	else if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/prompt.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", promptListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	if (defaultValue) query_by_name_path(elPopup, '.input').value = defaultValue;
}

//----------------------------------------------------------------------------------------

var selectRadioChangeListener = function () {
	if (!this.checked) return;

	var elInput = this.parentNode.parentNode;

	var oldv = elInput.getAttribute('value');
	var oldel = dom_document_tool.querySelectorByAttr(elInput, 'input', 'value', oldv);
	htm_tool_css.setSelected(this.parentNode, oldel && oldel.parentNode, true);
	elInput.setAttribute('value', this.value);
}

var selectRadioListener = function () {
	var elInput = query_by_name_path(this.parentNode.parentNode, '.input');
	//if no radio is checked, process will be stopped by error.
	popup.hide(this, elInput.querySelector('input:checked').value);
}

//item: [value,text], or single string for both value and text.
var selectRadioList = function (message, itemList, defaultValue/*optional*/, modal/*optional*/, cb) {
	//args
	if (typeof defaultValue === "function" && typeof modal === "undefined" && !cb) { cb = defaultValue; defaultValue = ""; modal = false; }
	else if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/select-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectRadioListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	var elInput = query_by_name_path(elPopup, '.input');
	if (defaultValue) elInput.setAttribute("value", defaultValue);

	var nm = ele.id(null, "ht-select-radio-");
	var i, imax = itemList.length, v, elItem, elRadio, isSelected;
	for (i = 0; i < imax; i++) {
		v = itemList[i];
		if (!(v instanceof Array)) v = [v, v];

		elItem = dom_document_tool.appendHtml(elInput,
			"<label class='ht-hover' style='width:100%;display:block;margin-bottom:1px;'></label>");
		elItem.innerHTML = " " + v[1];
		isSelected = (v[0] == defaultValue);
		if (isSelected) elItem.classList.add("ht-selected");

		elRadio = dom_document_tool.prependHtml(elItem, "<input type='radio' name='" + nm + "'></input> ");
		elRadio.value = v[0];
		if (isSelected) elRadio.checked = true;

		elRadio.addEventListener("change", selectRadioChangeListener);
	}
}

//----------------------------------------------------------------------------------------

var selectCheckboxChangeListener = function () {
	htm_tool_css.setSelected(this.parentNode, null, this.checked);
}

var selectCheckboxListener = function () {
	var items = query_by_name_path(this.parentNode.parentNode, '.input').querySelectorAll('input:checked');
	var i, a = [];		//return empty array if nothing selected
	for (i = 0; i < items.length; i++) {
		a[i] = items[i].value;
	};
	popup.hide(this, a);
}

var selectCheckboxList = function (message, itemList, defaultValueList/*optional*/, modal/*optional*/, cb) {
	//args
	if (typeof defaultValueList === "function" && typeof modal === "undefined" && !cb) { cb = defaultValueList; defaultValueList = null; modal = false; }
	else if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/select-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;
	query_by_name_path(elPopup, ".ok").addEventListener("click", selectCheckboxListener);
	query_by_name_path(elPopup, ".cancel").addEventListener("click", popup.closeListener);

	if (!defaultValueList || typeof defaultValueList == "string") defaultValueList = [defaultValueList];
	var elInput = query_by_name_path(elPopup, '.input');

	var i, imax = itemList.length, v, elItem, elCheck, isSelected;
	for (i = 0; i < imax; i++) {
		v = itemList[i];
		if (!(v instanceof Array)) v = [v, v];

		elItem = dom_document_tool.appendHtml(elInput,
			"<label class='ht-hover' style='width:100%;display:block;margin-bottom:1px;'></label>");
		elItem.innerHTML = " " + v[1];
		isSelected = (defaultValueList.indexOf(v[0]) >= 0);
		if (isSelected) elItem.classList.add("ht-selected");

		elCheck = dom_document_tool.prependHtml(elItem, "<input type='checkbox'></input> ");
		elCheck.value = v[0];
		if (isSelected) elCheck.checked = true;

		elCheck.addEventListener("change", selectCheckboxChangeListener);
	}
}

//----------------------------------------------------------------------------------------

var selectButtonList = function (message, itemList, modal/*optional*/, cb) {
	//args
	if (typeof modal === "function" && !cb) { cb = modal; modal = false; }

	var elPopup = popup.showHtml(require("./popup-common/button-list.htm"), modal, cb);

	query_by_name_path(elPopup, ".message").innerHTML = message;

	var elInput = query_by_name_path(elPopup, '.input');

	var i, imax = itemList.length, v, elItem;
	for (i = 0; i < imax; i++) {
		v = itemList[i];
		if (!(v instanceof Array)) v = [v, v];

		elItem = dom_document_tool.appendHtml(elInput,
			"<button style='width:100%;display:block;margin-bottom:0.5em;'></button>");
		elItem.innerHTML = v[1];
		elItem.setAttribute("name", v[0]);

		elItem.addEventListener("click", popup.closeByNameListener);
	}
	//add last cancel
	elItem = dom_document_tool.appendHtml(elInput,
		"<button style='width:100%;display:block;margin-bottom:1px;margin-top:1em;'>取消</button>");
	elItem.addEventListener("click", popup.closeListener);
}

// module

module.exports = {
	alert: alert,
	confirm: confirm,
	confirmYnc: confirmYnc,
	prompt: prompt,
	selectRadioList: selectRadioList,
	selectCheckboxList: selectCheckboxList,
	selectButtonList: selectButtonList,
};

},{"./popup-common/alert.htm":20,"./popup-common/button-list.htm":21,"./popup-common/confirm-ync.htm":22,"./popup-common/confirm.htm":23,"./popup-common/prompt.htm":24,"./popup-common/select-list.htm":25,"./popup.js":27,"dom-document-tool":10,"element-tool":13,"htm-tool-css":15,"query-by-name-path":35}],20:[function(require,module,exports){
module.exports = "<div style='min-width:200px;' name='message'></div><br>\n<span style='float:right'><button name='ok'>确定</button></span>";

},{}],21:[function(require,module,exports){
module.exports = "<div style='min-width:200px;' name='message'></div><br>\n<div name='input' class='ht-input ht-popup-group' value='' style=\"border:none;\"></div>";

},{}],22:[function(require,module,exports){
module.exports = "<div style='min-width:200px;' name='message'></div><br>\n<span style='float:right'>\n\t<button name='yes'>是</button>\n\t<button name='no'>否</button>\n\t<button name='cancel'>取消</button>\n</span>";

},{}],23:[function(require,module,exports){
module.exports = "<div style='min-width:200px;' name='message'></div><br>\n<span style='float:right'>\n\t<button name='ok'>确定</button>\n\t<button name='cancel'>取消</button>\n</span>";

},{}],24:[function(require,module,exports){
module.exports = "<div style='min-width:200px;' name='message'></div><br>\n<input type='text' style='width:100%;box-sizing:border-box;' name='input'></input><br><br>\n<span style='float:right'>\n\t<button name='ok'>确定</button>\n\t<button name='cancel'>取消</button>\n</span>";

},{}],25:[function(require,module,exports){
module.exports = "<div style='min-width:200px;' name='message'></div><br>\n<div name='input' class='ht-input ht-popup-group' value=''></div><br>\n<span style='float:right'>\n\t<button name='ok'>确定</button>\n\t<button name='cancel'>取消</button>\n</span>";

},{}],26:[function(require,module,exports){
module.exports = ".ht-popup{ \n\tposition:fixed; \n\tleft:0px; \n\ttop:0px; \n\tright:0px; \n\tbottom:0px; \n\ttext-align:center; \n} \n.ht-popup-back{ \n\tposition:absolute; \n\tleft:0px; \n\ttop:0px; \n\tright:0px; \n\tbottom:0px; \n\tbackground:#eee; \n\topacity:0.5; \n} \n.ht-popup-body{ \n\tdisplay:inline-block; \n\tposition:relative; \n\tmargin-top:10%; \n\tbackground:white; \n\tborder:1px solid gray; \n\tborder-radius:1em; \n\tpadding:0.5em; \n\tbox-shadow:0 0 30px gray; \n\ttext-align:left; \n} \n.ht-popup-modal{ \n\tborder-radius:0px; \n}\n.ht-popup-group{ \n\tborder:1px solid #ccc;\n\tpadding:0.2em;\n\tmax-height:10em;\n\toverflow:auto;\n\tmax-width:500px;\n}\n";

},{}],27:[function(require,module,exports){

/*
popup pannel tool

	example:
		<div id='divPopup1' class='ht-popup' style='display:none;'>
			<div class='ht-popup-body' onmousedown='htm_tool_ui.drag.start( arguments[0], this )' ontouchstart='htm_tool_ui.drag.start( arguments[0], this )'>
				popup-1<hr>This is popup-1.
			</div>
		</div>
		
		htm_tool_ui.popup.show('divPopup1');
*/

var ele = require("element-tool");
var add_css_text = require("add-css-text");
var dom_document_tool = require("dom-document-tool");
var add_event_listeners = require("add-event-listeners");

var drag_object = require("./drag-object.js");

var popupStack = null;	//item: [el, cb ]

var backClickListener = function () {
	if (!this.parentNode.querySelector('.ht-popup-body').classList.contains('ht-popup-modal'))
		hide(this);
}
var closeListener = function () {
	hide(this);
}
var closeByNameListener = function () {
	hide(this, this.getAttribute("name"));
}

var show = function (el, modal, cb) {

	//init
	if (!popupStack) {
		popupStack = [];

		add_css_text(require("./popup.css"));
	}

	//----------------------------------------------------------------------------------------

	el = ele(el);

	//check closed
	while (popupStack.length > 0) {
		if (popupStack[popupStack.length - 1][0].style.display == "none") popupStack.pop();
		else break;
	}

	//don't re-open
	var i, imax = popupStack.length;
	for (i = 0; i < imax; i++) {
		if (popupStack[i][0] === el) {
			console.error("fail to re-open popup, " + (el.id || ""));
			return;
		}
	}

	//check body
	var elBody = el.querySelector(".ht-popup-body");
	if (!elBody) {
		console.error("popup-body unfound, " + (el.id || ""));
		return;
	}

	//add back
	if (!el.querySelector(".ht-popup-back")) {
		var elBack = dom_document_tool.prependHtml(el, "<div class='ht-popup-back'></div>");
		elBack.addEventListener("click", backClickListener);
	}

	//add close button
	var elClose = elBody.querySelector("span[name='ht-popup-close']");
	if (!elClose) {
		elClose = dom_document_tool.prependHtml(elBody,
			"<span name='ht-popup-close' style='float:right;text-decoration:none;padding:0em 0.3em;' " +
			"class='ht-cmd' title='关闭'>x</span>");
		elClose.addEventListener("click", closeListener);
	}

	//modal setting
	if (modal) {
		elBody.classList.add("ht-popup-modal");
		elClose.innerHTML = "[&times;]";
	}
	else {
		elBody.classList.remove("ht-popup-modal");
		elClose.innerHTML = "(&times;)";
	}

	el.style.display = "";

	el.style.zIndex = 10 + popupStack.length;

	popupStack.push([el, cb]);

	return el;
}

var hide = function (el, data) {
	el = ele(el);

	//find .ht-popup
	while (el && !el.classList.contains("ht-popup")) { el = el.parentNode; }
	if (!el) {
		console.error("top ht-popup unfound");
		return;
	}

	var i, psi;
	for (i = popupStack.length - 1; i >= 0; i--) {
		psi = popupStack[i];
		if (el === psi[0]) {
			el.style.display = "none";
			popupStack.pop();
			if (psi[1]) psi[1](null, data);
			return;
		}

		if (psi[0].style.display == "none") {
			popupStack.pop();
			continue;
		}

		break;	//fail
	}

	if (!popupStack.length) return;

	//abnormal popup, close all.
	console.error("abnormal popup, close all.");
	while (popupStack.length > 0) {
		popupStack.pop()[0].style.display = "none";
	}
}

//----------------------------------------------------------------------------------------

var POPUP_HTML_COUNT_MAX = 10;

var showHtml = function (html, modal, cb) {

	//find empty html
	var i, nm, el;
	for (i = 1; i <= POPUP_HTML_COUNT_MAX; i++) {
		nm = "ht-popup-html-" + i;
		el = ele(nm);
		if (!el) break;
		if (el.style.display == "none") break;
	}

	if (i > POPUP_HTML_COUNT_MAX) {
		console.error("popup-html stack overflow, max " + POPUP_HTML_COUNT_MAX);
		return;
	}

	//init
	var elPopup = ele(nm), elBody;
	if (!elPopup) {
		elPopup = dom_document_tool.appendBodyHtml(
			"<div id='" + nm + "' class='ht-popup' style='display:none;'>" +
			"<div class='ht-popup-body'></div>" +
			"</div>"
		);
		elBody = ele(nm).querySelector(".ht-popup-body");
		add_event_listeners(
			elBody,
			["mousedown", drag_object.startListener],
			["touchstart", drag_object.startListener]
		);
	}
	else {
		elBody = ele(nm).querySelector(".ht-popup-body");
	}
	elBody.innerHTML = html;

	return show(nm, (typeof modal === "undefined") ? 1 : modal, cb);
}

// module

module.exports = {
	show: show,
	hide: hide,

	closeListener: closeListener,
	closeByNameListener: closeByNameListener,

	showHtml: showHtml,
};

},{"./drag-object.js":18,"./popup.css":26,"add-css-text":3,"add-event-listeners":4,"dom-document-tool":10,"element-tool":13}],28:[function(require,module,exports){

/*
radio group

	example:
		//don't set name attribute of radio control, to avoid outside name duplication.

		<label id='group1'><input type='radio' checked value='a'></input>aaa</label><br>
		<span id='group2'>
			<label><input type='radio' value='b'></input>bbb</label><br>
			<label><input type='radio' value='c' disabled></input>ccc</label><br>
		</span>

		//init radio group
		htm_tool_ui.radio_group.init(['group1','group2'],'b');
		//or
		htm_tool_ui.radio_group(['group1','group2'],'b');	//shortcut for .init()

		//get value
		assert(htm_tool_ui.radio_group.getValue('group1') === htm_tool_ui.radio_group.getValue('group2'));

*/

var ele = require("element-tool");

var getSubRadios = function (el) {
	el = ele(el);
	return (el.tagName.toUpperCase() == "INPUT" && el.type == "radio") ? el :
		el.querySelectorAll("input[type='radio']");
}

var onRadioGroupClick = function () {
	this.checked = true;		//keep checked

	var groupId = this.getAttribute("ht-ui-radio-group");
	var elGroup = ele(groupId);
	var lastId = elGroup.getAttribute("ht-ui-radio-group-last");

	var thisId = ele.id(this);
	if (lastId == thisId) return;

	//uncheck last
	if (lastId) { ele(lastId).checked = false; }

	elGroup.setAttribute("ht-ui-radio-group-last", thisId);
}

//return groupId
var init = function (groupArray, defaultValue, elGroup) {
	if (!(groupArray instanceof Array)) groupArray = [groupArray];

	//prepare group id
	if (!elGroup) elGroup = groupArray[0];
	var groupId = ele.id(ele(elGroup));

	var i, j, elList, elRadio, elSelected;
	for (var i = 0; i < groupArray.length; i++) {
		elList = getSubRadios(groupArray[i]);

		for (j = 0; j < elList.length; j++) {
			elRadio = elList[j];
			if (!elSelected) elSelected = elRadio;	//if no defaultValue, select the 1st.

			elRadio.setAttribute("ht-ui-radio-group", groupId);
			elRadio.addEventListener("click", onRadioGroupClick);
			elRadio.checked = (elRadio.getAttribute("value") === defaultValue);
			if (elRadio.checked) elSelected = elRadio;
		}
	}

	onRadioGroupClick.apply(elSelected);

	return groupId;
}

//groupId: any groupId or radio id
var getValue = function (groupId) {
	var el = ele(groupId);
	var lastId = el.getAttribute("ht-ui-radio-group-last");
	if (!lastId) {
		//try get from radio
		groupId = getSubRadios(el)[0].getAttribute("ht-ui-radio-group");
		if (!groupId) return null;
		lastId = ele(groupId).getAttribute("ht-ui-radio-group-last");
		if (!lastId) return null;
	}
	return ele(lastId).getAttribute("value");
}

// module

module.exports = exports = init;

exports.init = init;
exports.getValue = getValue;

},{"element-tool":13}],29:[function(require,module,exports){
module.exports = "<div style='position:fixed;right:0.5em;bottom:0.5em;width:auto;height:auto;max-width:500px;background:white;border:1px\n\tsolid gray;font-size:9pt;padding:0.5em;cursor:default;'>\n\t<span name='close' class='ht-cmd' style='float:right;text-decoration:none;padding:0em 0.3em;'\n\t\ttitle='关闭'>&times;</span>\n\t<span name='minimize' class='ht-cmd' style='display:none;float:right;text-decoration:none;padding:0em 0.3em;'\n\t\ttitle='最小化'>&minus;</span>\n\t<b>日志</b>\n\t<div name='content' style='display:none;'></div>\n</div>";

},{}],30:[function(require,module,exports){
/*
log control

	example:
		
		htm_tool_ui.ui.show_log("some log message");
*/

var ele = require("element-tool");
var tmkt = require("tmkt");
var dom_document_tool = require("dom-document-tool");
var query_by_name_path = require("query-by-name-path");

var LOG_HIDE_DELAY = 5000;	//log hide delay, in ms.
var MAX_LOG_LINE = 16;	//max log line

var tmidLog = null;	//log timer id
var elidLog = null;	//element id

var onTimeSpanClick = function () {
	if (!this.onclick) return;

	var repeatCount = parseInt(this.getAttribute("repeatCount"));

	var aTm = this.title.split('\n');
	this.innerHTML = aTm[aTm.length - 1] + ((repeatCount > 1) ? (" <b>(" + repeatCount + ")</b>") : "");

	this.style.color = 'green';
	this.onclick = null;
	this.className = '';
}

var showLog = function (s) {

	//init
	var elLog = ele(elidLog);
	if (!elLog) {
		elLog = dom_document_tool.appendBodyHtml(require("./show-log.htm"));
		elLog.addEventListener("click", function () { showLog(); });
		query_by_name_path(elLog, "close").addEventListener("click",
			function () { setTimeout(function () { showLog(false); }, 0); }
		);
		query_by_name_path(elLog, "minimize").addEventListener("click",
			function () { setTimeout(function () { showLog(null); }, 0); }
		);

		elidLog = ele.id(elLog);
	}

	//----------------------------------------------------------------------------------------

	var el = query_by_name_path(elLog, 'content');
	var elMinimize = query_by_name_path(elLog, 'minimize');
	var elClose = query_by_name_path(elLog, 'close');

	elLog.style.display = "";

	if (s) {
		var tms = tmkt.toString19();

		var elLast = el.lastChild;
		if (elLast && elLast.querySelector("span:nth-child(2)").textContent == s) {
			var elTm = elLast.querySelector("span");

			//repeatCount
			var repeatCount = parseInt(elTm.getAttribute("repeatCount")) + 1;
			elTm.setAttribute("repeatCount", repeatCount);

			//repeat list
			var aTm = elTm.title.split("\n");
			aTm[aTm.length] = tms;
			while (aTm.length > MAX_LOG_LINE) { aTm.shift(); }

			elTm.title = ((repeatCount > aTm.length) ? "...\n" : "") + aTm.join("\n");

			//show last
			elTm.innerHTML = (elTm.onclick ? tms.slice(-8) : tms) + " <b>(" + repeatCount + ")</b>";
		}
		else {
			elLast = dom_document_tool.appendHtml(el,
				"<div>* " +
				"<span class='ht-cmd' title='" + tms + "' repeatCount='1'>" + tms.slice(-8) + "</span> " +
				"<span></span>" +
				"</div>"
			);
			elLast.querySelector("span").onclick = onTimeSpanClick;
			elLast.querySelector("span:nth-child(2)").textContent = s;

			while (el.childNodes.length > MAX_LOG_LINE) { el.removeChild(el.firstChild); }
		}

		el.style.display = elMinimize.style.display = elClose.style.display = "";
	}
	else {
		if (s === null || s === false) {
			el.style.display = elMinimize.style.display = elClose.style.display = "none";
			if (s === false) elLog.style.display = "none";
		}
		else if (el.style.display == "none" && el.childNodes.length > 0) {
			el.style.display = elMinimize.style.display = elClose.style.display = "";
		}
	}

	if (el.style.display != "none") {
		if (tmidLog) { clearTimeout(tmidLog); tmidLog = null; }
		tmidLog = setTimeout(
			function () {
				el.style.display = elMinimize.style.display = elClose.style.display = "none";
				tmidLog = null;
			},
			LOG_HIDE_DELAY
		);
	}
}

// module

module.exports = showLog;

},{"./show-log.htm":29,"dom-document-tool":10,"element-tool":13,"query-by-name-path":35,"tmkt":37}],31:[function(require,module,exports){
module.exports = ".ht-tab-group{\n\tborder-bottom:1px solid black;\n\tmargin-bottom:0.5em;\n}\n.ht-tab-item{\n\tdisplay:inline-block;\n\tpadding:0.2em 0.5em;\n\tmargin-left:0.5em;\n\tposition:relative;\n\tleft:0px;\n\ttop:0px;\n\tbackground:#eee;\n\tcursor:pointer;\n\tborder-left:1px solid #eee;\n\tborder-top:0px solid #eee;\n\tborder-right:1px solid #eee;\n}\n.ht-tab-item-selected{\n\tbackground:white;\n\ttop:1px;\n\tcursor:default;\n\tborder-left:1px solid black;\n\tborder-top:1px solid black;\n\tborder-right:1px solid black;\n}\n";

},{}],32:[function(require,module,exports){

/*
tab control

	example:

		<div class='ht-tab-group'>
			<span class='ht-tab-item ht-tab-item-selected' id='spTab1'>Tab1</span>
			<span class='ht-tab-item' id='spTab2'>Tab2</span>
		</div>
		<div id='divTab1'><b>tab1 content</b></div>
		<div id='divTab2' style='display:none;'><i>tab2 content</i></div>

		//init tab control
		htm_tool_ui.tab.init({'spTab1':'divTab1','spTab2':'divTab2'},'spTab1');
		//or tab/view pair array
		htm_tool_ui.tab.init(['spTab1', 'divTab1', ['spTab2', 'divTab2'] ], 'spTab1');
		//or
		htm_tool_ui.tab(['spTab1', 'divTab1', ['spTab2', 'divTab2'] ], 'spTab1');	//shortcut for .init()

		//get last tab id
		assert(htm_tool_ui.tab.getSelected('spTab1') === htm_tool_ui.tab.getSelected('spTab2'));

*/

var ele = require("element-tool");
var add_css_text = require("add-css-text");

var initialized = false;		//tab initialized flag

var onTabClick = function () {
	var groupId = this.getAttribute("ht-ui-tab-group");
	var idTab = ele.id(this);
	var idPannel = this.getAttribute("ht-ui-tab-pannel");

	var elGroup = ele(groupId);
	var lastTab = elGroup.getAttribute("ht-ui-tab-last-tab");
	var lastView = elGroup.getAttribute("ht-ui-tab-last-view");

	if (lastTab == idTab && lastView == idPannel) return;

	//hide last
	if (lastTab) { ele(lastTab).classList.remove("ht-tab-item-selected"); }
	if (lastView) { ele(lastView).style.display = "none"; }

	//show selected
	ele(idTab).classList.add("ht-tab-item-selected");
	if (idPannel) ele(idPannel).style.display = "";

	elGroup.setAttribute("ht-ui-tab-last-tab", idTab);
	elGroup.setAttribute("ht-ui-tab-last-view", idPannel);
}

//return groupId
var init = function (tabPairArray, tabSelected, elGroup) {
	//init css
	if (!initialized) {
		initialized = true;
		add_css_text(require("./tab.css"), "ht-ui-tab-css");
	}

	var i;
	if (!(tabPairArray instanceof Array)) {
		var a = [];
		for (i in tabPairArray) a.push(i, tabPairArray[i]);
		tabPairArray = a;
	}
	else {
		//flat array
		tabPairArray = Array.prototype.concat.apply([], tabPairArray);
	}

	//prepare group
	if (!elGroup) elGroup = ele(tabPairArray[0]);
	var groupId = ele.id(elGroup, "tab-group-");

	//init
	var i, elTab, elView;
	for (i = 0; i < tabPairArray.length; i += 2) {
		elTab = ele(tabPairArray[i]);
		elTab.setAttribute("ht-ui-tab-group", groupId);
		elTab.addEventListener("click", onTabClick);
		elTab.classList.add("ht-tab-item");

		if (i == tabSelected) { elTab.classList.add("ht-tab-item-selected"); }
		else { elTab.classList.remove("ht-tab-item-selected"); }

		elView = ele(tabPairArray[i + 1]);
		elView.style.display = (i == tabSelected) ? "" : "none";

		elTab.setAttribute("ht-ui-tab-pannel", ele.id(elView));
	}

	if (tabSelected) onTabClick.apply(ele(tabSelected));

	return groupId;
}

/*
To get selected tab id
groupId: any groupId, or any tab id
*/
var getSelected = function (groupId) {
	var el = ele(groupId);
	var lastId = el.getAttribute("ht-ui-tab-last-tab");
	if (!lastId) {
		//try get from tab
		groupId = el.getAttribute("ht-ui-tab-group");
		if (!groupId) return null;
		lastId = ele(groupId).getAttribute("ht-ui-tab-last-tab");
		if (!lastId) return null;
	}
	return lastId;
}

// module

module.exports = exports = init;

exports.init = init;
exports.getSelected = getSelected;

},{"./tab.css":31,"add-css-text":3,"element-tool":13}],33:[function(require,module,exports){

/*
width splitter

	example:

		<div style='position:relative;width:300px;height:300px;'>
			<div id='div1' style='position:absolute;left:0px;top:0px;bottom:0px;width:30%;background:#FFeeee;'></div>
			<div id='div2' style='position:absolute;left:0px;top:0px;bottom:0px;width:70%;background:#eeFFee;'></div>
			<div id='splitter1' style='z-index:1;position:absolute;left:100px;width:10px;top:20px;bottom:30px;'></div>
		</div>
		
		<div id='div3' style='width:100px;height:100px;background:#eeeeFF;'></div>

		//init width splitter
		htm_tool_ui.width_splitter('splitter1',['div1','div3'],'div2',10);

*/

var ele = require("element-tool");
var to_px_by_offset = require("to-px-by-offset");

var drag_object = require("./drag-object.js");

var widthSplitterDragObject = new drag_object.class({

	option: {},
	leftWidthList: null,
	rightBorderList: null,
	leftBorderList: null,
	rightWidthList: null,

	el1: null,
	top0: null,
	left0: null,

	leftWidth0: null,
	rightBorder0: null,
	rightBorderWidth0: null,
	leftBorder0: null,
	leftBorderWidth0: null,
	rightWidth0: null,

	start: function (evt, el1) {
		this.el1 = el1;
		this.top0 = el1.style.top;
		this.left0 = to_px_by_offset.left(el1);
		//console.log(this.top0+","+this.left0+","+el1.style.left);

		//leftWidth0
		var i, imax, el, wa, wa2;
		this.leftWidth0 = wa = [];
		imax = this.leftWidthList.length;
		for (i = 0; i < imax; i++) {
			wa[wa.length] = to_px_by_offset.width(ele(this.leftWidthList[i]));
		}

		//rightWidth0
		this.rightWidth0 = wa = [];
		imax = this.rightWidthList.length;
		for (i = 0; i < imax; i++) {
			wa[wa.length] = to_px_by_offset.width(ele(this.rightWidthList[i]));
		}

		//rightBorder0
		this.rightBorder0 = wa = [];
		this.rightBorderWidth0 = wa2 = [];
		imax = this.rightBorderList.length;
		for (i = 0; i < imax; i++) {
			el = ele(this.rightBorderList[i]);
			wa[wa.length] = to_px_by_offset.right(el);
			wa2[wa2.length] = el.offsetWidth;
		}

		//leftBorder0
		this.leftBorder0 = wa = [];
		this.leftBorderWidth0 = wa2 = [];
		imax = this.leftBorderList.length;
		for (i = 0; i < imax; i++) {
			el = ele(this.leftBorderList[i]);
			wa[wa.length] = to_px_by_offset.left(el);
			wa2[wa2.length] = el.offsetWidth;
		}

		//console.log(this.top0+","+this.left0+","+el1.style.left);

		this.el1.style.background = 'lightgrey';

		if (this.option.callback) this.option.callback("start");

		drag_object.start.apply(this, arguments);
	},

	onStop: function (evt) {
		drag_object.onStop.apply(this, arguments);
		this.el1.style.background = '';
		this.el1 = null;

		if (this.option.callback) this.option.callback("stop");
	},
	onMove: function (evt) {
		drag_object.onMove.apply(this, arguments);
		if (!this.moveChanged) return;

		this.el1.style.top = this.top0;	//restore top
		var dx = parseInt(this.el1.style.left) - this.left0;

		var i, imax, w, option = this.option;

		//check dx

		imax = this.leftWidthList.length;
		for (i = 0; i < imax; i++) {
			w = this.leftWidth0[i] + dx;
			if (w < option.minLeft) dx = option.minLeft - this.leftWidth0[i];
			if (option.maxLeft && w > option.maxLeft) dx = option.maxLeft - this.leftWidth0[i];
		}

		imax = this.rightBorderList.length;
		for (i = 0; i < imax; i++) {
			w = this.rightBorderWidth0[i] + dx;
			if (w < option.minLeft) dx = option.minLeft - this.rightBorderWidth0[i];
			if (option.maxLeft && w > option.maxLeft) dx = option.maxLeft - this.rightBorderWidth0[i];
		}

		imax = this.leftBorderList.length;
		for (i = 0; i < imax; i++) {
			w = this.leftBorderWidth0[i] - dx;
			if (w < option.minRight) dx = -(option.minRight - this.leftBorderWidth0[i]);
			if (option.maxRight && w > option.maxRight) dx = -(option.maxRight - this.leftBorderWidth0[i]);
		}

		imax = this.rightWidthList.length;
		for (i = 0; i < imax; i++) {
			w = this.rightWidth0[i] - dx;
			if (w < option.minRight) dx = -(option.minRight - this.rightWidth0[i]);
			if (option.maxRight && w > option.maxRight) dx = -(option.maxRight - this.rightWidth0[i]);
		}

		//update width
		imax = this.leftWidthList.length;
		for (i = 0; i < imax; i++) {
			ele(this.leftWidthList[i]).style.width = (this.leftWidth0[i] + dx) + "px";
		}

		imax = this.rightBorderList.length;
		for (i = 0; i < imax; i++) {
			ele(this.rightBorderList[i]).style.right = (this.rightBorder0[i] - dx) + "px";
		}

		imax = this.leftBorderList.length;
		for (i = 0; i < imax; i++) {
			ele(this.leftBorderList[i]).style.left = (this.leftBorder0[i] + dx) + "px";
		}

		imax = this.rightWidthList.length;
		for (i = 0; i < imax; i++) {
			ele(this.rightWidthList[i]).style.width = (this.rightWidth0[i] - dx) + "px";
		}

		//console.log(dx + "," + this.left0);
		this.el1.style.left = (dx + this.left0) + "px";

		if (option.callback) option.callback("move", dx);
	},

});

widthSplitterDragObject.init();

/*
	option:
		.minLeft		min width of left side, default 0;
		.maxLeft		max width of left side;
		.minRight		min width of right side, default 0;
		.maxRight		max width of right side;
		.min			min width of both left and right side;		//shortcut when `option` is number
		.max			max width of both left and right side;
		.cb/.callback	callback function after the width is changed.	//shortcut when `option` is function

*/

WidthSplitterDragObjectClass = function (elSplitter, leftWidthList, rightBorderList, leftBorderList, rightWidthList, option) {
	//option
	var typeofOption = typeof option;
	if (typeofOption === "function") option = { callback: option };
	else if (typeofOption === "number") option = { min: option };
	else if (!option) option = {};

	option.minLeft = option.minLeft || option.min || 0;
	option.maxLeft = option.maxLeft || option.max || 0;
	option.minRight = option.minRight || option.min || 0;
	option.maxRight = option.maxRight || option.max || 0;

	option.callback = option.callback || option.cb;

	if (!(leftWidthList instanceof Array)) leftWidthList = leftWidthList ? [leftWidthList] : [];
	if (!(rightBorderList instanceof Array)) rightBorderList = rightBorderList ? [rightBorderList] : [];
	if (!(leftBorderList instanceof Array)) leftBorderList = leftBorderList ? [leftBorderList] : [];
	if (!(rightWidthList instanceof Array)) rightWidthList = rightWidthList ? [rightWidthList] : [];

	//init
	elSplitter = ele(elSplitter);
	elSplitter.style.cursor = "ew-resize";
	elSplitter.style.userSelect = "none";

	var o = Object.create(widthSplitterDragObject);
	o.init();

	o.option = option;
	o.leftWidthList = leftWidthList;
	o.rightBorderList = rightBorderList;
	o.leftBorderList = leftBorderList;
	o.rightWidthList = rightWidthList;

	elSplitter.onmousedown = function () { o.start(arguments[0], this); }
	elSplitter.ontouchstart = elSplitter.onmousedown;

	return o;
}

// module

module.exports = exports = function (elSplitter, leftWidthList, rightBorderList, leftBorderList, rightWidthList, option) {
	return new WidthSplitterDragObjectClass(elSplitter, leftWidthList, rightBorderList, leftBorderList, rightWidthList, option);
};

exports.widthSplitterDragObject = widthSplitterDragObject;
exports.class = WidthSplitterDragObjectClass;

},{"./drag-object.js":18,"element-tool":13,"to-px-by-offset":38}],34:[function(require,module,exports){

// path-tool @ npm
// path tool

module.exports = {
	dirPart: function (path) {	//like path.dirname() + "/"
		return path.replace(/[\\\/]+$/, "").replace(/[^\\\/]+$/, "");
	},

	normalize: function (path) {		//like path.normalize()
		path = path.replace(/([\\\/])([\\\/]+)/g, "$1");	//shrink //
		path = path.replace(/(^|[\\\/])(\.([\\\/]|$))+/g, "$1");	//shrink /./

		//shrink dir/../
		var last = "";
		while (path && last != path) {
			last = path;
			path = path.replace(/(^|[\\\/])([^\.\\\/]|\.+[^\.\\\/])[^\\\/]*[\\\/]\.\.([\\\/]|$)/, "$1");
		}
		return path;
	},

}

},{}],35:[function(require,module,exports){

// query-by-name-path @ npm, query dom element by name attribute path.

/*
	namePath:
		array
			name string array;
		string
			name string list separated only by "." ( in priority );
			or name string list separated only by whitespace.
	strict:
		false
			it may have other names from `el` to the end of the name path;
		true
			it shouldn't have any other name from `el` to the end of the name path;
		undefined
			if `namePath` contain '.' then set strict to true, otherwise set to false.
*/

module.exports = function (el, namePath, strict) {
	//string to array
	if (typeof namePath === "string") {
		if (namePath.indexOf(".") >= 0) {
			if (typeof strict === "undefined") strict = true;
			namePath = namePath.replace(/^\./, "").split(".");
		}
		else {
			namePath = namePath.split(/\s+/);
		}
	}

	//build query string
	var i, imax = namePath.length, sa = [];
	for (i = 0; i < imax; i++) {
		sa[sa.length] = "[name='" + namePath[i].replace(/(\<\>\'\"\:)/g, "\\$1") + "']";
	}

	el = (typeof el === "string") ? document.getElementById(el) : el;
	if (!strict) return el.querySelector(sa.join(" "));

	// strict mode

	var elList = el.querySelectorAll(sa.join(" "));
	var j, jmax = elList.length, eli;
	for (j = 0; j < jmax; j++) {
		//check name path
		eli = elList[j].parentNode;
		for (i = imax - 2; i >= 0; i--) {
			while (!eli.hasAttribute("name")) { eli = eli.parentNode; }
			if (eli.getAttribute("name") != namePath[i]) break;	//not match
			eli = eli.parentNode;
		}
		if (i >= 0) continue;	//not match, check next

		//check to root
		while (1) {
			if (eli === el) return elList[j];	//matched and return
			if (eli.hasAttribute("name")) break;	//not match
			eli = eli.parentNode;
		}
	}
	return null;
}

},{}],36:[function(require,module,exports){

// script-tool @ npm, script tool.

//search property descriptor of an object, or of its prototype.
var getPropertyDescriptor = function (obj, prop /*, _depth*/) {
	var _depth = (arguments[2] || 0), pd;
	if (!(_depth >= 0 && _depth < 32)) return null;	//max depth 32, to prevent loop

	if (pd = Object.getOwnPropertyDescriptor(obj, prop)) return pd;		//found

	var proto = Object.getPrototypeOf(obj)
	if (!proto || obj === proto) return null;	//prototype list end

	return getPropertyDescriptor(proto, prop, _depth + 1);	//searh in prototype list
}

//enclose property descriptor
//options: { replaceGetter: true/false }, or just replaceGetter
var enclosePropertyDescriptor = function (obj, prop, newSetter, newGetter, options) {
	//arguments
	if (typeof options === "boolean") options = { replaceGetter: options };
	var replaceGetter = options && options.replaceGetter;
	options = null;

	//enclose
	var oldDesc = getPropertyDescriptor(obj, prop) || {};
	var newDesc = { configurable: true, enumerable: true };

	//setter
	var oldSetter = oldDesc.set;
	if (!oldSetter) { if (newSetter) { newDesc.set = newSetter; } }
	else if (!newSetter) { newDesc.set = oldSetter; }
	else {
		newDesc.set = function (v) {
			oldSetter.call(this, v);
			newSetter.call(this, v);
		}
	}

	//getter
	if (oldDesc.get && !(newGetter && replaceGetter)) { newDesc.get = oldDesc.get; newGetter = null; }
	else if (newGetter) { newDesc.get = newGetter; }

	//remove old and define new
	if (obj.hasOwnProperty(prop)) delete obj[prop];
	Object.defineProperty(obj, prop, newDesc);
}

//try to transfer value by value mapper; if unfound, return original value.
var mapValue = function (mapper, value) {
	if (!mapper) return value;
	var newV = (typeof mapper === "function") ? mapper(value) : mapper[value];
	return (typeof newV === "undefined") ? value : newV;
}

var defaultValueFilter = function (v) { return v || v === 0 || v === "" || v === false; };

//find the value that the `filter` will return true; if unfound, return `undefined`
var findWithFilter = function (filter, v /* , v2, ... */) {
	if (!filter) filter = defaultValueFilter;

	if (filter(v)) return v;

	var i, imax = arguments.length;
	for (i = 2; i < imax; i++) {
		v = arguments[i];
		if (filter(v)) return v;
	}
}

// module

module.exports = {

	getPropertyDescriptor: getPropertyDescriptor,
	enclosePropertyDescriptor: enclosePropertyDescriptor,

	findWithFilter: findWithFilter,
	//defaultValueFilter: defaultValueFilter,

	mapValue: mapValue,

};

},{}],37:[function(require,module,exports){

// tmkt @ npm, time kit.

//Milliseconds of one day, 24*60*60*1000= 86400000
var DAY_MILLISECONDS = 86400000;

//utc to local
var utcToLocal = function (dt) {
	return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);		//1 minute= 60000 milliseconds
}

//local to utc
var localToUtc = function (dt) {
	return new Date(dt.getTime() + dt.getTimezoneOffset() * 60000);		//1 minute= 60000 milliseconds
}

//get utc now
var utcNow = function () { return localToUtc(new Date()); }

//Date to "YYYY-MM-DD hh:mm:ss"
var toString19 = function (dt, toUtc) {
	if (!dt) dt = new Date();

	var s = toUtc ?
		(dt.getUTCFullYear() + "-" + (dt.getUTCMonth() + 1) + "-" + dt.getUTCDate() + " " + dt.getUTCHours() + ":" + dt.getUTCMinutes() + ":" + dt.getUTCSeconds())
		:
		(dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds());

	return s.replace(/\b(\d)\b/g, "0$1");
}

//Date to "yyyymmddHHMMSS"
var toString14 = function (dt, toUtc) { return toString19(dt, toUtc).replace(/\D/g, ""); }

//Date to "MM-DD hh:mm:ss"
var toMdhms14 = function (dt, toUtc) { return toString19(dt, toUtc).slice(-14); }

//Date to "YYYY-MM-DD hh:mm:ss.fff"
var toString23 = function (dt, toUtc) {
	if (!dt) dt = new Date();
	return toString19(dt) + "." + ("00" + (toUtc ? dt.getUTCMilliseconds() : dt.getMilliseconds())).slice(-3);
}

//"yyyymmddHHMMSS" to Date
var fromString14 = function (s, fromUtc) {
	var dt = new Date(
		parseInt(s.substring(0, 4), 10),
		s.substring(4, 6) - 1,
		s.substring(6, 8),
		s.substring(8, 10),
		s.substring(10, 12),
		s.substring(12, 14)
	);

	return fromUtc ? utcToLocal(dt) : dt;
}

//"yyyymmdd" to Date
var fromYmd8 = function (s) {
	return new Date(
		parseInt(s.substring(0, 4), 10),
		s.substring(4, 6) - 1,
		s.substring(6, 8),
		0, 0, 0
	);
}

//"YYYY-MM-DD hh:mm:ss" to Date
var fromString19 = function (s, fromUtc) {
	var sa = s.split(/\D/);
	var dt = new Date(parseInt(sa[0], 10), sa[1] - 1, sa[2], sa[3], sa[4], sa[5]);
	return fromUtc ? utcToLocal(dt) : dt;
}

//"YYYY-MM-DD hh:mm:ss.fff" to Date
var fromString23 = function (s, fromUtc) {
	var sa = s.split(/\D/);
	var dt = new Date(parseInt(sa[0], 10), sa[1] - 1, sa[2], sa[3], sa[4], sa[5], parseInt(sa[6], 10));
	return fromUtc ? utcToLocal(dt) : dt;
}

//"YYYY-MM-DD" to Date
var fromYmd10 = function (s) {
	var sa = s.split(/\D/);
	return new Date(parseInt(sa[0], 10), sa[1] - 1, sa[2], 0, 0, 0);
}

//Date to "hh:mm:ss"
var toHms8 = function (dt, toUtc) {
	if (!dt) dt = new Date();
	var s = toUtc ?
		(dt.getUTCHours() + ":" + dt.getUTCMinutes() + ":" + dt.getUTCSeconds())
		:
		(dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds());

	return s.replace(/\b(\d)\b/g, "0$1");
}

//Date to "hh:mm"
var toHm5 = function (dt, toUtc) { return toHms8(dt, toUtc).slice(0, 5); }

//Date to "YYYY-MM-DD"
var toYmd10 = function (dt, toUtc) {
	if (!dt) dt = new Date();
	var s = toUtc ?
		(dt.getUTCFullYear() + "-" + (dt.getUTCMonth() + 1) + "-" + dt.getUTCDate())
		:
		(dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate());

	return s.replace(/\b(\d)\b/g, "0$1");
}

//Date to "YYYYMMDD"
var toYmd8 = function (dt, toUtc) { return toYmd10(dt, toUtc).replace(/\D/g, ""); }

//Date to "YYMMDD"
var toYmd6 = function (dt, toUtc) { return toYmd8(dt, toUtc).slice(-6); }

//get month start Date: YYYY-MM-01 00:00:00
var monthStart = function (dt) { return new Date(dt.getFullYear(), dt.getMonth(), 1, 0, 0, 0); }

//get month end Date: YYYY-MM-31/30/28/29 23:59:59.999
var monthEnd = function (dt) { return new Date(dt.getFullYear(), dt.getMonth() + 1, 1, 0, 0, 0, -1); }

//get previous month start Date: YYYY-MM-01 00:00:00
var previousMonthStart = function (dt) { return new Date(dt.getFullYear(), dt.getMonth() - 1, 1, 0, 0, 0); }

//get previous month end Date: YYYY-MM-31/30/28/29 23:59:59.999
var previousMonthEnd = function (dt) { return new Date(dt.getFullYear(), dt.getMonth(), 1, 0, 0, 0, -1); }

//get next month start Date: YYYY-MM-01 00:00:00
var nextMonthStart = function (dt) { return new Date(dt.getFullYear(), dt.getMonth() + 1, 1, 0, 0, 0); }

//get next month end Date: YYYY-MM-31/30/28/29 23:59:59.999
var nextMonthEnd = function (dt) { return new Date(dt.getFullYear(), dt.getMonth() + 2, 1, 0, 0, 0, -1); }

//get month day number
var monthDayNumber = function (dt) {
	return (nextMonthStart(dt) - monthStart(dt)) / DAY_MILLISECONDS;
}

//Date diff string "*d *h *m *s", or "[*d ][*h ][*m ]*s" for `shorten`
var diffDhms = function (startTime, endTime, shorten, charset) {
	var n = endTime - startTime;		//milliseconds

	var sign = (n < 0) ? "-" : "";
	if (sign) n = -n;

	//var milliseconds= n%1000;
	n = Math.round(n / 1000);	//seconds
	var seconds = n % 60;
	n = Math.round(n / 60);	//minutes
	var minutes = n % 60;
	n = (n - minutes) / 60;	//hours
	var hours = n % 24;
	n = (n - hours) / 24;	//days
	var days = n;

	//charset
	var s;
	if (charset) {
		if (charset.match(/^(gb|ch|zh|936|chinese)$/i)) {
			s = sign + days + '天' + hours + '时' + minutes + '分' + seconds + "秒";
		}
	}

	if (!s) s = sign + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's';

	//shorten
	return shorten ? s.replace(/(\d+)(\D+)(?!$)/g, function (m, p1) { return (p1 === "0") ? "" : m; }) : s;
}

//Date diff string "*d *h *m", or "[*d] [*h] *m" for `shorten`
var diffDhm = function (startTime, endTime, shorten, charset) {
	var s = diffDhms(startTime, endTime, false, charset).replace(/\s*\d+(\D+)?$/, "");	//remove the last number

	//shorten
	return shorten ? s.replace(/(\d+)(\D+)(?!$)/g, function (m, p1) { return (p1 === "0") ? "" : m; }) : s;
}

module.exports = {
	DAY_MILLISECONDS: DAY_MILLISECONDS,

	utcToLocal: utcToLocal,
	localToUtc: localToUtc,
	utcNow: utcNow,

	toString19: toString19,
	toString14: toString14,
	toMdhms14: toMdhms14,
	toString23: toString23,

	fromString14: fromString14,
	fromYmd8: fromYmd8,
	fromString19: fromString19,
	fromYmd10: fromYmd10,
	fromString23: fromString23,

	toHms8: toHms8,
	toHm5: toHm5,

	toYmd10: toYmd10,
	toYmd8: toYmd8,
	toYmd6: toYmd6,

	monthStart: monthStart,
	monthEnd: monthEnd,
	previousMonthStart: previousMonthStart,
	previousMonthEnd: previousMonthEnd,
	nextMonthStart: nextMonthStart,
	nextMonthEnd: nextMonthEnd,

	monthDayNumber: monthDayNumber,

	diffDhms: diffDhms,
	diffDhm: diffDhm,

};


},{}],38:[function(require,module,exports){

// to-px-by-offset @ npm, transfer css property to px unit, by comparing offset-x property.

function toPxByOffset(el, styleName, offsetName) {
	if (typeof el === "string") el = document.getElementById(el);

	var s = "" + el.style[styleName];
	if (s.match(/^(\d+)px$/)) return parseInt(s);

	var n = el[offsetName];
	el.style[styleName] = n + "px";
	n -= (el[offsetName] - n);
	el.style[styleName] = n + "px";
	return n;
}

function toPxByParentOffset(el, styleName, parentOffsetName, offsetName1, offsetName2) {
	if (typeof el === "string") el = document.getElementById(el);

	var s = "" + el.style[styleName];
	if (s.match(/^(\d+)px$/)) return parseInt(s);

	var n = el.offsetParent[parentOffsetName] - el[offsetName1] - el[offsetName2];
	el.style[styleName] = n + "px";
	n -= (el.offsetParent[parentOffsetName] - el[offsetName1] - el[offsetName2] - n);
	el.style[styleName] = n + "px";
	return n;
}

// module

module.exports = {
	toPxByOffset: toPxByOffset,
	toPxByParentOffset: toPxByParentOffset,

	width: function (el) { return toPxByOffset(el, "width", "offsetWidth"); },
	left: function (el) { return toPxByOffset(el, "left", "offsetLeft"); },
	height: function (el) { return toPxByOffset(el, "height", "offsetHeight"); },
	top: function (el) { return toPxByOffset(el, "top", "offsetTop"); },
	right: function (el) { return toPxByParentOffset(el, "right", "offsetWidth", "offsetLeft", "offsetWidth"); },
	bottom: function (el) { return toPxByParentOffset(el, "bottom", "offsetHeight", "offsetTop", "offsetHeight"); },
}

},{}],"_package_json":[function(require,module,exports){
module.exports={
  "name": "tpsvr",
  "version": "1.0.0",
  "description": "test page server",
  "main": "server/tpsvr-main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "test",
    "http",
    "server"
  ],
  "author": "fwg",
  "license": "ISC",
  "bin": {
    "tpsvr": "bin/cmd.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/adf0001/tpsvr.git"
  },
  "bugs": {
    "url": "https://github.com/adf0001/tpsvr/issues"
  },
  "homepage": "https://github.com/adf0001/tpsvr#readme",
  "dependencies": {
    "argv-config": "^1.0.2",
    "browser-http-request": "^1.0.5",
    "browserify-stringify-minimize-css-content": "^1.0.1",
    "bundle-collapser": "^1.4.0",
    "callq": "^1.0.7",
    "delay-set-timeout": "^1.0.1",
    "easy-http-server": "^1.0.1",
    "htm-tool": "^1.0.14",
    "htm-tool-ui": "^1.0.9",
    "http-request-text": "^1.0.5",
    "multiple-spawn": "^1.0.14",
    "response-long-poll-state": "^1.0.4",
    "response-tool": "^1.0.4",
    "stringify": "^5.2.0",
    "supervisor": "^0.12.0",
    "terser": "^5.10.0",
    "to-px-by-offset": "^1.0.1",
    "version-value-set": "^1.0.1",
    "watchify": "^4.0.0"
  },
  "directories": {
    "lib": "lib"
  },
  "devDependencies": {}
}

},{}],"htm-tool":[function(require,module,exports){

// htm-tool @ npm, htm tool set.

var ele = require("element-tool");
var element_offset = require("element-offset");
var tmkt = require("tmkt");
var path_tool = require("path-tool");
var add_css_text = require("add-css-text");
var dom_document_tool = require("dom-document-tool");
var query_by_name_path = require("query-by-name-path");
var create_assign = require("create-assign");
var format_error_tool = require("format-error-tool");
var browser_http_request = require("browser-http-request");
var htm_tool_css = require("htm-tool-css");
var bind_ui = require("bind-ui");
var htm_tool_ui = require("htm-tool-ui");
var bind_element = require("bind-element");

// global variable name
var globalVarName = "htm-tool@npm";

//////////////////////////////////////////////////////////////////////////////////////////
// export module

module.exports = Object.assign(
	function () { return ele.apply(this, arguments); },
	{
		//global var
		globalVarName: globalVarName,

		//ele
		ele: ele,

		eleFromId: ele.fromId,
		eleId: ele.id,

		eleOffset: element_offset,

		//tmkt
		tmkt: tmkt,
		dateString19: tmkt.toString19,
		dateString14: tmkt.toString14,
		dateDiffDhm: tmkt.diffDhm,

		//path
		dirPart: path_tool.dirPart,
		normalizePath: path_tool.normalize,

		//css tool
		addCssText: add_css_text,

		//dom document tool
		appendHtml: dom_document_tool.appendHtml,
		appendBodyHtml: dom_document_tool.appendBodyHtml,
		prependHtml: dom_document_tool.prependHtml,
		querySelectorByAttr: dom_document_tool.querySelectorByAttr,
		getSearchPart: dom_document_tool.getSearchPart,
		dispatchEventByName: dom_document_tool.dispatchEventByName,
		observeSingleMutation: dom_document_tool.observeSingleMutation,

		//query by name path
		queryByNamePath: query_by_name_path,

		//derive object
		derive: create_assign,
		deriveObject: create_assign,

		//error
		formatError: format_error_tool,
		Error: format_error_tool,

		//getPropertyDescriptor: getPropertyDescriptor,
		//enclosePropertyDescriptor: enclosePropertyDescriptor,
		//findWithFilter: findWithFilter,
		//defaultValueFilter: defaultValueFilter,
		//mapValue: mapValue,

		//xhr
		httpRequest: browser_http_request.requestText,
		httpRequestJson: browser_http_request.requestJson,

		//bind-ui
		bindUi: bind_ui,

		//bind-element
		bindElement: bind_element,
		bindElementArray: bind_element.array,

		//htm-tool css
		setSelected: htm_tool_css.setSelected,

		//------------------------------
		//htm-tool ui
		ui: htm_tool_ui,

		//log
		showLog: htm_tool_ui.show_log,
		show_log: htm_tool_ui.show_log,

		//drag
		drag: htm_tool_ui.drag,

		//popup
		popup: htm_tool_ui.popup,

		showPopupHtml: htm_tool_ui.showPopupHtml,

		alert: htm_tool_ui.alert,
		confirm: htm_tool_ui.confirm,
		confirmYnc: htm_tool_ui.confirmYnc,
		prompt: htm_tool_ui.prompt,
		selectRadioList: htm_tool_ui.selectRadioList,
		selectCheckboxList: htm_tool_ui.selectCheckboxList,
		selectButtonList: htm_tool_ui.selectButtonList,

	}
);

//dom global variable
if (typeof window !== "undefined" && window) { window[globalVarName] = module.exports; }

},{"add-css-text":3,"bind-element":5,"bind-ui":6,"browser-http-request":7,"create-assign":9,"dom-document-tool":10,"element-offset":12,"element-tool":13,"format-error-tool":14,"htm-tool-css":15,"htm-tool-ui":17,"path-tool":34,"query-by-name-path":35,"tmkt":37}],"main-view":[function(require,module,exports){

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
			function (err, data) {
				if (!data) return;

				if (data === "createTestData") _this.createTestData();
				else if (data === "createTestHtm") _this.createTestHtm();
				else if (data === "createBundleTool") _this.createBundleTool();
				else if (data === "tryMinimizeBundle") _this.tryMinimizeBundle();
				else if (data === "createMiniBundleTool") _this.createMiniBundleTool();
			}
		)

		console.log(el);
		ht.queryByNamePath(el,"input").style.height="15em";
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

},{"./main-view.css":1,"./main-view.htm":2,"htm-tool":"htm-tool","to-px-by-offset":38}]},{},[]);
