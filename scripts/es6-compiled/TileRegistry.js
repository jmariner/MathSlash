"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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
		this.choiceTileMap = {};
	}

	_createClass(TileRegistry, [{
		key: "_initGroup",
		value: function _initGroup(name) {
			var parentSelector = arguments.length <= 1 || arguments[1] === undefined ? this.choiceTileMap[name].parentSelector : arguments[1];
			return (function () {
				Utils.assert(typeof name === "string" && name.length > 0, "Invalid parameter: name " + (name === undefined ? "" : name));

				Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + (parentSelector !== undefined ? " (" + parentSelector + ")" : ""));
				Utils.assert($(parentSelector).length === 1, "Invalid parentSelector (too many matches): " + parentSelector);

				$(parentSelector).find(".tile").remove();

				this.choiceTileMap[name] = {
					parentSelector: parentSelector,
					tiles: []
				};
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
				this.mainTile = new Tile(TileRegistry.getRandomTileData(diff, true).valueString, this.mainParentSelector);
			}

			this.mainTile.show();
		}
	}, {
		key: "_genChoiceTiles",
		value: function _genChoiceTiles(groupName, diff, mainNumber) {
			Utils.assert(typeof groupName === "string" && this.choiceTileMap[groupName] !== undefined, "Invalid group: " + groupName);

			if (diff === undefined) {
				this.clearGroup(groupName);
				return;
			}

			Utils.assert(mainNumber !== undefined, "_genChoiceTiles(...) must be called after main number is generated");
			Utils.assert(typeof mainNumber === "string" || typeof mainNumber === "number", "Invalid mainNumber: " + mainNumber);

			var group = this.choiceTileMap[groupName];

			group.tiles.forEach(function (t) {
				return t.remove();
			});
			group.tiles = [];

			for (group.choices = []; group.choices.push(TileRegistry._genSingleChoiceTile(diff, group, mainNumber)) < this.choiceTileCount;) {}

			for (var a = group.choices, rand = undefined, i = a.length; i > 0; rand = Utils.rand(0, --i), (_ref = [a[rand], a[i]], a[i] = _ref[0], a[rand] = _ref[1], _ref)) {
				var _ref;
			}

			group.tiles = group.choices.map(function (c) {
				return new Tile(c.valueString, group.parentSelector);
			});

			group.tiles.forEach(function (t) {
				return t.show();
			});
		}
	}, {
		key: "generateTiles",
		value: function generateTiles(diff) {
			var _this = this;

			this._genMainTile(diff);
			Object.keys(this.choiceTileMap).forEach(function (g) {
				return _this._genChoiceTiles(g, diff, _this.mainTile.value);
			});
		}
	}], [{
		key: "_genSingleChoiceTile",
		value: function _genSingleChoiceTile(diff, group, mainNumber) {

			mainNumber = +mainNumber;

			var choice = TileRegistry.getRandomTileData(diff);
			var choicesSoFar = group.choices;

			var reRoll = function reRoll() {
				return TileRegistry.getRandomTileData(diff);
			};

			var count = function count(id) {
				var count = 0;
				choicesSoFar.forEach(function (c) {
					count += c.id === id;
				});
				return count;
			};

			var scope = function scope() {
				return { mainNumber: mainNumber, myCount: count(choice.id) };
			};

			while (choice.condition !== undefined && false === math.eval(choice.condition, scope())) {
				choice = reRoll();
			}
			return choice;
		}
	}, {
		key: "getRandomTileData",
		value: function getRandomTileData(difficulty) {
			var _Utils, _Utils2, _Utils3, _Utils4, _Utils5, _Utils6;

			var isMain = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
			// this pulls from difficulty.js

			Utils.assert(typeof difficulty === "number" && DIFFICULTY_DATA[difficulty] !== undefined, "Invalid difficulty: " + difficulty);

			var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

			var choice = Utils.pickWeightedRandom(choices);

			var value = undefined;
			switch (choice.type) {
				case "integer":
					value = (_Utils = Utils).rand.apply(_Utils, _toConsumableArray(choice.limits));
					break;
				case "fraction":
					value = "" + Utils.buildFraction((_Utils2 = Utils).rand.apply(_Utils2, _toConsumableArray(choice.numeratorLimits || [NaN])), (_Utils3 = Utils).rand.apply(_Utils3, _toConsumableArray(choice.denominatorLimits || NaN)), (_Utils4 = Utils).rand.apply(_Utils4, _toConsumableArray(choice.resultLimits || [NaN])) // TODO you are here
					).toString();
					break;
				case "power":
				case "exponent":
					value = (_Utils5 = Utils).rand.apply(_Utils5, _toConsumableArray(choice.baseLimits)) + " ^ " + (choice.power || (_Utils6 = Utils).rand.apply(_Utils6, _toConsumableArray(choice.powerLimits)));
					break;
				default:
					value = NaN;
			}

			var operation = isMain ? "" : choice.operation;

			//return operation + value;
			return {
				value: value,
				valueString: operation + value,
				operation: operation,
				condition: choice.condition
			};
		}
	}]);

	return TileRegistry;
})();

//# sourceMappingURL=TileRegistry.js.map