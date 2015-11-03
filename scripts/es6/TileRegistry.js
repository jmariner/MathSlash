class TileRegistry {

	constructor(mainParentSelector, choiceTileCount=4) {
		Utils.assert($(mainParentSelector).length > 0, "Invalid parameter: parentSelector" + ((mainParentSelector !== undefined) ? ` (${mainParentSelector})` : ""));
		Utils.assert($(mainParentSelector).length === 1, `Invalid parentSelector (too many matches): ${mainParentSelector}`);

		this.mainParentSelector = mainParentSelector;
		this.choiceTileCount = choiceTileCount;

		this.mainTile = undefined;
		this.groups = {};
	}

	_initGroup(name, parentSelector=this.groups[name].parentSelector) {
		Utils.assert(typeof name === "string" && name.length > 0, `Invalid parameter: name ${name === undefined ? "" : name}`);

		Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + ((parentSelector !== undefined) ? ` (${parentSelector})` : ""));
		Utils.assert($(parentSelector).length === 1, `Invalid parentSelector (too many matches): ${parentSelector}`);

		$(parentSelector).find(".tile").remove();

		let registry = this;

		this.groups[name] = {
			registry,
			name,
			parentSelector,
			tiles: [],
			get totalValue() { // TODO this is janky and needs improvement
				var valuesWithOperators = (this.choices || this.tiles).map(c => `${c.operation} (${c.value})`);
				var mathString = registry.mainTile.value + " " + valuesWithOperators.join(" "); // ex: "7 * (11) + (49) - (39) + (23)"
				return math.eval(mathString);
			}
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
		Utils.assert(typeof groupName === "string" && this.groups[groupName] !== undefined,
			`Invalid group: ${groupName}`);

		if (diff === undefined) {
			this.clearGroup(groupName);
			return;
		}

		Utils.assert(mainNumber !== undefined,
			"_genChoiceTiles(...) must be called after main number is generated");
		Utils.assert(typeof mainNumber === "string" || typeof mainNumber === "number",
			`Invalid mainNumber: ${mainNumber}`);


		var group = this.groups[groupName];

		group.tiles.forEach(t => t.remove());
		group.tiles = [];

		for( // generate the tiles
			group.choices = [];
			group.choices.push(Randomizer.genSingleChoiceTile(diff, group, mainNumber)) < this.choiceTileCount;
		) {}

		for( // shuffle the order
			let a = group.choices, rand, i = a.length;
			i > 0;
			rand = Randomizer.rand(0, --i), [a[i], a[rand]] = [a[rand], a[i]]
		) {}

		group.tiles = group.choices.map(c => c.toTile(group.parentSelector));

		$(group.parentSelector).attr("data-totalValue", group.totalValue);
	}

	generateTiles(diff) {
		this._genMainTile(diff);
		Object.keys(this.groups).forEach(g => this._genChoiceTiles(g, diff, this.mainTile.value));
	}
}