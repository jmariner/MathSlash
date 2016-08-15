class TileRegistry {

	constructor(gameMode, choiceTileCount=4) {

		this.choiceTileCount = choiceTileCount;

		this.gameMode = gameMode;
		this.groups = {};

		this.maxGroup = undefined;
		this.mainGroup = undefined; // main tile will go here when needed
		this.hasMainTile = false;

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
			isMax() {
				return registry.maxGroup.name === this.name;
			},
			get totalValue() {
				if (!isMainGroup && registry.gameMode === GAME_MODES.GREATEST_SUM) {
					var numbers = (/*this.choices || */this.tiles).map(c => c.computedValue);

					var answer = math.sum(numbers);

					$(this.parentSelector).attr("title", numbers.join(" + ") + " = " + answer);

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

	isMaxGroup(name) {
		return this.getGroup(name).isMax();
	}

	clearGroup(name) {
		this._initGroup(name);
	}

	_genTiles(groupName, diff) {

		if (diff === undefined) {
			this.clearGroup(groupName);
			return;
		}

		var group = this.groups[groupName];

		if (group.isMainGroup) {
			var modeOptions = GAME_DATA[this.gameMode][0];
			if (modeOptions.usesMainTile) {
				// generate the mail tile value
			}
			else if (modeOptions.mainTileText !== undefined) {
				if (this.mainGroup.tiles.length > 0) this.mainGroup.tiles[0].remove();
				this.mainGroup.tiles = [new StringTile(modeOptions.mainTileText)];
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
		$(".max").removeClass("max");

		Object.keys(this.groups).forEach(g => this._genTiles(g, diff));

		var totals = [];
		Utils.forEachIn((name,data) => { totals.push(data.totalValue) }, this.groups);
		this.maxGroup = this.groups[Object.keys(this.groups)[totals.indexOf(math.max(totals))]];
		$(this.maxGroup.parentSelector).addClass("max");
	}

	showTiles() {
		Object.keys(this.groups).forEach(g => this.getGroup(g).tiles.forEach(t => t.show()));
	}

	hideTiles() {
		Object.keys(this.groups).forEach(g => this.getGroup(g).tiles.forEach(t => t.hide()));
		this.mainTile.show();
	}
}