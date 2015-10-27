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
				this.mainTile = new Tile(TileRegistry.getRandomTileValue(diff, true), this.mainParentSelector);
			}

			this.mainTile.show();
		}
	}, {
		key: "_genChoiceTiles",
		value: function _genChoiceTiles(diff, groupName) {
			var group = this.choiceTileMap[groupName];

			group.tiles.forEach(function (t) {
				return t.remove();
			});

			group.tiles = Array.apply(null, { length: this.choiceTileCount }).map(function () {
				return new Tile(TileRegistry.getRandomTileValue(diff), group.parentSelector);
			});

			group.tiles.forEach(function (t) {
				return t.show();
			});

			//noinspection StatementWithEmptyBodyJS
			//for(
			//	var tiles = [];
			//	tiles.length <= this.choiceTileCount;       // this works too - just not as cool
			//	tiles.push(TileRegistry.getRandomTileValue(diff))
			//);
		}
	}, {
		key: "generateTiles",
		value: function generateTiles(diff) {
			var _this = this;

			this._genMainTile(diff);
			Object.keys(this.choiceTileMap).forEach(function (g) {
				return _this._genChoiceTiles(diff, g);
			});
		}
	}]);

	return TileRegistry;
})();

TileRegistry.getRandomTileValue = function (difficulty) {
	var _Utils, _Utils2, _Utils3;

	var main = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	// this pulls from difficulty.js
	var choice = Utils.pickWeightedRandom(DIFFICULTY_DATA[difficulty][main ? "main" : "choices"]);

	var value = undefined;
	switch (choice.type) {
		case "integer":
			value = (_Utils = Utils).rand.apply(_Utils, _toConsumableArray(choice.limits));
			break;
		case "fraction":
			// TODO do fraction stuff
			break;
		case "power":
		case "exponent":
			value = (_Utils2 = Utils).rand.apply(_Utils2, _toConsumableArray(choice.baseLimits)) + " ^ " + (choice.power || (_Utils3 = Utils).rand.apply(_Utils3, _toConsumableArray(choice.powerLimits)));
			break;
		default:
			value = NaN;
	}

	var oper = choice.hasOwnProperty("operation") ? choice.operation : "";

	return oper + value;
};

//# sourceMappingURL=TileRegistry.js.map