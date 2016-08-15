class Game { // level = each enemy, round = each collection of tiles
	constructor(gameMode, timerSegments=30, healthSegments=10) {
		this.gameMode = gameMode;
		this.registry = new TileRegistry(gameMode);
		this.registry.addGroup("row1", ".tileRow1");
		this.registry.addGroup("row2", ".tileRow2");
		this.registry.addGroup("row3", ".tileRow3");
		this.registry.addMainGroup("main", ".bigTileArea");


		this.difficultyData = $.extend(true, [], GAME_DATA[this.gameMode]);

		this.playing = false;
		this.waiting = true;

		this.preRoundDelay = 500;
		this.afterLevelDelay = 5000;
		this.keypressTimeout = 500; //ms
		this.blockInput = false;
		this.timeouts = {};

		this.player = {
			baseHealth: 100,
			baseDamage: 20
		};

		this.enemy = {
			baseHealth: 200,
			baseDamage: 25
		};

		this.display = new Display(this, this.registry, timerSegments, {fill:"black",stroke:"white"});
		//this.display.timer.onEnd = () => { this.onTimeOut(); };
		this.animationManager = null
	}

	initDisplay() {
		this.display.init();
	}

	startLevel(diff, delay) {
		if (diff > 3) throw "Difficulties > 3 are not supported";
		var options = this.difficultyData[diff].options;
		this.current = {diff, options};
		this.playing = true;
		this.player.health = this.player.baseHealth;
		this.enemy.health = this.enemy.baseHealth;
		this.player.damageMod = 1;
		this.enemy.damageMod = 1;
		this.nextRound(delay, undefined, true);
 	}

	nextRound(delay, correct, firstRound) {
		if (firstRound) {
			this.waiting = false;
			Utils.forEachIn((n, c) => c.loopAnimation("idle"), this.animationManager.characters);
		}
		if (this.playing && !this.waiting) {

			if (correct !== undefined) { // during round, after the attack anim and hp change

				this.display.updateHealth();

				if (this.player.health === 0 || this.enemy.health === 0) {
					this.onLevelOver(this.enemy.health === 0);
					return;
				}
			}

			this.display.timer.clear();
			this.registry.generateTiles(this.current.diff);
			this.waiting = true;

			this.timeouts.roundDelay = setTimeout(() => {
				this.waiting = false;
				this.display.hideBottomOverlay();
				if (correct === undefined) this.display.updateHealth();
				if (firstRound)	this.display.initHealthbars();
				this.display.startCountdown(this.current.options.timeLimit, () => { this.onTimeOut(); });
				this.registry.showTiles();
			}, delay);
		}
	}

	onKeyDown(keyCode) {
		var keyToRow = {38:1, 39:2, 40:3}; // up, right, down, respectively

		if (keyCode === Input.Esc)
			document.location.reload(); // TODO actual restart

		else if (keyToRow[keyCode] && !this.blockInput) { // up/down/right
			this.chooseRow(keyToRow[keyCode]);
			this.blockInput = true;
			clearTimeout(this.timeouts.keypressCooldown);
			this.timeouts.keypressCooldown = setTimeout(
				() => { this.blockInput = false; },
				this.keypressTimeout);
		}
	}

	chooseRow(rowNumber) {

		var rowName = "row"+rowNumber;

		this.display.blinkArrow("lightgray", rowNumber);

		if (this.playing && !this.waiting) {
			if (this.registry.isMaxGroup(rowName)) this.onCorrect();
			else this.onWrong();
		}

	}

	onRoundEnd(correct, fromWrong) {
		debugger;
		this.display.showBottomOverlay(correct ? "correct" : fromWrong ? "wrong" : "failed");
		this.registry.hideTiles();
		this.display.timer.clear();

		var afterAttack = () => {
			this.nextRound(this.preRoundDelay, correct);
		};

		this.attack(correct ? "enemy" : "player", afterAttack);
	}

	onCorrect() {
		this.onRoundEnd(true);
	}

	onTimeOut(fromWrong) {
		this.onRoundEnd(false, fromWrong);
	}

	onWrong() { // wrong answer is chosen, decrease time by this.current.options.wrongPenalty of start
		this.display.blinkBottomOverlay("wrong", 500);
		this.display.subtractTime(
			this.current.options.timeLimit * this.current.options.wrongPenalty,
			() => { this.onTimeOut(true); }
		);
	}

	attack(who, after) { // who = person being attacked
		if (who === "player") {
			this.enemy.animManager.playAnimation("attack", () => { //after
				this.player.animManager.playAnimation("hurt", after);
			});
			this.player.health -= (this.enemy.baseDamage * this.enemy.damageMod);
		}
		else if (who === "enemy") {
			this.player.animManager.playAnimation("attack", () => { //after
				this.enemy.animManager.playAnimation("hurt", after);
			});
			this.enemy.health -= (this.player.baseDamage * this.player.damageMod);
		}
	}

	onLevelOver(playerWon) {
		this.display.showBottomOverlay(playerWon ? "win" : "lose");
		// slide background to next part of level, then start next one
		this.startLevel(this.current.diff, this.afterLevelDelay);
	}
}