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

		this.preRoundDelay = 1000;
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

		this.display = new Display(this, this.registry, timerSegments, healthSegments, {fill:"black",stroke:"white"});
		//this.display.timer.onEnd = () => { this.onTimeOut(); };
		this.animationManager = undefined;
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
		if (firstRound) this.waiting = false;
		if (this.playing && !this.waiting) {

			if (correct !== undefined) { // during round

				this.display.showBottomOverlay(correct ? "correct" : "failed");
				if (correct) this.damageEnemy();
				else if (!correct) this.damagePlayer();

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

	onLevelOver(playerWon) {
		this.display.showBottomOverlay(playerWon ? "win" : "lose");
		this.startLevel(this.current.diff, this.afterLevelDelay);
	}

	onTimeOut() {
		this.nextRound(this.preRoundDelay, false);
	}

	onCorrect() { // correct answer is chosen, damage the enemy and load next round
		this.nextRound(this.preRoundDelay, true);
	}

	onWrong() { // wrong answer is chosen, decrease time by this.current.options.wrongPenalty of start
		this.display.subtractTime(
			this.current.options.timeLimit * this.current.options.wrongPenalty,
			() => { this.onTimeOut(); }
		);
	}

	damagePlayer() {
		this.player.health -= (this.enemy.baseDamage * this.enemy.damageMod);
		// do animation stuff
	}

	damageEnemy() {
		this.enemy.health -= (this.player.baseDamage * this.player.damageMod);
		// do animation stuff
	}
}