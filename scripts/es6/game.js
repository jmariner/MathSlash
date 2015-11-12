class Game {
	constructor() {
		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.display = new Display(this.registry, 30);

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);


		this._timeouts = {};

		this.display.fader.onEnd = () => { this.nextLevel(); };
	}

	startRound(diff) {
		var options = this.difficultyData[diff].options;
		this.current = {diff, options};
		this.nextLevel();
 	}

	nextLevel() {
		this.registry.generateTiles(this.current.diff);
		this.display.startCountdown(this.current.options.timeLimit);
	}

	chooseRow(rowNumber) {

		var rowName = "row"+rowNumber;


		this.display.deactivateArrow(1,2,3);
		this.display.activateArrow(rowNumber);

		clearTimeout(this._timeouts.arrowBlink);
		this._timeouts.arrowBlink = setTimeout(() => {
			this.display.deactivateArrow(rowNumber);
		}, 250);

		/*this.display.deselectRow(1, 2, 3);
		this.display.selectRow(rowNumber);

		clearTimeout(this._timeouts.rowBlink);
		this._timeouts.rowBlink = setTimeout(() => {
			this.display.deselectRow(rowNumber);
		}, 250);*/



		if (this.registry.isMaxGroup(rowName)) {
			this.display.blinkRow("green", rowNumber);
			this.nextLevel();
		}
		else {
			this.display.blinkRow("red", rowNumber);
		}
	}
}

class Display {
	constructor(registry, barSegmentCount) {

		this.registry = registry;
		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.fader = new DisplayFader(this);

		this.init();

	}

	init() {
		this.initBar();
		this.initHighlights();
		this.initArrows();
	}

	initBar() {
		this.barArea = $("#barArea").get(0);
		$(this.barArea).find(".barSegment").remove();
		var eachWidth = $(this.barArea).width() / this.barSegmentCount;
		for (var i=0; i < this.barSegmentCount; i++) {
			$(this.barArea).append($("<div>").addClass("barSegment").width(eachWidth))
		}
	}

	initHighlights() {
		Utils.forEachIn((k, group) => {
				$(group.parentSelector)
					.removeClass("selected")
					.append($("<div>").addClass("highlighter"))
			}, this.registry.groups);
	}

	initArrows() {
		var rowHeight = $(".arrow").parent().height();
		$.get("images/arrow.svg", function(data) {
			$(".arrow").html($(data).children()).width(rowHeight);
		});
	}

	activateArrow(...rowNumbers) {
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber)).find(".arrow").addClass("active");

		});
	}

	deactivateArrow(...rowNumbers) {
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber)).find(".arrow").removeClass("active");
		});
	}

	blinkRow(color, ...rowNumbers) {
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber)).find(".highlighter")
				.animate(
					{borderColor:color},
					{duration:250, queue:true}
				).animate(
					{borderColor:"transparent"},
					{duration:250, queue:true}
				);
		});
	}

	startCountdown(seconds) {
		this.fader.fade(seconds);
	}
}

class DisplayFader {
	constructor(display) {
		this._display = display;
		this.onEnd = () => {};
	}

	fade(seconds, loop) {
		if (!loop) this.stop();
		var speed = seconds / this._display.barSegmentCount;
		var fader = this;

		var $segments = $("#barArea").find(".barSegment");

		if ($segments.length === 0) {
			this.onEnd();
		}
		else {
			$segments.last().fadeOut(speed * 1000, function () {
					$(this).remove();
					fader.fade(seconds, true);
			});
		}
	}

	stop() {
		$(this._display.barArea).find(".barSegment").stop();
		this._display.initBar();
	}
}