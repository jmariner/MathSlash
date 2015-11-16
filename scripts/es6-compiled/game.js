"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = (function () {
	function Game() {
		var _this = this;

		_classCallCheck(this, Game);

		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.display = new Display(this.registry, 30, { fill: "black", stroke: "white" });

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);

		this.playing = false;

		this.display.fader.onEnd = function () {
			_this.nextLevel();
		};
	}

	_createClass(Game, [{
		key: "startRound",
		value: function startRound(diff) {
			var options = this.difficultyData[diff].options;
			this.current = { diff: diff, options: options };
			this.nextLevel();
			this.playing = true;
		}
	}, {
		key: "nextLevel",
		value: function nextLevel() {
			if (this.playing) {
				this.registry.generateTiles(this.current.diff);
				this.display.startCountdown(this.current.options.timeLimit);
			}
		}
	}, {
		key: "chooseRow",
		value: function chooseRow(rowNumber) {

			var rowName = "row" + rowNumber;

			this.display.blinkArrow("lightgray", rowNumber);

			if (this.playing) {
				if (this.registry.isMaxGroup(rowName)) {
					this.display.blinkRow("green", rowNumber);
					this.nextLevel();
				} else {
					this.display.blinkRow("red", rowNumber);
				}
			}
		}
	}]);

	return Game;
})();

var Display = (function () {
	function Display(registry, barSegmentCount, arrowColors) {
		_classCallCheck(this, Display);

		this.registry = registry;
		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.fader = new DisplayFader(this);

		this.arrowColors = arrowColors;

		this.init();
	}

	_createClass(Display, [{
		key: "init",
		value: function init() {
			this.fader.stop();
			this.initBar();
			this.initHighlights();
			this.initArrows();
		}
	}, {
		key: "initBar",
		value: function initBar() {
			this.barArea = $("#barArea").get(0);
			$(this.barArea).find(".barSegment").remove();
			var eachWidth = $(this.barArea).width() / this.barSegmentCount;
			for (var i = 0; i < this.barSegmentCount; i++) {
				$(this.barArea).append($("<div>").addClass("barSegment").width(eachWidth));
			}
		}
	}, {
		key: "initHighlights",
		value: function initHighlights() {
			Utils.forEachIn(function (k, group) {
				$(group.parentSelector).removeClass("selected").append($("<div>").addClass("highlighter"));
			}, this.registry.groups);
		}
	}, {
		key: "initArrows",
		value: function initArrows() {
			var _this2 = this;

			var rowHeight = $(".arrow").parent().height();
			$.get("images/arrow.svg", function (data) {
				$(".arrow").html($(data).children()).width(rowHeight).find("polyline").attr("fill", _this2.arrowColors.fill).attr("stroke", _this2.arrowColors.stroke);
			});
		}
	}, {
		key: "blinkArrow",
		value: function blinkArrow(color) {
			var _this3 = this;

			for (var _len = arguments.length, rowNumbers = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				rowNumbers[_key - 1] = arguments[_key];
			}

			rowNumbers.forEach(function (rowNumber) {
				$(_this3.registry.getGroupEl("row" + rowNumber)).find(".arrow").find("polyline").animate({ svgFill: color }, { duration: 250, queue: true }).animate({ svgFill: _this3.arrowColors.fill }, { duration: 250, queue: true });
			});
		}
	}, {
		key: "blinkRow",
		value: function blinkRow(color) {
			var _this4 = this;

			for (var _len2 = arguments.length, rowNumbers = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
				rowNumbers[_key2 - 1] = arguments[_key2];
			}

			rowNumbers.forEach(function (rowNumber) {
				$(_this4.registry.getGroupEl("row" + rowNumber)).find(".highlighter").animate({ borderColor: color }, { duration: 250, queue: true }).animate({ borderColor: "transparent" }, { duration: 250, queue: true });
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
		this.current = {};
		this.$barArea = $("#barArea");
		this.onEnd = function () {};
	}

	_createClass(DisplayFader, [{
		key: "fade",
		value: function fade(seconds, loop) {
			if (!loop) {
				this.stop();
				this.current.time = seconds;
			}

			var speed = seconds / this._display.barSegmentCount;
			this.current.total = seconds;
			this.current.speed = speed;

			var fader = this;

			var $segments = this.$barArea.find(".barSegment");

			if ($segments.length === 0) {
				this.onEnd();
			} else {
				$segments.last().fadeOut(speed * 1000, function () {
					$(this).remove();
					fader.current.time -= speed;
					fader.fade(seconds, true);
				});
			}
		}
	}, {
		key: "addTime",
		value: function addTime(seconds) {
			if (this.current.time + seconds < this.current.total) {
				this.current.time += seconds;
				var barsToAdd = seconds * this.current.speed;
				this.$barArea.append(new Array(barsToAdd + 1).join($("<div>").addClass("barSegment").get(0).outerHTML));
			}
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