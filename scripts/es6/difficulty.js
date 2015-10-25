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
				iff: "mainNumber <= 12", // because multiplication tables
				weight: 1,
				operation: "multi"
			}
		]
	}
];

function pickWeightedRandom(choices) {
	var ret = undefined;
	choices = $.extend(true, [], choices);
	if (choices.length === 1) ret = choices[0];
	else {
		var currentCumSum = 0;
		choices.forEach(function(c){
			currentCumSum += c.weight;
			c.cumSum = currentCumSum;
		});
		var r = Utils.rand(0,currentCumSum, true);
		choices.forEach(function(c, i){
			if (r < c.cumSum && !ret) ret = choices[i];
		});
		delete ret.cumSum;
	}
	return {op: ret.operation || "", value: Utils.rand.apply(null, ret.limits)};
}

function generateTiles(diff) {
	$(".tile").remove();
	var main = pickWeightedRandom(DIFFICULTY_DATA[diff].main);
	var others = [];
	for( var i=0; i<=3; i++){
		others.push(pickWeightedRandom(DIFFICULTY_DATA[diff].choices));
	}

	window.mainTile = new Tile(main.op + main.value, ".bigTileArea");
	window.otherTiles = others.map((t) => (new Tile(t.op + " " + t.value, ".tileRow1")))

}