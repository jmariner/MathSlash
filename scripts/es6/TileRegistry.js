class TileRegistry {

	constructor(gameMode) {

		this.gameMode = gameMode;
		this.modeOptions = GAME_DATA[gameMode][0];

		this.choiceTileCount = this.modeOptions.choicesPerGroup;

		this.groups = {};

		this.correctGroup = undefined;
		this.mainGroup = undefined; // main tile will go here when needed

	}

	_initGroup(name, parentSelector=this.groups[name].parentSelector, isMainGroup=false) {

		$(parentSelector).find(".tile").remove();

		let registry = this;

		this.groups[name] = {
			isMainGroup,
			registry,
			name,
			parentSelector,
			tiles: [],
			isCorrect() {
				return registry.correctGroup.name === this.name;
			},
			get totalValue() {
				if (!isMainGroup) {
					var answer;
					switch (registry.gameMode) {
						case GAME_MODES.GREATEST_SUM:
							var numbers = (this.tiles).map(c => c.computedValue);
							answer = math.sum(numbers);
							//$(this.parentSelector).attr("title", numbers.join(" + ") + " = " + answer);
							break;
						default:
							answer = NaN;
					}
					return answer;
				}
				else return NaN;
			}
		};

		if (isMainGroup) this.mainGroup = this.groups[name];
	}

	addGroup(name, parentSelector) {
		this._initGroup(name, parentSelector);
	}

	addMainGroup(name, parentSelector) {
		if (this.mainGroup === undefined)
			this._initGroup(name, parentSelector, true);
		else throw "Main group already exists!";
	}

	get mainTile() {
		return this.mainGroup.tiles[0];
	}

	getGroup(name) {
		return this.groups[name];
	}

	getGroupEl(name) {
		return $(this.groups[name].parentSelector).get(0)
	}

	isCorrectGroup(name) {
		return this.getGroup(name).isCorrect();
	}

	clearGroup(name) {
		this._initGroup(name, undefined, this.groups[name].isMainGroup);
	}

	_genTiles(groupName, diff) {

		if (diff === undefined) {
			this.clearGroup(groupName);
			return;
		}

		var group = this.groups[groupName];

		if (group.isMainGroup) {

			if (this.modeOptions.usesMainTile) {

				switch (this.gameMode) {
					case GAME_MODES.TRIG_CIRCLE:
						var r = new RandomTrigChoice();
						r.randomize();
						this.mainGroup.choice = r;
						this.mainGroup.tiles = [r.toTile()];
						break;
					default:
						this.mainGroup = null;
				}

			}
			else if (this.modeOptions.mainTileText !== undefined) {

				if (this.mainGroup.tiles.length > 0) this.mainGroup.tiles[0].remove();
				this.mainGroup.tiles = [new StringTile(this.modeOptions.mainTileText)];

			}
		}
		else {

			group.tiles.forEach(t => t.remove());
			group.tiles = [];

			for ( // generate the tiles
				group.choices = [];
				group.choices.push(Randomizer.genSingleChoiceTile(this.gameMode, diff)) < this.choiceTileCount;
			) {}

			group.tiles = group.choices.map(c => c.toTile());

		}

		group.tiles.forEach(t => t.addToPage(group.parentSelector, true));

		if (group.totalValue)
			$(group.parentSelector).attr("data-totalValue", group.totalValue);
	}

	generateTiles(diff) {
		$("#rightArea").find(".row.correct").removeClass("correct");

		switch (this.gameMode) {
			case GAME_MODES.GREATEST_SUM:
				Object.keys(this.groups).forEach(g => this._genTiles(g, diff));
				// set correct group to the one with the highest total sum
				var	totals = [];
				Utils.forEachIn((name, data) => { totals.push(data.totalValue) }, this.groups);
				this.correctGroup = this.groups[Object.keys(this.groups)[totals.indexOf(math.max(totals))]];
				break;
			case GAME_MODES.TRIG_CIRCLE:
				Object.keys(this.groups).forEach(g => this.clearGroup(g));
				this._genTiles(this.mainGroup.name, diff);
				var choices = [this.mainGroup.choice.getCircleValue()];

				var groups = Object.keys(this.groups).filter(g => g !== this.mainGroup.name);
				var correctGroupName = Randomizer.fromArray(groups);
				this.correctGroup = this.groups[correctGroupName];
				this.correctGroup.tiles = [new TrigCircleTile(choices[0])];
				this.correctGroup.tiles[0].addToPage(this.correctGroup.parentSelector);

				groups.filter(g => g !== correctGroupName).forEach(g => {
					var r = new RandomTrigCircleChoice(choices);
					r.randomize();
					choices.push(r.value);
					var t = r.toTile();
					t.addToPage(this.groups[g].parentSelector);
					this.groups[g].tiles = [t];
				});

				break;
		}
		$(this.correctGroup.parentSelector).addClass("correct");
	}

	showTiles() {
		Object.keys(this.groups).forEach(g => this.getGroup(g).tiles.forEach(t => t.show()));
	}

	hideTiles() {
		Object.keys(this.groups).forEach(g => this.getGroup(g).tiles.forEach(t => t.hide()));
		this.mainTile.show();
	}
}