"use strict";

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
		operation: "sub" // TODO (2) prevent final answer from being negative
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
		limits: [1, 12],
		weight: 20,
		operation: "multi",
		conditions: ["mainNumber <= 12", "myCount < 1"]
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
	main: [{
		type: "integer",
		limits: [1, 50],
		weight: 1
	}],
	choices: [{
		type: "power",
		baseLimits: [2, 12],
		power: 2,
		weight: 50,
		operation: "add"
	}, {
		type: "fraction",
		resultLimits: [2, 12],
		denominatorLimits: [2, 12],
		weight: 500,
		operation: "add"
	}, {
		type: "integer",
		limits: [1, 50],
		weight: 2,
		operation: "add"
	}, {
		type: "integer",
		limits: [1, 50],
		weight: 2,
		operation: "sub"
	}]
}];

DIFFICULTY_DATA.forEach(function (diffGroup, diff) {
	// for each difficulty

	Utils.forEachIn(function (type, typeData) {
		// for each type (main/choices)

		typeData.forEach(function (data) {
			// for each choice
			data.id = [diff, type, typeData.indexOf(data)].join("_");
			if (data.hasOwnProperty("conditions")) data.condition = data.conditions.join(" and ");
		}); // end for each choice
	}, diffGroup); // end for each type
}); // end for each difficulty

/*
class Choice {
    constructor(diff, isMain=false) {
        this.which = isMain ? "main" : "choices";
        this.diff = diff;
		this.data = undefined;
    }

	get id() {
		return [
			this.diff,
			this.which.charAt(0),
			DIFFICULTY_DATA[this.diff][this.which].indexOf(this.data)
		].join(".");
	}
}

function _genSingleChoiceTile(diff, group, mainNumber) {

	mainNumber = +mainNumber;

	var choice = TileRegistry.getRandomTileData(diff);
	var choicesSoFar = group.choices;

	var reRoll = () => TileRegistry.getRandomTileData(diff);

	//called before adding any more elements, preventing going over max
	var hasMax = function(choices) { // currently limited to one option with maxCount; need some sort of ID system to determine which choice is which
		var count = 0;
		var max = 0;
		return choices.some(function(c){
			if (c.maxCount !== undefined) {
				if (max === 0) max = c.maxCount;
				if (max > 0 && max === ++count) return true;
			}
		});
	};

	var success = false;
	while (!success && ((choice.condition !== undefined) || (choice.maxCount !== undefined))) {
		success = true;
		while (choice.condition !== undefined && math.eval(choice.condition, {mainNumber}) === false) {
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

function getRandomTileData(difficulty, isMain=false) {

	var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

	// get the random choice from the diff data
	var choice = Utils.pickWeightedRandom(choices);

	// compute the value using given limits and type
	var value = undefined;
	switch (choice.type) {
		case "integer":
			value = Utils.rand(...choice.limits);
			break;
		case "fraction":
			break;
		case "power":
		case "exponent":
			value = `${Utils.rand(...choice.baseLimits)} ^ ${choice.power || Utils.rand(...choice.powerLimits)}`;
			break;
		default:
			value = NaN;
	}

	var operation = isMain ? "" : choice.operation;

	return {
		value,
		valueString: operation+value,
		operation,
		condition: choice.condition,
		maxCount: choice.maxCount
	};
}*/

//# sourceMappingURL=difficulty.js.map