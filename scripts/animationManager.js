"use strict";
var AnimationManager = function(spriteSheet) {
	this._animationList = [];
	this._animationMap = {};
	Utils.generateStylesheet("spriteSheet_template", {spriteSheet:spriteSheet})
};

AnimationManager.playingClass = "playing";

AnimationManager.prototype.registerAnimation = function(name, selector, startCoords, frames, duration, size, styles) {
	this._animationList.push(name);
	this._animationMap[name] = new AnimationManager.Animation(
		this, name, selector, startCoords, frames, duration, size, styles,
		"[AnimationManager.prototype.registerAnimation] ",
		"Full Syntax: registerAnimation(name, selector, startCoords, frames, duration, size, styles)"
	);
	return this._animationMap[name];
};

AnimationManager.prototype.playAnimation = function(name) {
	this._animationMap[name].playOnce();
};

AnimationManager.prototype.loopAnimation = function(name, loopDuration) {
	if (name)
		this._animationMap[name].loop(loopDuration);
};

AnimationManager.Animation = function(manager, name, selector, startCoords, frames, duration, size, styles, errorPrefix, errorSuffix) {

	this.manager = manager;
	this.name = name;
	this.selector = selector;
	this.$element = $(this.selector);
	this.startCoords = startCoords;
	this.frames = frames;
	this.duration = duration;
	this.size = size;

	errorPrefix = errorPrefix || "[AnimationManager.Animation] ";
	errorSuffix = " | " +
		(errorSuffix || "Full Syntax: new AnimationManager.Animation(name, selector, startCoords, frames, duration, size, styles)");
	if (!this.manager) throw errorPrefix + "Missing an instance of AnimationManager" + errorSuffix;
	if (!this.name) throw errorPrefix + "Missing a valid name string" + errorSuffix;
	if (this.$element.length === 0) throw errorPrefix + "Element not found: " + selector + errorSuffix;
	if (this.$element.length > 1) throw errorPrefix + "Too many element matches (requires 1): " + selector + errorSuffix;
	if (!/^\d+\s*,\s*\d+$/.test(this.startCoords)) throw errorPrefix + 'Invalid start location. Syntax: "StartX,StartY" (relative to top-left of sprite sheet' + errorSuffix;
	if (!this.frames || this.frames < 0) throw errorPrefix + "Invalid frame amount: " + this.frames + errorSuffix;
	if (typeof this.duration != "number") throw errorPrefix + "Invalid duration: " + this.duration + ". Must be a number (milliseconds)" + errorSuffix;
	if (!/^\d+\s*,\s*\d+$/.test(this.size)) throw errorPrefix + 'Invalid frame size. Syntax: "Width,Height" (must be positive)' + errorSuffix;

	var startCoordsSplit = this.startCoords.trim().split(/\s*,\s*/);
	var sizeSplit = this.size.trim().split(/\s*,\s*/);
	this.startCoords = {x: +startCoordsSplit[0], y: +startCoordsSplit[1]};
	this.size = {w: +sizeSplit[0], h: +sizeSplit[1]};

	this.$element.addClass("animated").css(styles || {});
	Utils.generateStylesheet("animated_element_template", {
		selector: this.selector,
		width: this.size.w,
		height: this.size.h,
		start: -this.startCoords.x+"px "+-this.startCoords.y+"px",
		frames: this.frames,
		animationName: this.name+"Animation",
		durationString: duration/1000+"s",
		end: (-this.frames*this.size.w)+"px "+-this.startCoords.y+"px",
		playingClass: AnimationManager.playingClass
	});

	this._timeouts = {};
	this._status = "stopped";
};

AnimationManager.Animation.prototype.isStopped = function() { return this._status === "stopped"; };
AnimationManager.Animation.prototype.isPlaying = function() { return this._status === "playing"; };
AnimationManager.Animation.prototype.isLooping = function() { return this._status.indexOf("looping") > -1; };
AnimationManager.Animation.prototype.isInfLooping = function() { return this._status === "infinite looping"; };

AnimationManager.Animation.prototype._play = function(dur) {
	var dis = this;
	var duration;
	if (dur) {
		duration = dur;
		this._status = "looping";
	}
	else duration = this.duration;

	if (this._status === "stopped") {
		dis.$element.addClass(AnimationManager.playingClass);
		if (dur === -1) { this._status = "infinite looping"; }
		else {
			this._status = "playing";
			this._timeouts.play = setTimeout(dis.stop, duration);
		}
	}
};

AnimationManager.Animation.prototype.playOnce = function() { this._play(); };
AnimationManager.Animation.prototype.loop = function(dur) { this._play(dur || -1); };

AnimationManager.Animation.prototype.stop = function() {
	if (this._status != "stopped") {
		this.$element.removeClass(AnimationManager.playingClass);
		clearTimeout(this._timeouts.play);
		this._status = "stopped";
	}
};