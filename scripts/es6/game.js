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
		this.barFadeInterval = undefined;

		//this.initBar();

	}

	initBar() {
		for(
			this.barArea = $("#barArea").get(0);
			$(this.barArea).append($("<div>").addClass("barSegment")).find(".barSegment").length < this.barSegmentCount;
		) {}
	}

	startCountdown(seconds) {
		var fadeSpeed = seconds / this.barSegmentCount;

		var fadeNext;
		(fadeNext = () => {
			$(this.barArea).find(".barSegment:last-child")
				.fadeOut(fadeSpeed * 1000, function () {
					$(this).remove();
					fadeNext();
				}
			);
		})();
	}
}