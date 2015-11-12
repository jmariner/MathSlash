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
	options: {
		timeLimit: 20 //seconds
	},
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
		operation: "sub" /*,
                   retryConditions: [
                   "valueSoFar < me and myIndex == 0"
                   ]*/
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
		operation: "sub" /*,
                   retryConditions: [
                   "valueSoFar < me and myIndex == 0"
                   ]*/
	}]
},

//----------------------DIFFICULTY 4-----------------------------
{
	options: {
		// TODO difficulty-specific options
		shuffle: false
	},
	main: [{
		type: "integer",
		weight: 10,
		limits: [1, 12]
	}, {
		type: "integer",
		weight: 0,
		limits: [1, 99]
	}],
	choices: [/* IDEA: store a copy of diff data and set weight to 0 if conditions are not met (PREcondtitions maybe?)
              reset the copy for each new tile created - this will remove the need to reRoll a tile forever because it will never roll to the same one again
              this still doesn't fix the fact that having too many conditions greatly reduces the chance of a choice being picked
              maybe increase chances if condition is met? this needs a lot more work to be fully modular
              */
	{
		type: "integer",
		limits: [2, 12],
		weight: 5,
		operation: "multi",
		conditions: [// TODO this is nearly impossible to have these 4 all true - make it so it changes main number or previous instead of itself
		"mainNumber <= 12", // 5x the weight seems to counter it pretty well though - more than 2/3 of the first ones are this
		"previous.value <= 12", "previous.operation != '-'", "myCount < 1"]
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
		weight: 5,
		operation: "add"
	}, {
		type: "fraction",
		resultLimits: [2, 12],
		denominatorLimits: [2, 12],
		weight: 5,
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

		if (/^main|choices$/.test(type)) {
			typeData.forEach(function (data) {
				// for each choice
				data.id = [diff, type, typeData.indexOf(data)].join("_");
				if (data.hasOwnProperty("conditions")) data.condition = data.conditions.join(" and ");
				if (data.hasOwnProperty("retryConditions")) data.retryCondition = data.retryConditions.join(" or ");
			}); // end for each choice
		}
	}, diffGroup); // end for each type
}); // end for each difficulty

//# sourceMappingURL=difficulty.js.map