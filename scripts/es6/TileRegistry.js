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
				Randomizer.getRandomTileData(diff, true).valueString,
				this.mainParentSelector
			);
		}

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
			group.choices.push(Randomizer.genSingleChoiceTile(diff, group, mainNumber)) < this.choiceTileCount;
		) {}

		for(
			let a = group.choices, rand, i = a.length;
			i > 0;
			rand = Randomizer.rand(0, --i), [a[i], a[rand]] = [a[rand], a[i]]
		) {}

		group.tiles = group.choices.map(c => new Tile(c.valueString, group.parentSelector));

		var valuesWithOperators = group.tiles.map(t => `${t.operation} (${t.value})`);
		var mathString = this.mainTile.value + " " + valuesWithOperators.join(" "); // ex: "7 * (11) + (49) - (39) + (23)"
		group.totalValue = math.eval(mathString);
	}

	generateTiles(diff) {
		this._genMainTile(diff);
		Object.keys(this.choiceTileMap).forEach(g => this._genChoiceTiles(g, diff, this.mainTile.value));
	}
}