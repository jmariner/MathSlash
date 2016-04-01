class Display {
	constructor(game, registry, timerSegmentCount, healthSegmentCount, arrowColors) {

		this.game = game;
		this.registry = registry;

		this.timer = new Display.Timer("#timerArea", timerSegmentCount);

		this.playerHealthbar = new Display.Healthbar(this.game.player, "#playerHealth", healthSegmentCount);
		this.enemyHealthbar = new Display.Healthbar(this.game.enemy, "#enemyHealth", healthSegmentCount);

		this.arrowColors = arrowColors;

	}

	init(timerDur, healthbar1Dur, healthbar2Dur, arrowsDur, after) {
		this.timer.generate(timerDur, () => {
			this.playerHealthbar.generate(healthbar1Dur, () => {
				this.enemyHealthbar.generate(healthbar2Dur, () => {
					this.initArrows(arrowsDur, after);
				});
			});
		});
	}

	initHealthbars() {
		this.playerHealthbar.init();
		this.enemyHealthbar.init();
	}

	initHighlights() {
		Utils.forEachIn((k, group) => {
			$(group.parentSelector)
				.removeClass("selected")
				.append($("<div>").addClass("highlighter"))
		}, this.registry.groups);
	}

	initArrows(fadeInDur, after) {
		var rowHeight = $(".arrow").parent().rect().height;
		$.get("images/arrow.svg", data => {
			$(".arrow").hide().width(rowHeight).height(rowHeight).html(
				$(data).children().find("polyline").attr(this.arrowColors).parent()
			).fadeIn(fadeInDur || 0, () => {
				if (typeof after === "function") { after(); after = undefined; }
			});
		});
	}

	blinkArrow(color, ...rowNumbers) {
		var dur = this.game.keypressTimeout/2;
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber))
				.find(".arrow").find("polyline")
				.animate(
				{svgFill: color},
				{duration:dur, queue:true}
			).animate(
				{svgFill: this.arrowColors.fill},
				{duration:dur, queue:true}
			);
		});
	}

	blinkRow(color, ...rowNumbers) {
		var dur = this.game.keypressTimeout/2;
		rowNumbers.forEach(rowNumber => {
			$(this.registry.getGroupEl("row"+rowNumber)).find(".highlighter")
				.animate(
				{borderColor:color},
				{duration:dur, queue:true}
			).animate(
				{borderColor:"transparent"},
				{duration:dur, queue:true}
			);
		});
	}

	updateHealth() {
		$("#_playerHealth").find("span").text(this.game.player.health);
		$("#_enemyHealth").find("span").text(this.game.enemy.health);
		this.playerHealthbar.update();
		this.enemyHealthbar.update();
	}

	static showBottomOverlay(type) {
		Display.hideBottomOverlay();
		$("#bottomOverlay")._show().addClass(type)
	}

	static hideBottomOverlay() {
		$("#bottomOverlay").removeAttr("class")._hide();
	}

	startCountdown(seconds) {
		this.timer.countdown(seconds);
	}
}

class Display_Healthbar {                           //===========Display.Healthbar===========
	constructor(charData, sel, segmentCount) {
		this.data = charData;
		this.$barArea = $(sel);
		this.segmentCount = segmentCount;
	}

	clear() {
		this.$barArea.find(".barSegment").stop().remove();
	}

	generate(totalDuration, after) {
		this.clear();
		var eachHeight = this.$barArea.rect().height / this.segmentCount;
		var $segment = $("<div>").addClass("barSegment").height(eachHeight);
		if (!totalDuration) {
			for (var i=0; i < this.segmentCount; i++) {
				this.$barArea.append($segment.clone());
			}
			if (typeof after === "function") after();
		}
		else {
			var eachFadeDur = totalDuration / this.segmentCount;
			var count = 0;
			var fadeInNext = () => {
				if (count++ < this.segmentCount) {
					this.$barArea.append(
						$segment.clone().fadeIn(eachFadeDur, () => {
							fadeInNext();
						})
					);
				}
				else if (typeof after === "function") after();
			};
			fadeInNext();
		}
	}

	init() {
		this.generate();
	}

	update() {
		var healthPerSegment = this.data.baseHealth / this.segmentCount;
		var fullSegments = Math.floor(this.data.health / healthPerSegment);
		var fadeLast = this.data.health % healthPerSegment !== 0;
		this.$barArea.find(".barSegment").slice(fullSegments+fadeLast).remove();
		if (fadeLast) {
			var opacity = (this.data.health % healthPerSegment) / healthPerSegment;
			this.$barArea.find(".barSegment").last().css("opacity", opacity);
		}
	}
}
Display.Healthbar = Display_Healthbar;

class Display_Timer {                           //===========Display.Timer===========
	constructor(sel, segmentCount) {
		this.current = {};
		this.$barArea = $(sel);
		this.segmentCount = segmentCount;
		this.onEnd = function() {};
	}

	countdown(seconds, loop) {
		if (!loop) {
			this.init();
			this.current.time = seconds;
		}

		// this is seconds per bar - 60 seconds and 30 bars = 2 sec each
		var speed = seconds / this.segmentCount;
		this.current.total = seconds;
		this.current.speed = speed;

		var timer = this;

		var $segments = this.$barArea.find(".barSegment");

		if ($segments.length === 0) {
			this.onEnd();
		}
		else {
			$segments.last().fadeOut(speed * 1000, function () {
				$(this).remove();
				timer.current.time -= speed;
				timer.countdown(seconds, true);
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
		this.$barArea.find(".barSegment").stop().remove();
	}

	init() {
		this.generate();
	}

	generate(totalDuration, after) { // totalDuration is in ms
		this.clear();
		var eachWidth = this.$barArea.rect().width / this.segmentCount;
		var $segment = $("<div>").addClass("barSegment").width(eachWidth);
		if (!totalDuration) {
			for (var i = 0; i < this.segmentCount; i++) {
				this.$barArea.append($segment.clone());
			}
			if (typeof after === "function") after();
		}
		else {
			var eachFadeDur = totalDuration / this.segmentCount;
			var count = 0;
			var fadeInNext = () => {
				if (count++ < this.segmentCount) {
					this.$barArea.append(
						$segment.clone().fadeIn(eachFadeDur, () => {
							fadeInNext();
						})
					);
				}
				else if (typeof after === "function") after();
			};
			fadeInNext();
		}
	}
}
Display.Timer = Display_Timer;