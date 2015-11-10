"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = (function () {
	function Game() {
		_classCallCheck(this, Game);

		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.display = new Display(this.registry, 30);

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);

		this._timeouts = {};
	}

	_createClass(Game, [{
		key: "startRound",
		value: function startRound(diff) {
			var options = this.difficultyData[diff].options;
			this.registry.generateTiles(diff);
			this.display.startCountdown(options.timeLimit);
		}
	}, {
		key: "chooseRow",
		value: function chooseRow(rowNumber) {
			var _this = this;

			clearTimeout(this._timeouts.arrowBlink);

			this.display.deactivateArrow(1, 2, 3);
			this.display.activateArrow(rowNumber);

			this._timeouts.arrowBlink = setTimeout(function () {
				_this.display.deactivateArrow(rowNumber);
			}, 500);

			// TO-DO this is not a good way to do this - more js and less css
			//$(this.registry.groups["row"+rowNumber].parentSelector).addClass("highlight green");
		}
	}]);

	return Game;
})();

var Display = (function () {
	function Display(registry, barSegmentCount) {
		_classCallCheck(this, Display);

		this.registry = registry;
		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.fader = new DisplayFader(this);

		this.init();
	}

	_createClass(Display, [{
		key: "init",
		value: function init() {
			this.initBar();
			this.initHighlights();
			this.initArrows();
		}
	}, {
		key: "initBar",
		value: function initBar() {
			this.barArea = $("#barArea").get(0);
			$(this.barArea).find(".barSegment").remove();
			for (var i = 0; i < this.barSegmentCount; i++) {
				$(this.barArea).append($("<div>").addClass("barSegment"));
			}
		}
	}, {
		key: "initHighlights",
		value: function initHighlights() {
			Utils.forEachIn(function (k, group) {
				$(group.parentSelector).append($("<div>").addClass("highlighter")).on("animationend", function () {
					$(this).removeClass("highlight red green");
				});
			}, this.registry.groups);
		}
	}, {
		key: "initArrows",
		value: function initArrows() {
			var rowHeight = $(".arrow").parent().height();
			$.get("images/arrow.svg", function (data) {
				$(".arrow").html($(data).children()).width(rowHeight);
			});
		}
	}, {
		key: "activateArrow",
		value: function activateArrow() {
			var _this2 = this;

			for (var _len = arguments.length, rowNumbers = Array(_len), _key = 0; _key < _len; _key++) {
				rowNumbers[_key] = arguments[_key];
			}

			// TODO allow for varargs for multiple rows
			rowNumbers.forEach(function (rowNumber) {
				$(_this2.registry.getGroupEl("row" + rowNumber)).find(".arrow").addClass("active");
			});
		}
	}, {
		key: "deactivateArrow",
		value: function deactivateArrow() {
			var _this3 = this;

			for (var _len2 = arguments.length, rowNumbers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				rowNumbers[_key2] = arguments[_key2];
			}

			rowNumbers.forEach(function (rowNumber) {
				$(_this3.registry.getGroupEl("row" + rowNumber)).find(".arrow").removeClass("active");
			});
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