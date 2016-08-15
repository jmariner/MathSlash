class Randomizer {

	static rand(min, max, allowFloats) {
		if (min === undefined ||Number.isNaN(min) || max === undefined || Number.isNaN(max)) return undefined;

		if (allowFloats)
			return min + (Math.random() * (max-min));
		else
			return min + Math.floor(Math.random() * (max-min+1));
	}

	static fromArray(a) {
		var r = Randomizer.rand(0, a.length-1, false);
		return a[r];
	}

	static pickWeightedRandom(choices) {
		var ret = undefined;
		choices = $.extend(true, [], choices);
		if (choices.length === 1) ret = choices[0];
		else {
			var currentCumSum = 0;
			choices.forEach(function(c){
				currentCumSum += c.weight;
				c.cumSum = currentCumSum;
			});
			var r = Randomizer.rand(0, currentCumSum, true); // TODO this is inaccurate-ish
			choices.forEach(function(c, i){
				if (r < c.cumSum && !ret) ret = choices[i];
			});
			delete ret.cumSum;
		}
		return ret;
	}

	static genSingleChoiceTile(gameMode, diff) {
		return Randomizer.getRandomTileData(gameMode, diff);
	}

	static getRandomTileData(gameMode, difficulty) { // this pulls from difficulty.js

		var choices = GAME_DATA[gameMode][difficulty].choices;

		var rand = Randomizer.pickWeightedRandom(choices);
		var choice = new RandomChoice(rand);
		choice.randomize();

		return choice;
	}
}

class RandomChoice {
	constructor(choice) {
		this.value = undefined;
		this.choice = choice;
	}

	get valueString() {
		return ""+this.value;
	}

	toTile() {
		return new NumberTile(this.valueString);
	}

	randomize() {
		switch (this.choice.type) {
			case "integer":
				this.value = Randomizer.rand(...this.choice.limits);
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

class RandomTrigChoice {
	constructor() {
		this.value = undefined;
		this.choices = [
			"0",
			"pi/6", "pi/4", "pi/3",
			"pi/2",
			"(2pi)/3", "(3pi)/4", "(5pi)/6",
			"pi",
			"(7pi)/6", "(5pi)/4", "(4pi)/3",
			"(3pi)/2",
			"(5pi)/3", "(7pi)/4", "(11pi)/6"
		];
	}

	toTile() {
		return new NumberTile(this.value);
	}

	randomize() {
		var trig = Randomizer.fromArray(["sin", "cos"]);
		var inside = Randomizer.fromArray(this.choices);
		this.value = trig + `(${inside})`;
	}

	getCircleValue() {
		var match = undefined;
		new RandomTrigCircleChoice().choices.forEach(c => {
			if (!match && math.compile(`${c} == ${this.value}`).eval())
				match = c;
		});
		return match;
	}
}

class RandomTrigCircleChoice {
	constructor(exceptArray) {
		this.exceptArray = exceptArray;
		this.value = undefined;
		this.choices = [
			"0",
			"1", "-1",
			"1/2", "-1/2",
			"sqrt(3)/2", "-sqrt(3)/2",
			"1/sqrt(2)", "-1/sqrt(2)"
		];
	}

	toTile() {
		return new TrigCircleTile(this.value);
	}

	randomize() {

		this.value = ""+Randomizer.fromArray(_.without(this.choices, this.exceptArray));
	}
}