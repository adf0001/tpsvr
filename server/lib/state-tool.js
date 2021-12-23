
var path = require("path");

var multiple_spawn = require("multiple-spawn");
var response_long_poll_state = require("response-long-poll-state");
var verion_value_set = require("version-value-set");
var delay_set_timeout = require("delay-set-timeout");

var config = require("../tpsvr-config.js");

var project_data = require("./project-data.js");

//state data

var tmidLongPoll = null;

var versionState = new verion_value_set.class(
	//versionState update callback
	function () {
		tmidLongPoll = delay_set_timeout(
			[response_long_poll_state.defaultEventEmitter, "state-change"],
			config.long_poll_state_delay,
			tmidLongPoll,
			config.long_poll_state_delay + 3000
		);
	}
);

// long poll

var lastLongPollState = { version: {} };

/*
function refreshLongPoll() {
	if (lastLongPollState) lastLongPollState.data = null;
	response_long_poll_state.defaultEventEmitter.emit("state-change");
}
*/

function getLongPollState() {
	if (lastLongPollState.data) return lastLongPollState;

	//get new versioned state
	var newState = versionState.getDiff(lastLongPollState.version);

	//save as last
	Object.assign(lastLongPollState.version, newState.version);	//save as different object
	lastLongPollState.data = newState.data;

	return lastLongPollState;
}

//state: sys
var updateSys = function () {
	if (lastLongPollState) lastLongPollState.data = null;

	versionState.update("sys", {
		dirname: path.normalize(__dirname + "/.."),
		server_file_exec: config.extension_server_file_exec,
	});
}
updateSys();

//state: bundle
var updateFromMultipleSpawn = function (groupName) {
	if (lastLongPollState) lastLongPollState.data = null;

	var item = multiple_spawn.spawnItem(groupName);

	var state = {};
	for (var i in item) {
		if (item[i]) state[i] = 1;
	}
	versionState.update(groupName, state);
}

var updateBundle = function () { updateFromMultipleSpawn("bundle"); }
updateBundle();

//state: projects
var updateProjects = function () {
	if (lastLongPollState) lastLongPollState.data = null;

	var state = {};
	for (var i in project_data.data) {
		state[i] = 1;
	}
	versionState.update("projects", state);
}
//updateProjects();		//empty when start, don't update

// module

module.exports = {
	versionState: versionState,

	//refreshLongPoll: refreshLongPoll,
	getLongPollState: getLongPollState,

	updateSys: updateSys,
	updateBundle: updateBundle,
	updateProjects: updateProjects,
};
