class Display {
	constructor(game, registry, arrowColors) {

		this.game = game;
		this.registry = registry;

		this.timer = new Display.Timer("#timerArea");

		this.playerHealthbar = new Display.Healthbar(this.game.player, "#playerHealth");
		this.enemyHealthbar = new Display.Healthbar(this.game.enemy, "#enemyHealth");

		this.mainOverlay = new Display.Overlay("#mainOverlay", true);
		this.bottomOverlay = new Display.Overlay("#bottomOverlay", true);

		this.difficultyDisplay = $("#difficultyDisplay");

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

	updateLevel() {
		this.difficultyDisplay.text("Level: " + this.game.current.diff);
	}

	updateHealth() {
		$("#_playerHealth").find("span").text(this.game.player.health);
		$("#_enemyHealth").find("span").text(this.game.enemy.health);
		this.playerHealthbar.update();
		this.enemyHealthbar.update();
	}

	showBottomOverlay(type) {
		this.bottomOverlay.showOnly(type);
	}

	blinkBottomOverlay(type, dur) {
		this.bottomOverlay.blink(type, dur || 1000);
	}

	hideBottomOverlay() {
		this.bottomOverlay.hideAll();
	}

	doBigCountdown(seconds, stopAt=1, after=undefined) {
		var blinkLoop = () => {
			if (seconds >= stopAt) {
				this.mainOverlay.blink("countdown", 1000, 0, ""+seconds--, blinkLoop);
			}
			else if (typeof after === "function") after();
		};
		blinkLoop();
	}

	startCountdown(seconds, after) {
		this.timer.countdown(seconds*1000, after);
	}

	subtractTime(seconds, onTimeOut) {
		this.timer.subtractTime(seconds*1000, onTimeOut);
	}

	static gameOver(won) {
		var $go = $(".gameover-page");
		$go.addClass(won ? "won" : "lost").addClass("enabled");
		$go.find(".click-to-continue").click(() => { window.location.reload() });
		$(document).keydown(() => { window.location.reload() });
	}
}

class Display_Healthbar {
	constructor(charData, sel) {
		this.data = charData;
		this.$barArea = $(sel);
		this.$bar = $("<div>").addClass("singleBar").height(0);
	}

	clear() {
		this.$barArea.find(".barSegment").stop().remove();
	}

	generate(totalDuration, after) {
		this.clear();
		if (!totalDuration) {
			this.$barArea.append(this.$bar.height("100%"));
			if (typeof after === "function") after();
		}
		else {
			this.$barArea.append(this.$bar.animate(
				{ height: "100%" },
				totalDuration,
				"linear",
				after
			));
		}
	}

	init() {
		this.generate();
	}

	update() {
		var initHeight = this.$bar.height();
		var hpRatio = this.data.health / this.data.baseHealth;
		this.$bar.height(hpRatio*100 + "%");
	}
}
Display.Healthbar = Display_Healthbar;

class Display_Healthbar0 {                           //===========Display.Healthbar===========
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

class Display_Timer {
	constructor(sel) {
		this.running = false;
		this.$barArea = $(sel);
		this.$bar = $("<div>").addClass("singleBar").width(0);
		this.timerWorker = undefined;

		this.$barArea.append(this.$bar);
	}

	countdown(duration, onTimeOut) {
		this.init();
		if (this.timerWorker) this.timerWorker.terminate();
		this.running = true;

		var $display = $("#timerDisplay");
		var initWidth = this.$bar.width();
		this.onTimeOut = onTimeOut || $.noop();

		this.timerWorker = Utils.newWorker("timer", (e) => {
			if (e.data === "done") {
				this.timerWorker.terminate();
				$display.text((0).toFixed(3));
				this.$bar.detach();
				this.running = false;
				this.onTimeOut();
			}
			else if (e.data.time !== undefined) { // each step
				$display.text(((e.data.time)/1000).toFixed(3));
				this.$bar.width(initWidth * (e.data.time/duration));
			}
		});

		this.timerWorker.postMessage({
			action: "start",
			duration,
			step: 10,
			fixOffset: true
		});
	}

	subtractTime(time, onTimeOut) {
		var onTimeOut_old = this.onTimeOut;
		this.onTimeOut = onTimeOut;
		setTimeout(() => { this.onTimeOut = onTimeOut_old; }, 500);
		this.timerWorker.postMessage({
			action: "jump",
			diffString: "-"+time
		});
	}

	clear() {
		if (this.running)
			this.timerWorker.postMessage({action: "pause"});
		this.$bar.detach();
	}

	init() {
		this.generate();
	}

	generate(totalDuration, after) {
		this.clear();
		if (!totalDuration) {
			this.$barArea.append(this.$bar.width("100%"));
			if (typeof after === "function") after();
		}
		else {
			this.$barArea.append(this.$bar.animate(
				{ width: "100%" },
				totalDuration,
				"linear",
				after
			));
		}
	}
}

class Display_Timer0 {                           //===========Display.Timer===========
	constructor(sel, segmentCount) {
		this.current = {};
		this.$barArea = $(sel);
		this.segmentCount = segmentCount;
	}

	countdown(duration, after) {
		this.init();
		this.current.time = duration;

		var eachFadeDur = duration / this.segmentCount;
		this.current.speed = eachFadeDur;

		var actualFadeDur = function($el) {
			return eachFadeDur * ($el.data("fadeMod") || 1);
		};

		var timer = this;
		var $display = $("#timerDisplay");

		var fadeOutNext = () => {
			var $segments = this.$barArea.find(".barSegment");
			if ($segments.length > 0) {
				$segments.last().fadeOut({
					duration: actualFadeDur($segments.last()),
					progress: function(a, p, ms) {
						// upon reaching 0 after calling subtractTime(...), this outputs "-0.000"
						// this is because "timer.current.time - a.duration + ms" = -1.7053025658242404e-12
						// and because .toFixed(...) retains the negative and rounds up to negative zero
						// fix this by using Math.round(...) so that .toFixed() happens on exactly -0, rounding correctly to "0.000"

						// TODO when subtracting time in between multiples of eachDur, this decreases to -0.333
						//      in other words, time reaches zero one bar too early
						$display.text((Math.round(timer.current.time - a.duration + ms)/1000).toFixed(3));
					},
					complete: function() {
						timer.current.time -= actualFadeDur($(this));
						$(this).remove();
						fadeOutNext();
					}
				});
			}
			else if (typeof after === "function") after();
		};
		fadeOutNext();
	}

	countdown0(seconds, loop) {
		if (!loop) {
			this.init();
			this.current.time = seconds;
		}

		// this is seconds per bar - 60 seconds and 30 bars = 2 sec each
		var speed = seconds / this.segmentCount;
		this.current.total = seconds;
		this.current.speed = speed;

		var timer = this;
		var $out = $("#out1");

		var $segments = this.$barArea.find(".barSegment");

		if ($segments.length === 0) {
			this.onEnd();
			//$out.text("0");
		}
		else {
			$segments.last().fadeOut({
				duration: speed*1000,
				queue: "timer",
				progress: function(anim, prog, ms) {
					$out.text((timer.current.time - speed + ms/1000).toFixed(3));
				},
				complete: function () {
					$(this).remove();
					timer.current.time -= speed;
					timer.countdown0(seconds, true);
				}
			}).dequeue("timer");
		}
	}

	subtractTime(time, onTimeOut) {
		if (time > this.current.time) {
			this.clear();
			onTimeOut();
		}
		else if (time > 0) {
			this.current.time -= time;
			var barsToRemove = time / this.current.speed;
			this.$barArea.find(".barSegment").slice(-1 * barsToRemove).remove();

			// this offsets the numerical countdown due to barsToRemove being rounded down
			// with time=7500 and speed=333.333, this leaves .5 bars ignored when removing the others
			// after doing this, the following element will be faded with new duration eachFadeDur * offset
			var offset = barsToRemove - Math.floor(barsToRemove); // get decimal portion
			this.$barArea.find(".barSegment").last().data("fadeMod", offset);
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

class Display_Overlay {                           //===========Display.Overlay===========
	constructor(sel, defaultHidden) {
		this.$overlay = $(sel);
		this.defaultHidden = defaultHidden;
		if (this.defaultHidden) this.$overlay._hide();
		this.hideAll();
		this.$overlay.addClass("ready");
		this.blinkTimeout = undefined;
	}

	showOnly(type) {
		this.hideAll();
		this.show(type);
	}

	showOne(type, customText) {
		if (type) {
			clearTimeout(this.blinkTimeout);
			this.$overlay._show().find("." + type)
				.stop().fadeIn(0)._show().text((i, old) => (customText || old));
		}
	}

	show(...types) {
		types.forEach(t => { this.showOne(t); });
	}

	hideAll() {
		if (this.defaultHidden) this.$overlay._hide();
		this.$overlay.find("> div")._hide();
	}

	hideOne(type) {
		if (this.defaultHidden) this.$overlay._hide();
		this.$overlay.find("."+type)._hide();
	}

	blink(type, dur, delayBetween, customText, after) {
		this.hideAll();
		this.showOne(type, customText);
		this.$overlay._show().find("."+type).hide().fadeIn(dur/2, function() {
			this.blinkTimeout = setTimeout(() => {
				$(this).fadeOut(dur/2, function() {
					$(this).show()._hide();
					if (typeof after === "function") after();
				});
			}, delayBetween);
		});
	}
}
Display.Overlay = Display_Overlay;