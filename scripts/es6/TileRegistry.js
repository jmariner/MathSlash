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
				TileRegistry.getRandomTileData(diff, true).value,
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


		//noinspection StatementWithEmptyBodyJS
		for(;
			group.tiles.push(TileRegistry._genSingleChoiceTile(diff, group)) < this.choiceTileCount;
		);

		//group.tiles = Array.apply(null, {length: this.choiceTileCount})
		//	.map(() => _genSingleChoiceTile(diff, group)
		//);

		group.tiles.forEach(t => t.show());
	}

	static _genSingleChoiceTile(diff, group) {

		var initChoice = TileRegistry.getRandomTileData(diff);
		var tilesSoFar = group.tiles;

		if (initChoice.hasOwnProperty("condition")) {}
	}

	static getRandomTileData(difficulty, isMain=false) {//mainNumber) { // this pulls from difficulty.js

		Utils.assert(typeof difficulty === "number" && DIFFICULTY_DATA[difficulty] !== undefined,
			`Invalid difficulty: ${difficulty}`);

		//var isMain = mainNumber === undefined;

		var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

		var choice = Utils.pickWeightedRandom(choices);

		//if (!isMain) {
		//	while (choice.hasOwnProperty("condition") && math.eval(choice.condition, {mainNumber}) === false) {
		//		choice = Utils.pickWeightedRandom(choices);
		//	}
		//}

		var value = undefined;
		switch (choice.type) {
			case "integer":
				value = Utils.rand(...choice.limits);
				break;
			case "fraction":
				// TODO do fraction stuff
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
			operation,
			condition: choice.condition
		};
	}

	generateTiles(diff) {
		this._genMainTile(diff);
		Object.keys(this.choiceTileMap).forEach(g => this._genChoiceTiles(g, diff, this.mainTile.value));
	}
}