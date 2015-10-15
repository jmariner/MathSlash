"use strict";

//											====================== Animation Manager ======================
var AnimationManager = function(spriteSheet) {
	this._characterList = [];
	this.characters = {};
	Utils.generateStylesheet("spriteSheet_template", {spriteSheet:spriteSheet})
};

AnimationManager.playingClass = "playing";

AnimationManager.prototype.registerCharacter = function(name, options) {
	if (name && options) {
		this._characterList.push(name);
		this.characters[name] = new AnimationManager.Character(this,
			name, options.selector, options.startY, options.size, options.position, options.styles);
		return this.characters[name];
	}
};


//											====================== Character ======================
AnimationManager.Character = function(manager, name, selector, startY, size, position, styles) {

	this.manager = manager;
	this.name = name;
	this.selector = selector;
	this.$element = $(this.selector);
	this.startY = startY;
	this.size = size;
	this.position = position || {};
	this.styles = styles || {};

	if (this.$element.length === 0) throw "Element not found: " + selector;
	if (this.$element.length > 1) throw "Too many element matches (requires 1): " + selector;
	if (typeof this.startY !== "number") throw 'Invalid start Y-value. Must be distance from top of sprite sheet.';
	if (!/^\d+\s*[,|x]\s*\d+$/.test(this.size)) throw 'Invalid size. Syntax: "Width,Height" (must be positive)';

	var sizeSplit = this.size.trim().split(/\s*[,|x]\s*/);
	this.size = {w: +sizeSplit[0], h: +sizeSplit[1]};

	this.$element.addClass("animated").css(styles);
	Utils.generateStylesheet("animated_element_template", {
		selector: this.selector,
		width: this.size.w,
		height: this.size.h,
		top: this.position.top,
		left: this.position.left,
		bottom: this.position.bottom,
		right: this.position.right
	});

	this._animationList = [];
	this.animations = {};
	this._currentAnimation = undefined;
};
// TODO allow parameter object vs a list
AnimationManager.Character.prototype.registerAnimation = function(name, options) {
	this._animationList.push(name);
	this.animations[name] = new AnimationManager.Animation(this,
		name, options.index, options.frames, options.duration);
	return this.animations[name];
};

AnimationManager.Character.prototype.playAnimation = function(name) {
	this.animations[name].playOnce();
};

AnimationManager.Character.prototype.loopAnimation = function(name, loopDuration) {
	if (name)
		this.animations[name].loop(loopDuration);
};

AnimationManager.Character.prototype.stopAnimation = function() {
	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}
};


//											====================== Animation ======================
AnimationManager.Animation = function(character, name, index, frames, duration) {

	this.character = character;
	this.name = name;
	this.index = index;
	this.frames = frames;
	this.duration = duration;

	if (!this.name) throw "Missing a valid name string";
	if (typeof this.index !== "number" || this.index < 0) throw "Invalid index value: " + this.index + ". Must be positive number.";
	if (typeof this.frames !== "number" || this.frames < 0) throw "Invalid frame amount: " + this.index + ". Must be positive number.";
	if (typeof this.duration != "number" || this.duration < 0) throw "Invalid duration: " + this.duration + ". Must be a number (milliseconds)";

	this.startY = this.character.startY + this.character.size.h * this.index;

	Utils.generateStylesheet("element_animation_template", {
		selector: this.character.selector,
		start: "0px " + -this.startY+"px",
		end: (-this.frames*this.character.size.w)+"px " + -this.startY+"px",
		frames: this.frames,
		animationName: this.name,
		characterName: this.character.name,
		durationString: duration/1000+"s",
		playingClass: AnimationManager.playingClass
	}, this.character.name + "-" + this.name);

	this._timeouts = {};
	this._status = "stopped";
};

AnimationManager.Animation.prototype.isStopped = function() { return this._status === "stopped"; };
AnimationManager.Animation.prototype.isPlaying = function() { return this._status === "playing"; };
AnimationManager.Animation.prototype.isLooping = function() { return this._status.indexOf("looping") > -1; };
AnimationManager.Animation.prototype.isInfLooping = function() { return this._status === "infinite looping"; };

AnimationManager.Animation.prototype._play = function(dur, returnToPrev) {
	var dis = this;
	var duration;
	if (dur) {
		duration = dur;
	}
	else duration = this.duration;

	if (returnToPrev) var prev = this.character._currentAnimation;
	this.character.stopAnimation();

	this.character.$element
		.addClass(this.name)
		.addClass(AnimationManager.playingClass);
	this.character._currentAnimation = this;
	if (duration === -1) this._status = "infinite looping";
	else if (duration > this.duration) this._status = "looping";
	else {
		this._status = "playing";
		this._timeouts.play = setTimeout(function(){
			dis.stop.call(dis);
			if (prev) prev.loop(); //TODO this needs improvement
		}, duration);
	}
};

AnimationManager.Animation.prototype.playAndReturn = function() { this._play(0, true)}; // TODO playAndReturn()
AnimationManager.Animation.prototype.playOnce = function() { this._play(); };
AnimationManager.Animation.prototype.loop = function(dur) { this._play(dur || -1); };

AnimationManager.Animation.prototype.stop = function() {
	if (this._status !== "stopped") {
		this.character.$element
			.removeClass(this.name)
			.removeClass(AnimationManager.playingClass);
		clearTimeout(this._timeouts.play);
		this._status = "stopped";
		this.character._currentAnimation = undefined;
	}
};