class Game {
	constructor() {
		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.display = new Display(this.registry, 30);

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);

		this._timeouts = {};
	}

	startRound(diff) {
		var options = this.difficultyData[diff].options;
		this.registry.generateTiles(diff);
		this.display.startCountdown(options.timeLimit);
	}

	chooseRow(rowNumber) {

		clearTimeout(this._timeouts.arrowBlink);

		this.display.deactivateArrow(1,2,3);
		this.display.activateArrow(rowNumber);

		this._timeouts.arrowBlink = setTimeout(() => {
			this.display.deactivateArrow(rowNumber);
		}, 500);

		// TO-DO this is not a good way to do this - more js and less css
		//$(this.registry.groups["row"+rowNumber].parentSelector).addClass("highlight green");
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
		for (var i=0; i < this.barSegmentCount; i++) {
			$(this.barArea).append($("<div>").addClass("barSegment"))
		}
	}

	initHighlights() {
		Utils.forEachIn((k, group) =>
			{ $(group.parentSelector)
				.append($("<div>").addClass("highlighter"))
				.on("animationend", function() {
					$(this).removeClass("highlight red green");
			})},
			this.registry.groups);
	}

	initArrows() {
		var rowHeight = $(".arrow").parent().height();
		$.get("images/arrow.svg", function(data) {
			$(".arrow").html($(data).children()).width(rowHeight);
		});
	}

	activateArrow(...rowNumbers) { // TODO allow for varargs for multiple rows
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber)).find(".arrow").addClass("active");

		});
	}

	deactivateArrow(...rowNumbers) {
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber)).find(".arrow").removeClass("active");
		});
	}

	startCountdown(seconds) {
		this.fader.fade(seconds);
	}
}

class DisplayFader {
	constructor(display) {
		this._display = display;
	}

	fade(seconds, loop) {
		if (!loop) this.stop();
		var speed = seconds / this._display.barSegmentCount;
		var fader = this;
		$(this._display.barArea).find(".barSegment:last-child")
		.fadeOut(speed*1000, function() {
				$(this).remove();
				fader.fade(seconds, true);
			});
	}

	stop() {
		$(this._display.barArea).find(".barSegment").stop();
		this._display.initBar();
	}
}