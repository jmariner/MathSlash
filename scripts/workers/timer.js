/*
	This is a timer that counts down from an initial duration to 0
 */

this.initOptions = {};
this.pause = false;
this.pauseTime = 0;
this.jumpTime = 0;
this.netTimeChange = 0;
this.time = 0;
this.loopTimeout = undefined;

var onmessage = function(e) {
	var action = e.data.action;

	switch (action) {
		case "start":
			start(e.data);
			break;
		case "stop":
			this.pause = true; // not resuming
			clearTimeout(this.loopTimeout);
			this.postMessage("done");
			break;
		case "pause":
		case "freeze":
			onPause();
			break;
		case "resume":
		case "unpause":
		case "continue":
			onContinue();
			break;
		case "jump":
			onJump(e.data["diffString"]);
			break;
	}
};

var onStep = function (time) { this.postMessage({time: time}) };
var after = function () { this.postMessage("done"); };

var start = function(options) {
	var duration = options.duration;
	var step = options.step || 100;
	var fix = options.fixOffset === true;
	this.initOptions = options;

	var actualStart = Date.now();
	this.time = duration;

	var loopStepFix = function() {
		var actual = Date.now() - actualStart - this.netTimeChange; // how long it's actually been
		var theoretical = duration - this.time; // how long we think it's been
		var diff = actual - theoretical; // the difference
		this.loopTimeout = setTimeout(mainTimerLoop, step - diff);
	};

	var loopStepNoFix = function() {
		this.loopTimeout = setTimeout(mainTimerLoop, step);
	};

	var mainTimerLoop = function() {
		if (this.pause === false) {
			this.time -= step;
			if (this.jumpTime) {
				this.time += this.jumpTime;
				this.jumpTime = 0;
			}
			if (this.time < 0) { // send out the "complete" when it gets one step below 0
				if (typeof after === "function") after();
			}
			else {
				onStep(this.time);
				timerLoopStep();
			}
		}
	};

	var timerLoopStep = fix ? loopStepFix : loopStepNoFix;
	mainTimerLoop();
};

var onPause = function() {
	this.pause = true;
	clearTimeout(this.loopTimeout);
	this.pauseTime = this.time;
};

var onContinue = function() {
	if (this.pause) {
		this.pause = false;
		var options = Object.assign({}, this.initOptions);
		options.duration = this.pauseTime;
		start(options);
	}
};

var onJump = function(diffString) {

	// diffString in format +XXXms or XXXms to add, or -XXXms to subtract
	// keep in mind the timer is counting DOWN, so sub = jump forward, add = jump backwards

	var regex = diffString.match(/^(\+|\-)?\s*(\d+)\s*(m|s|ms)?$/);
	var diff = parseInt(regex[1] + regex[2]);

	switch (regex[3]) { // units part
		case "m":
			diff *= 60;
			/* fallthrough */
		case "s":
			diff *= 1000;
	}

	this.jumpTime = diff;
	this.netTimeChange += diff;
};