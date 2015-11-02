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

    static genSingleChoiceTile(diff, group, mainNumber) {

        mainNumber = +mainNumber;

        var choice = Randomizer.getRandomTileData(diff);

        var reRoll = () => Randomizer.getRandomTileData(diff);

        var count = function(id) {
            let count = 0;
            group.choices.forEach(c => { count += c.id === id });
            return count;
        };

        var scope = () => ({
            mainNumber,
            me: choice.value,
            myCount: count(choice.id),
            valueSoFar: group.totalValue
        });

        while (choice.condition !== undefined && false === math.eval(choice.condition, scope())) {
            choice = reRoll();
        }
        while (choice.retryCondition !== undefined && math.eval(choice.retryCondition, scope()) ) { //TODO you are here
            console.log(choice.retryCondition + " is true. scope:");
	        console.log(scope());
            choice.reRollMe(); // ex: if subtracting will make the result negative, reRoll the subtracted value
        }
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

        /*var operation = isMain ? "" : choice.operation;
        return {
            value,
            valueString: [operation,value].join(" "),
            operation: Tile.operations[operation],
            condition: choice.condition,
	        retryCondition: choice.retryCondition,
            reRollMe: roll
        };*/
    }
}

class RandomChoice { // TODO this
	constructor(choice, isMain=false) {
		this.value = undefined;
		this.operation = isMain ? "" : choice.operation;
		this.condition = choice.condition;
		this.retryCondition = choice.retryCondition;
		this.choice = choice;
	}

	get valueString() {
		return [this.operation, this.value].join(" ");
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