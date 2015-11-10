"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = (function () {
	function Game() {
		_classCallCheck(this, Game);

		this.display = new Display(30);

		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);
	}

	_createClass(Game, [{
		key: "startRound",
		value: function startRound(diff) {
			var options = this.difficultyData[diff].options;
			this.registry.generateTiles(diff);
		}
	}]);

	return Game;
})();

var Display = (function () {
	// TODO this needs work

	function Display(barSegmentCount) {
		_classCallCheck(this, Display);

		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.fader = new DisplayFader(this);

		this.initBar();
	}

	_createClass(Display, [{
		key: "initBar",
		value: function initBar() {
			this.barArea = $("#barArea").get(0);
			$(this.barArea).find(".barSegment").remove();
			for (var i = 0; i < this.barSegmentCount; i++) {
				$(this.barArea).append($("<div>").addClass("barSegment"));
			}
		}
	}, {
		key: "startCountdown",
		value: function startCountdown(seconds) {
			this.fader.fade(seconds);
		}
	}]);

	return Display;
})();

var DisplayFader = (function () {
	function DisplayFader(display) {
		_classCallCheck(this, DisplayFader);

		this._display = display;
	}

	_createClass(DisplayFader, [{
		key: "fade",
		value: function fade(seconds, loop) {
			if (!loop) this.stop();
			var speed = seconds / this._display.barSegmentCount;
			var fader = this;
			$(this._display.barArea).find(".barSegment:last-child").fadeOut(speed * 1000, function () {
				$(this).remove();
				fader.fade(seconds, true);
			});
		}
	}, {
		key: "stop",
		value: function stop() {
			$(this._display.barArea).find(".barSegment").stop();
			this._display.initBar();
		}
	}]);

	return DisplayFader;
})();

//# sourceMappingURL=game.js.map