class Game {
	constructor() {
		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.display = new Display(this.registry, 30);

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);
	}

	startRound(diff) {
		var options = this.difficultyData[diff].options;
		this.registry.generateTiles(diff);
	}

	chooseRow(rowNumber) {
		$(".highlight").removeClass("highlight red green");
		// TODO this is not a good way to do this - more js and less css
		$(this.registry.groups["row"+rowNumber].parentSelector).addClass("highlight green");
	}
}

class Display { // TODO this needs work
	constructor(registry, barSegmentCount) {

		this.registry = registry;
		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.fader = new DisplayFader(this);

		this.initBar();
		this.initHighlights();

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