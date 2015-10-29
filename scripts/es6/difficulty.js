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
				operation: "sub"
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
				operation: "sub"
			}
		]
	},

//----------------------DIFFICULTY 4-----------------------------
	{
		main: [
			{
				type: "integer",
				weight: 3,
				limits: [1, 12]//25]
			}/*,
			{
				type: "integer",
				weight: 1,
				limits: [1, 99]
			}*/
		],
		choices: [
			{
				type: "integer",
				condition: "mainNumber <= 12", // because multiplication tables
				limits: [1,12],
				weight: 20,
				operation: "multi",
				maxCount: 1
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
		main: [ { type: "power", baseLimits: [1,12], powerLimits: [2,2] }],
		choice: [ { type: "power", baseLimits: [1,12], powerLimits: [2,2] }]
	}
];