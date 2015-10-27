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
				TileRegistry.getRandomTileValue(diff, true),
				this.mainParentSelector
			);
		}

		this.mainTile.show();
	}

	_genChoiceTiles(diff, groupName) {
		var group = this.choiceTileMap[groupName];

		group.tiles.forEach(t => t.remove());

		group.tiles = Array.apply(null, {length: this.choiceTileCount})
			.map(() => new Tile(
				TileRegistry.getRandomTileValue(diff),
				group.parentSelector
			)
		);

		group.tiles.forEach(t => t.show());

		//noinspection StatementWithEmptyBodyJS
		//for(
		//	var tiles = [];
		//	tiles.length <= this.choiceTileCount;       // this works too - just not as cool
		//	tiles.push(TileRegistry.getRandomTileValue(diff))
		//);
	}

	generateTiles(diff) {
		this._genMainTile(diff);
		Object.keys(this.choiceTileMap).forEach(g => this._genChoiceTiles(diff, g));
	}
}

TileRegistry.getRandomTileValue = function(difficulty, main=false) { // this pulls from difficulty.js
	var choice = Utils.pickWeightedRandom(
		DIFFICULTY_DATA[difficulty][main ? "main" : "choices"]
	);

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

	var oper = choice.hasOwnProperty("operation") ? choice.operation : "";

	return oper + value;
};