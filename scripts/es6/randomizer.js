class Randomizer {

	static rand(min, max, allowFloats) {
		if (min === undefined ||Number.isNaN(min) || max === undefined || Number.isNaN(max)) return undefined;

		if (allowFloats)
			return min + (Math.random() * (max-min));
		else
			return min + Math.floor(Math.random() * (max-min+1));
	}

	static pickWeightedRandom(choices) {
		var ret = undefined;
		choices = $.extend(true, [], choices);
		if (choices.length === 1) ret = choices[0];
		else {
			var currentCumSum = 0;
			choices.forEach(function(c){
				Utils.assert(c.hasOwnProperty("weight"),
					`Invalid parameter format - each object in array needs a weight. (${JSON.stringify(choices)})`);
				currentCumSum += c.weight;
				c.cumSum = currentCumSum;
			});
			var r = Randomizer.rand(0,currentCumSum, true); // TODO this is inaccurate
			choices.forEach(function(c, i){
				if (r < c.cumSum && !ret) ret = choices[i];
			});
			delete ret.cumSum;
		}
		return ret;
	}

	static genSingleChoiceTile(diff/*, group, mainNumber*/) {

		//noinspection UnnecessaryLocalVariableJS
		var choice = Randomizer.getRandomTileData(diff);

		/* Retry conditions have been disabled until more work is done
		 mainNumber = +mainNumber;

		 var reRoll = () => Randomizer.getRandomTileData(diff);

		var count = function(id) {
			let count = 0;
			group.choices.forEach(c => { count += c.id === id });
			return count;
		};

		var scope = () => ({
			mainNumber,
			me: choice,
			myCount: count(choice.id),
			valueSoFar: group.totalValue,
			myIndex: group.choices.length,
			finalIndex: group.registry.choiceTileCount,
			previous: group.choices[group.choices.length-1] || group.registry.mainTile
		});

		while (choice.condition !== undefined && false === Utils.compare(choice.condition, scope())) {
			choice = reRoll();
		}
		while (choice.retryCondition !== undefined && Utils.compare(choice.retryCondition, scope()) ) {
			choice.randomize();
		}*/
		return choice;
	}

	static getRandomTileData(difficulty, isMain=false) { // this pulls from difficulty.js

		Utils.assert(typeof difficulty === "number" && DIFFICULTY_DATA[difficulty] !== undefined,
			`Invalid difficulty: ${difficulty}`);

		var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

		var rand = Randomizer.pickWeightedRandom(choices);
		var choice = new RandomChoice(rand);
		choice.randomize();

		return choice;
	}
}

class RandomChoice {
	constructor(choice) {
		this.value = undefined;
		this.condition = choice.condition;
		this.retryCondition = choice.retryCondition;
		this.choice = choice;
	}

	get valueString() {
		return [this.choice.operation, this.value].join(" ");
	}

	toTile(parentSel) {
		return new Tile(this.valueString, parentSel, true);
	}

	get operation() {
		return this.toTile().operation;
	}

	randomize() {
		switch (this.choice.type) {
			case "integer":
				this.value = Utils.rand(...this.choice.limits);
				break;
			case "fraction":
				this.value = Utils.buildFraction(
					Randomizer.rand(...(this.choice.numeratorLimits || [NaN])),
					Randomizer.rand(...(this.choice.denominatorLimits || NaN)),
					Randomizer.rand(...(this.choice.resultLimits || [NaN]))
				).toString();
				break;
			case "power":
			case "exponent":
				this.value = `${Randomizer.rand(...this.choice.baseLimits)} ^ ${this.choice.power ||
				Randomizer.rand(...this.choice.powerLimits)}`;
				break;
			default:
				this.value = NaN;
		}
	}
}