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
	function Display(barSegmentCount) {
		_classCallCheck(this, Display);

		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.barFadeInterval = undefined;

		//this.initBar();
	}

	_createClass(Display, [{
		key: "initBar",
		value: function initBar() {
			for (this.barArea = $("#barArea").get(0); $(this.barArea).append($("<div>").addClass("barSegment")).find(".barSegment").length < this.barSegmentCount;) {}
		}
	}, {
		key: "startCountdown",
		value: function startCountdown(seconds) {
			var _this = this;

			var fadeSpeed = seconds / this.barSegmentCount;

			var fadeNext;
			(fadeNext = function () {
				$(_this.barArea).find(".barSegment:last-child").fadeOut(fadeSpeed * 1000, function () {
					$(this).remove();
					fadeNext();
				});
			})();
		}
	}]);

	return Display;
})();

//# sourceMappingURL=game.js.map