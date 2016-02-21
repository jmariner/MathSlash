class Game { // level = each enemy, round = each collection of tiles
	constructor() {
		this.registry = new TileRegistry(".bigTileArea");
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");

		this.display = new Display(this, this.registry, 30, {fill:"black",stroke:"white"});

		this.difficultyData = $.extend(true, [], DIFFICULTY_DATA);

		this.playing = false;
		this.waiting = true;

		this.display.fader.onEnd = () => { this.onTimeOut(); };

		this.preRoundDelay = 1000;
		this.afterLevelDelay = 5000;
		this.timeouts = {};

		this.player = {
			baseHealth: 100,
			baseDamage: 20
		};

		this.enemy = {
			baseHealth: 200,
			baseDamage: 25
		};
	}

	startLevel(diff, delay) {
		var options = this.difficultyData[diff].options;
		this.current = {diff, options};
		this.playing = true;
		this.player.health = this.player.baseHealth;
		this.enemy.health = this.enemy.baseHealth;
		this.nextRound(delay);
 	}

	nextRound(delay, correct) {
		if (this.playing) {

			if (correct !== undefined) { // during round
				Display.showBottomOverlay(correct ? "correct" : "failed");
				if (correct) {
					this.enemy.health -= this.player.baseDamage;
				}
				else if (!correct) {
					this.player.health -= this.enemy.baseDamage;
				}

				this.display.updateHealth();

				if (this.player.health === 0) {
					this.onLevelOver(false);
					return;
				}
				else if (this.enemy.health === 0) {
					this.onLevelOver(true);
					return;
				}
			}
			else { // first round

			}

			this.display.fader.clear();
			this.registry.generateTiles(this.current.diff);
			this.waiting = true;
			this.timeouts.roundDelay = setTimeout(() => {
				this.waiting = false;
				Display.hideBottomOverlay();
				if (correct === undefined) this.display.updateHealth();
				this.display.startCountdown(this.current.options.timeLimit);
				this.registry.showTiles();
			}, delay);
		}
	}

	onTimeOut() {
		this.nextRound(this.preRoundDelay, false);
	}

	onLevelOver(playerWon) {
		Display.showBottomOverlay(playerWon ? "win" : "lose");
		this.startLevel(this.current.diff, this.afterLevelDelay);
	}

	chooseRow(rowNumber) {

		var rowName = "row"+rowNumber;

		this.display.blinkArrow("lightgray", rowNumber);

		if (this.playing && !this.waiting) {
			if (this.registry.isMaxGroup(rowName)) {
				// correct answer is chosen, damage the enemy and load next round
				this.nextRound(this.preRoundDelay, true);
			}
			else {
				// wrong answer is chosen, decrease time by 50% of start
				this.display.fader.subtractTime(this.current.options.timeLimit / 2);
			}
		}
	}
}

class Display {
	constructor(game, registry, barSegmentCount, arrowColors) {

		this.game = game;
		this.registry = registry;
		this.barSegmentCount = barSegmentCount;
		this.barArea = undefined;
		this.fader = new DisplayFader(this);

		this.arrowColors = arrowColors;

		this.init();

	}

	init() {
		this.fader.clear();
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
		$.get("images/arrow.svg", data => {
			$(".arrow").html($(data).children())
				.width(rowHeight)
				.find("polyline")
				.attr("fill",   this.arrowColors.fill)
				.attr("stroke", this.arrowColors.stroke);
		});
	}

	blinkArrow(color, ...rowNumbers) {
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber))
				.find(".arrow").find("polyline")
				.animate(
				{svgFill: color},
				{duration:250, queue:true}
			).animate(
				{svgFill: this.arrowColors.fill},
				{duration:250, queue:true}
			);
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

	updateHealth() {
		$("#playerHealth").find("span").text(this.game.player.health);
		$("#enemyHealth").find("span").text(this.game.enemy.health);
	}

	static showBottomOverlay(type) {
		Display.hideBottomOverlay();
		$("#bottomOverlay")._show().addClass(type)
	}

	static hideBottomOverlay() {
		$("#bottomOverlay").removeAttr("class")._hide();
	}

	startCountdown(seconds) {
		this.fader.fade(seconds);
	}
}

class DisplayFader {
	constructor(display) {
		this._display = display;
		this.current = {};
		this.$barArea = $("#barArea");
		this.onEnd = () => {};
	}

	fade(seconds, loop) {
		if (!loop) {
			this.clear();
			this.init();
			this.current.time = seconds;
		}

		// this is seconds per bar - 60 seconds and 30 bars = 2 sec each
		var speed = seconds / this._display.barSegmentCount;
		this.current.total = seconds;
		this.current.speed = speed;

		var fader = this;

		var $segments = this.$barArea.find(".barSegment");

		if ($segments.length === 0) {
			this.onEnd();
		}
		else {
			$segments.last().fadeOut(speed * 1000, function () {
				$(this).remove();
				fader.current.time -= speed;
				fader.fade(seconds, true);
			});
		}
	}

	subtractTime(seconds) {
		if (seconds > this.current.time) {
			this.clear();
			this.onEnd();
		}
		else if (seconds > 0) {
			this.current.time -= seconds;
			var barsToRemove = seconds / this.current.speed;
			this.$barArea.find(".barSegment").slice(0, barsToRemove).remove();
		}
	}

	clear() {
		$(this.$barArea).find(".barSegment").stop().remove();
	}

	init() {
		this._display.initBar();
	}
}