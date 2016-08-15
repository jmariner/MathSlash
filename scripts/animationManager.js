"use strict";

//											====================== Animation Manager ======================
var AnimationManager = function(spriteSheet) {
	// spriteSheet is from images/
	this._characterList = [];
	this.characters = {};
	Utils.generateStylesheet("spriteSheet_template", {spriteSheet:spriteSheet})
};

AnimationManager.playingClass = "playing";

AnimationManager.prototype.registerCharacter = function(name, options) {
	if (name && options) {
		this._characterList.push(name);
		this.characters[name] = new AnimationManager.Character(this,
			name, options.selector, options.startY, options.size, options.position, options.styles, options.skins);
		return this.characters[name];
	}
};

//											====================== Character ======================
AnimationManager.Character = function(manager, name, selector, startY, size, position, styles, skins) {

	this.manager = manager;
	this.name = name;
	this.selector = selector;
	this.$element = $(this.selector);
	this.initialStartY = startY;
	this.startY = startY;
	this.size = size;
	this.position = position || {};
	this.styles = styles || {};
	this.skins = skins;

	if (this.$element.length === 0) throw "Element not found: " + selector;
	if (this.$element.length > 1) throw "Too many element matches (requires 1): " + selector;
	if (typeof this.startY !== "number") throw 'Invalid start Y-value. Must be distance from top of sprite sheet.';
	if (!/^\d+\s*[,|x]\s*\d+$/.test(this.size)) throw 'Invalid size. Syntax: "Width,Height" (must be positive)';

	var sizeSplit = this.size.trim().split(/\s*[,|x]\s*/);
	this.size = {w: +sizeSplit[0], h: +sizeSplit[1]};

	this.$element.addClass("animated").css(styles);
	this.generateStyles();

	this._animationList = [];
	this.animations = {};
	this._currentAnimation = undefined;
};

AnimationManager.Character.prototype.generateStyles = function() {
	Utils.generateStylesheet("animated_element_template", {
		selector: this.selector,
		width: this.size.w,
		height: this.size.h,
		top: this.position.top,
		left: this.position.left,
		bottom: this.position.bottom,
		right: this.position.right,
		backgroundPosition: "0px " + -this.startY+"px"
	}, this.name);
};

AnimationManager.Character.prototype.randomizeSkin = function() {
	var randomSkin = Randomizer.rand(1, this.skins);
	var anims = Object.keys(this.animations).length;
	this.startY = this.initialStartY + (randomSkin-1)*anims*this.size.h;
	this.generateStyles();
	Object.keys(this.animations).forEach(a => this.animations[a]._generateStyles());
};

AnimationManager.Character.prototype.setStyles = function(styles) {
    if (styles) {
        this.$element.css(styles);
    }
};

AnimationManager.Character.prototype.registerAnimation = function(name, options) {
	this._animationList.push(name);
	this.animations[name] = new AnimationManager.Animation(this,
		name, options.index, options.frames, options.duration);
	return this;
};

AnimationManager.Character.prototype.fadeOut = function(dur, after) {
	this.$element.fadeOut(dur, after);
};

AnimationManager.Character.prototype.fadeIn = function(dur, after) {
	this.$element.fadeIn(dur !== undefined ? dur : 0, after);
};

AnimationManager.Character.prototype.playAnimation = function(name, after) {
	var anim = this.animations[name];
	if (anim)
		anim.playOnce(after);
	else
		throw "Animation \"" + name + "\" not found!";

};

AnimationManager.Character.prototype.playThenFreeze = function(name, after) {
	var anim = this.animations[name];
	if (anim)
		anim.playThenFreeze(after);
	else
		throw "Animation \"" + name + "\" not found!";
};

AnimationManager.Character.prototype.loopAnimation = function(name, loopDuration) {
	var anim = this.animations[name]
	if (anim && !anim.isLooping())
		anim.loop(loopDuration);
};

AnimationManager.Character.prototype.toggleLoopAnimation = function(name) {
	if (name) {
		var anim = this.animations[name];
		if (anim.isStopped()) anim.loop();
		else if (anim.isLooping()) anim.stop();
	}
};

AnimationManager.Character.prototype.stopAnimation = function() {
	if (this._currentAnimation) {
		this._currentAnimation.stop();
	}
};

AnimationManager.Character.prototype.freezeAtLast = function(name) {
	this.animations[name].freezeAtLast();
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

    this._generateStyles();

	this._timeouts = {};
	this._status = "stop";
};



AnimationManager.Animation.prototype._generateStyles = function() {
	this.startY = this.character.startY + this.character.size.h * this.index;
	Utils.generateStylesheet("element_animation_template", {
        selector: this.character.selector,
        start: "0px " + -this.startY+"px",
        end: (-this.frames*this.character.size.w)+"px " + -this.startY+"px",
        frames: this.frames,
        animationName: this.name,
        characterName: this.character.name,
        durationString: this.duration/1000+"s",
        playingClass: AnimationManager.playingClass
    }, this.character.name + "-" + this.name);
};

AnimationManager.Animation.prototype.isStopped = function() { return this._status === "stop"; };
AnimationManager.Animation.prototype.isPlaying = function() { return this._status === "play"; };
AnimationManager.Animation.prototype.isLooping = function() { return this._status.indexOf("loop") > -1; };

AnimationManager.Animation.prototype._play = function(dur, returnToPrev, after) {
	var dis = this;
    this.currentDuration = dur || this.duration;

	if (returnToPrev) var prev = this.character._currentAnimation;
	this.character.stopAnimation();
	this.character.$element.css("background-position", "");

	this.character.$element
		.addClass(this.name)
		.addClass(AnimationManager.playingClass);
	this.character._currentAnimation = this;
	if (this.currentDuration === -1 || this.currentDuration > this.duration) this._status = "loop";
	else {
		this._status = "play";
		this._timeouts.play = setTimeout(function(){
			dis.stop.call(dis);
			if (prev) prev.loop();
			if (typeof after === "function") after();
		}, this.currentDuration);
	}
};

AnimationManager.Animation.prototype.playThenFreeze = function(after) {
	this._play(0, false, after);
	this.freezeAtLast();
};

AnimationManager.Animation.prototype.freezeFrame = function(frameNum) {
	var x = (frameNum-1) * this.character.size.w;
	this.character.$element.css("background-position", `${-x}px ${-this.startY}px`);
};

AnimationManager.Animation.prototype.freezeAtLast = function() {
	this.freezeFrame(this.frames);
};

// TODO PAUSE FUNCTION
AnimationManager.Animation.prototype.pause = function() {
  if (this.status !== "stop") {
      // need to hook into animation events to find current frame and save it
  }
};

AnimationManager.Animation.prototype.playAndReturn = function() { this._play(0, true)};

AnimationManager.Animation.prototype.playOnce = function(after) {
	var cur = this.character._currentAnimation;
	this._play(0, cur && cur.isLooping(), after);
};

AnimationManager.Animation.prototype.loop = function(dur) { this._play(dur || -1); };

AnimationManager.Animation.prototype.stop = function() {
	if (!this.isStopped()) {
		this.character.$element
			.removeClass(this.name)
			.removeClass(AnimationManager.playingClass);
		clearTimeout(this._timeouts.play);
		this._status = "stop";
        this.currentDuration = 0;
		this.character._currentAnimation = undefined;
	}
};

AnimationManager.Animation.prototype.setDuration = function(dur) {
    if (typeof dur != "number" || dur < 0) throw "Invalid duration: " + dur + ". Must be a number (milliseconds)";

    this.duration = dur;
    this._generateStyles();
};