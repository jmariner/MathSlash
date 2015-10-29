"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DIFFICULTY_DATA = [null,

//----------------------DIFFICULTY 1-----------------------------
{
	main: [{
		type: "integer",
		weight: 1,
		limits: [1, 50]
	}],
	choices: [{
		type: "integer",
		weight: 1,
		limits: [1, 50],
		operation: "add"
	}]
},

//----------------------DIFFICULTY 2-----------------------------
{
	main: [{
		type: "integer",
		weight: 1,
		limits: [1, 50]
	}],
	choices: [{
		type: "integer",
		weight: 3,
		limits: [1, 99],
		operation: "add"
	}, {
		type: "integer",
		weight: 1,
		limits: [1, 50],
		operation: "sub"
	}]
},

//----------------------DIFFICULTY 3-----------------------------
{
	main: [{
		type: "integer",
		weight: 1,
		limits: [1, 500]
	}],
	choices: [{
		type: "integer",
		weight: 1,
		limits: [1, 500],
		operation: "add"
	}, {
		type: "integer",
		weight: 1,
		limits: [1, 500],
		operation: "sub"
	}]
},

//----------------------DIFFICULTY 4-----------------------------
{
	main: [{
		type: "integer",
		weight: 10,
		limits: [1, 25]
	}, {
		type: "integer",
		weight: 1,
		limits: [1, 99]
	}],
	choices: [{
		type: "integer",
		condition: "mainNumber <= 12", // because multiplication tables
		limits: [1, 12],
		weight: 20,
		operation: "multi",
		maxCount: 1
	}, {
		type: "integer",
		limits: [1, 50],
		weight: 1,
		operation: "add"
	}, {
		type: "integer",
		limits: [1, 50],
		weight: 1,
		operation: "sub"
	}]
}, {
	main: [{ type: "power", baseLimits: [1, 12], powerLimits: [2, 2] }],
	choice: [{ type: "power", baseLimits: [1, 12], powerLimits: [2, 2] }]
}];

var DATA = []; // compile DIFFICULTY_DATA to a map: conditions -> choice instead of array of choices
// conditions include maxCount and custom condition property
DIFFICULTY_DATA.forEach(function (diffGroup) {
	for (var type in diffGroup) {
		var typeData = diffGroup[type];
		typeData.forEach(function (data) {
			var conds = [];
			if (data.hasOwnProperty("condition")) conds.push(data.condition);
			if (data.hasOwnProperty("maxCount")) conds.push("countOfMe < " + data.maxCount);
			return conds.join(" && ");
		});
	}
});

var Choice = (function () {
	function Choice(diff) {
		var isMain = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		_classCallCheck(this, Choice);

		this.which = isMain ? "main" : "choices";
		this.diff = diff;
		this.data = undefined;
	}

	_createClass(Choice, [{
		key: "id",
		get: function get() {
			return [this.diff, this.which.charAt(0), DIFFICULTY_DATA[this.diff][this.which].indexOf(this.data)].join(".");
		}
	}]);

	return Choice;
})();

function _genSingleChoiceTile(diff, group, mainNumber) {

	mainNumber = +mainNumber;

	var choice = TileRegistry.getRandomTileData(diff);
	var choicesSoFar = group.choices;

	var reRoll = function reRoll() {
		return TileRegistry.getRandomTileData(diff);
	};

	//called before adding any more elements, preventing going over max
	var hasMax = function hasMax(choices) {
		// currently limited to one option with maxCount; need some sort of ID system to determine which choice is which
		var count = 0;
		var max = 0;
		return choices.some(function (c) {
			if (c.maxCount !== undefined) {
				if (max === 0) max = c.maxCount;
				if (max > 0 && max === ++count) return true;
			}
		});
	};

	var success = false;
	while (!success && (choice.condition !== undefined || choice.maxCount !== undefined)) {
		success = true;
		while (choice.condition !== undefined && math.eval(choice.condition, { mainNumber: mainNumber }) === false) {
			choice = reRoll();
			success = false;
		}
		while (choice.maxCount !== undefined && hasMax(choicesSoFar)) {
			choice = reRoll();
			success = false;
		}
	}
	return choice;
}

function getRandomTileData(difficulty) {
	var _Utils, _Utils2, _Utils3;

	var isMain = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

	// get the random choice from the diff data
	var choice = Utils.pickWeightedRandom(choices);

	// compute the value using given limits and type
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

	var operation = isMain ? "" : choice.operation;

	return {
		value: value,
		valueString: operation + value,
		operation: operation,
		condition: choice.condition,
		maxCount: choice.maxCount
	};
}

//# sourceMappingURL=difficulty.js.map