"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TileRegistry = (function () {
	function TileRegistry(mainParentSelector) {
		var choiceTileCount = arguments.length <= 1 || arguments[1] === undefined ? 4 : arguments[1];

		_classCallCheck(this, TileRegistry);

		Utils.assert($(mainParentSelector).length > 0, "Invalid parameter: parentSelector" + (mainParentSelector !== undefined ? " (" + mainParentSelector + ")" : ""));
		Utils.assert($(mainParentSelector).length === 1, "Invalid parentSelector (too many matches): " + mainParentSelector);

		this.mainParentSelector = mainParentSelector;
		this.choiceTileCount = choiceTileCount;

		this.mainTile = undefined;
		this.groups = {};

		this.maxGroup = undefined;
	}

	_createClass(TileRegistry, [{
		key: "_initGroup",
		value: function _initGroup(name) {
			var parentSelector = arguments.length <= 1 || arguments[1] === undefined ? this.groups[name].parentSelector : arguments[1];
			return (function () {
				Utils.assert(typeof name === "string" && name.length > 0, "Invalid parameter: name " + (name === undefined ? "" : name));

				Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + (parentSelector !== undefined ? " (" + parentSelector + ")" : ""));
				Utils.assert($(parentSelector).length === 1, "Invalid parentSelector (too many matches): " + parentSelector);

				$(parentSelector).find(".tile").remove();

				var registry = this;

				this.groups[name] = Object.defineProperties({
					registry: registry,
					name: name,
					parentSelector: parentSelector,
					tiles: []
				}, {
					totalValue: {
						get: function get() {
							// TODO where should the parenthesis be placed?
							// should PEMDAS be used or should each operation effect the previous total?

							// leave it to PEMDAS. ex: "7 * (11) + (49) - (39) + (23)"
							var valuesWithOperators = (this.choices || this.tiles).map(function (c) {
								return c.operation + " (" + c.value + ")";
							});
							var mathString = registry.mainTile.value + " " + valuesWithOperators.join(" ");

							// OR build on previous total. ex: "( ( ( ( 7 * 11 ) + 49 ) - 39) + 23 )"
							// parenthesis before = choice count
							// one after each choice

							return math.eval(mathString);
						},
						configurable: true,
						enumerable: true
					}
				});
			}).apply(this, arguments);
		}
	}, {
		key: "addGroup",
		value: function addGroup(name, parentSelector) {
			this._initGroup(name, parentSelector);
		}
	}, {
		key: "clearGroup",
		value: function clearGroup(name) {
			this._initGroup(name);
		}
	}, {
		key: "_genMainTile",
		value: function _genMainTile(diff) {
			if (this.mainTile !== undefined) {
				this.mainTile.remove();
				this.mainTile = undefined;
			}

			if (diff !== undefined) {
				this.mainTile = new Tile(Randomizer.getRandomTileData(diff, true).valueString, this.mainParentSelector);
			}
		}
	}, {
		key: "_genChoiceTiles",
		value: function _genChoiceTiles(groupName, diff, mainNumber) {
			Utils.assert(typeof groupName === "string" && this.groups[groupName] !== undefined, "Invalid group: " + groupName);

			if (diff === undefined) {
				this.clearGroup(groupName);
				return;
			}

			Utils.assert(mainNumber !== undefined, "_genChoiceTiles(...) must be called after main number is generated");
			Utils.assert(typeof mainNumber === "string" || typeof mainNumber === "number", "Invalid mainNumber: " + mainNumber);

			var group = this.groups[groupName];

			group.tiles.forEach(function (t) {
				return t.remove();
			});
			group.tiles = [];

			for ( // generate the tiles
			group.choices = []; group.choices.push(Randomizer.genSingleChoiceTile(diff, group, mainNumber)) < this.choiceTileCount;) {}

			for ( // shuffle the order
			var a = group.choices, rand = undefined, i = a.length; i > 0; rand = Randomizer.rand(0, --i), (_ref = [a[rand], a[i]], a[i] = _ref[0], a[rand] = _ref[1], _ref)) {
				var _ref;
			}

			group.tiles = group.choices.map(function (c) {
				return c.toTile(group.parentSelector);
			});

			$(group.parentSelector).attr("data-totalValue", group.totalValue);
		}
	}, {
		key: "generateTiles",
		value: function generateTiles(diff) {
			var _this = this;

			$(".max").removeClass("max");

			this._genMainTile(diff);
			Object.keys(this.groups).forEach(function (g) {
				return _this._genChoiceTiles(g, diff, _this.mainTile.value);
			});

			var totals = [];
			Utils.forEachIn(function (name, data) {
				totals.push(data.totalValue);
			}, this.groups);
			this.maxGroup = this.groups[Object.keys(this.groups)[totals.indexOf(math.max(totals))]];
			$(this.maxGroup.parentSelector).addClass("max");
		}
	}]);

	return TileRegistry;
})();

//# sourceMappingURL=TileRegistry.js.map