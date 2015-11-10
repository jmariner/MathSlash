class Game {
	constructor() {
		this.display = new Display(30);

		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);
	}

	startRound(diff) {
		var options = this.difficultyData[diff].options;
		this.registry.generateTiles(diff);
	}


}

class Display { // TODO this needs work
	constructor(barSegmentCount) {

		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.fader = new DisplayFader(this);

		this.initBar();

	}

	initBar() {
		this.barArea = $("#barArea").get(0);
		$(this.barArea).find(".barSegment").remove();
		for (var i=0; i < this.barSegmentCount; i++) {
			$(this.barArea).append($("<div>").addClass("barSegment"))
		}
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