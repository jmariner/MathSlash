class TileRegistry {

	constructor(mainParentSelector, choiceTileCount=4) {
		Utils.assert($(mainParentSelector).length > 0, "Invalid parameter: parentSelector" + ((mainParentSelector !== undefined) ? ` (${mainParentSelector})` : ""));
		Utils.assert($(mainParentSelector).length === 1, `Invalid parentSelector (too many matches): ${mainParentSelector}`);

		this.mainParentSelector = mainParentSelector;
		this.choiceTileCount = choiceTileCount;

		this.mainTile = undefined;
		this.choiceTileMap = {};
	}

	_initGroup(name, parentSelector=this.choiceTileMap[name].parentSelector) {
		Utils.assert(typeof name === "string" && name.length > 0, `Invalid parameter: name ${name === undefined ? "" : name}`)

		Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + ((parentSelector !== undefined) ? ` (${parentSelector})` : ""));
		Utils.assert($(parentSelector).length === 1, `Invalid parentSelector (too many matches): ${parentSelector}`);

		$(parentSelector).find(".tile").remove();

		this.choiceTileMap[name] = {
			parentSelector,
			tiles: []
		};
	}

	addGroup(name, parentSelector) {
		this._initGroup(name, parentSelector);
	}

	clearGroup(name) {
		this._initGroup(name);
	}

	_genMainTile(diff) {
		if (this.mainTile !== undefined) {
			this.mainTile.remove();
			this.mainTile = undefined;
		}

		if (diff !== undefined) {
			this.mainTile = new Tile(
				TileRegistry.getRandomTileData(diff, true).valueString,
				this.mainParentSelector
			);
		}

		this.mainTile.show();
	}

	_genChoiceTiles(groupName, diff, mainNumber) {
		Utils.assert(typeof groupName === "string" && this.choiceTileMap[groupName] !== undefined,
			`Invalid group: ${groupName}`);

		if (diff === undefined) {
			this.clearGroup(groupName);
			return;
		}

		Utils.assert(mainNumber !== undefined,
			"_genChoiceTiles(...) must be called after main number is generated");
		Utils.assert(typeof mainNumber === "string" || typeof mainNumber === "number",
			`Invalid mainNumber: ${mainNumber}`);


		var group = this.choiceTileMap[groupName];

		group.tiles.forEach(t => t.remove());
		group.tiles = [];


		for(
			group.choices = [];
			group.choices.push(TileRegistry._genSingleChoiceTile(diff, group, mainNumber)) < this.choiceTileCount;
		) {}

		for(
			let a = group.choices, rand, i = a.length;
			i > 0;
			rand = Utils.rand(0, --i), [a[i], a[rand]] = [a[rand], a[i]]
		) {}

		group.tiles = group.choices.map(c => new Tile(c.valueString, group.parentSelector));

		group.tiles.forEach(t => t.show());
	}

	static _genSingleChoiceTile(diff, group, mainNumber) {

		mainNumber = +mainNumber;

		var choice = TileRegistry.getRandomTileData(diff);
		var choicesSoFar = group.choices;

		var reRoll = () => TileRegistry.getRandomTileData(diff);

		var count = function(id) {
			let count = 0;
			choicesSoFar.forEach(c => { count += c.id === id });
			return count;
		};

		var scope = () => ({mainNumber, myCount: count(choice.id)});

		while (choice.condition !== undefined && false === math.eval(choice.condition, scope())) {
			choice = reRoll();
		}
		return choice;
	}

	static getRandomTileData(difficulty, isMain=false) { // this pulls from difficulty.js

		Utils.assert(typeof difficulty === "number" && DIFFICULTY_DATA[difficulty] !== undefined,
			`Invalid difficulty: ${difficulty}`);

		var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

		var choice = Utils.pickWeightedRandom(choices);

		var value = undefined;
		switch (choice.type) {
			case "integer":
				value = Utils.rand(...choice.limits);
				break;
			case "fraction":
				value = `${Utils.buildFraction(
					Utils.rand(...(choice.numeratorLimits || [NaN])),
					Utils.rand(...(choice.denominatorLimits || NaN)),
					Utils.rand(...(choice.resultLimits || [NaN])) // TODO you are here
				).toString()}`;
				break;
			case "power":
			case "exponent":
				value = `${Utils.rand(...choice.baseLimits)} ^ ${choice.power || Utils.rand(...choice.powerLimits)}`;
				break;
			default:
				value = NaN;
		}

		var operation = isMain ? "" : choice.operation;

		//return operation + value;
		return {
			value,
			valueString: operation+value,
			operation,
			condition: choice.condition
		};
	}

	generateTiles(diff) {
		this._genMainTile(diff);
		Object.keys(this.choiceTileMap).forEach(g => this._genChoiceTiles(g, diff, this.mainTile.value));
	}
}