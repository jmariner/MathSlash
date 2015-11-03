var DIFFICULTY_DATA = [null,

//----------------------DIFFICULTY 1-----------------------------
	{
		main: [
			{
				type: "integer",
				weight: 1,
				limits: [1,50]
			}
		],
		choices: [
			{
				type: "integer",
				weight: 1,
				limits: [1, 50],
				operation: "add"
			}
		]
	},

//----------------------DIFFICULTY 2-----------------------------
		{
		main: [
			{
				type: "integer",
				weight: 1,
				limits: [1, 50]
			}
		],
		choices: [
			{
				type: "integer",
				weight: 3,
				limits: [1, 99],
				operation: "add"
			},
			{
				type: "integer",
				weight: 1,
				limits: [1, 50],
				operation: "sub",
				retryConditions: [
					"valueSoFar < me and myIndex == 0"
				]
			}
		]
	},

//----------------------DIFFICULTY 3-----------------------------
	{
		main: [
			{
				type: "integer",
				weight: 1,
				limits: [1,500]
			}
		],
		choices: [
			{
				type: "integer",
				weight: 1,
				limits: [1, 500],
				operation: "add"
			},
			{
				type: "integer",
				weight: 1,
				limits: [1,500],
				operation: "sub",
				retryConditions: [
					"valueSoFar < me and myIndex == 0"
				]
			}
		]
	},

//----------------------DIFFICULTY 4-----------------------------
	{
		main: [
			{
				type: "integer",
				weight: 10,
				limits: [1, 25]
			},
			{
				type: "integer",
				weight: 1,
				limits: [1, 99]
			}
		],
		choices: [
			{
				type: "integer",
				limits: [1,12],
				weight: 20,
				operation: "multi",
				conditions: [
					"mainNumber <= 12",
					"myCount < 1"
				]
			},
			{
				type: "integer",
				limits: [1,50],
				weight: 1,
				operation: "add"
			},
			{
				type: "integer",
				limits: [1,50],
				weight: 1,
				operation: "sub"
			}
		]
	},
	{
		main: [
			{
				type: "integer",
				limits: [1,50],
				weight: 1
			}
		],
		choices: [
			{
				type: "power",
				baseLimits: [2,12],
				power: 2,
				weight: 50,
				operation: "add"
			},
			{
				type: "fraction",
				resultLimits: [2,12],
				denominatorLimits: [2,12],
				weight: 500,
				operation: "add"
			},
			{
				type: "integer",
				limits: [1,50],
				weight: 2,
				operation: "add"
			},
			{
				type: "integer",
				limits: [1,50],
				weight: 2,
				operation: "sub"
			}
		]
	}
];

DIFFICULTY_DATA.forEach(function(diffGroup, diff) { // for each difficulty

	Utils.forEachIn(function (type, typeData) { // for each type (main/choices)

		typeData.forEach(function (data) { // for each choice
			data.id = [diff, type, typeData.indexOf(data)].join("_");
			if (data.hasOwnProperty("conditions"))
				data.condition = data.conditions.join(" and ");
			if (data.hasOwnProperty("retryConditions"))
				data.retryCondition = data.retryConditions.join(" or ");
		}); // end for each choice

	}, diffGroup); // end for each type

}); // end for each difficulty
