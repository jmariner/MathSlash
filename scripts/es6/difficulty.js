var GAME_DATA = {
	GREATEST_SUM: [

		//-------GREATEST SUM---------INDEX 0: OPTIONS--------------------
		{
			usesMainTile: false,
			mainTileText: "GREATEST\nSUM\nMODE"
		},

		//------GREATEST SUM---------DIFFICULTY 1-----------------------------
		{
			options: {
				timeLimit: 10, //seconds
				wrongPenalty: 0.75 // ratio of initial time to remove on wrong answer
			},
			choices: [
				{
					type: "integer",
					weight: 1,
					limits: [1, 50]
				}
			]
		},

		//-----GREATEST SUM---------DIFFICULTY 2-----------------------------
		{
			options: {
				timeLimit: 20,
				wrongPenalty: 0.75
			},
			choices: [
				{
					type: "integer",
					weight: 3,          // this means it is 3x more likely than a weight of 1
					limits: [1, 99]
				},
				{
					type: "integer",
					weight: 1,
					limits: [-50, -1]
				}
			]
		}
	],
	TRIG_CIRCLE: [null],
	MULTI_TABLE: [null]
};

Utils.forEachIn(function(mode, modeArray) { // for each game mode
	modeArray.slice(1).forEach(function(diffGroup, diff) { // for each difficulty (skip index 0 b/c options)

		Utils.forEachIn(function (type, typeData) { // for each type (main/choices)

			if (type !== "options") {
				typeData.forEach(function (data) { // for each choice
					data.id = [mode, diff, type, typeData.indexOf(data)].join("_");
				}); // end for each choice
			}

		}, diffGroup); // end for each type

	}); // end for each difficulty
}, GAME_DATA);

var GAME_MODES = {
	GREATEST_SUM: "GREATEST_SUM",
	TRIG_CIRCLE: "TRIG_CIRCLE",
	MULTI_TABLE: "MULTI_TABLE"
};