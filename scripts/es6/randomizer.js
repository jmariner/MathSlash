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
            var r = Randomizer.rand(0,currentCumSum, true);
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
        var choicesSoFar = group.choices;

        var reRoll = () => Randomizer.getRandomTileData(diff);

        var count = function(id) {
            let count = 0;
            choicesSoFar.forEach(c => { count += c.id === id });
            return count;
        };

        var scope = () => ({mainNumber, myCount: count(choice.id)});

        while (choice.condition !== undefined && false === math.eval(choice.condition, scope())) {
            choice = reRoll(); // TODO (1) reRoll the problematic value instead of entire choice?
                                // ex: if subtracting will make the result negative, reRoll the subtracted value
        }
        return choice;
    }

    static getRandomTileData(difficulty, isMain=false) { // this pulls from difficulty.js

        Utils.assert(typeof difficulty === "number" && DIFFICULTY_DATA[difficulty] !== undefined,
            `Invalid difficulty: ${difficulty}`);

        var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

        var choice = Randomizer.pickWeightedRandom(choices);

        var value = undefined;
        switch (choice.type) {
            case "integer":
                value = Utils.rand(...choice.limits);
                break;
            case "fraction":
                value = Utils.buildFraction(
                    Randomizer.rand(...(choice.numeratorLimits || [NaN])),
                    Randomizer.rand(...(choice.denominatorLimits || NaN)),
                    Randomizer.rand(...(choice.resultLimits || [NaN]))
                ).toString();
                break;
            case "power":
            case "exponent":
                value = `${Randomizer.rand(...choice.baseLimits)} ^ ${choice.power ||
                    Randomizer.rand(...choice.powerLimits)}`;
                break;
            default:
                value = NaN;
        }

        var operation = isMain ? "" : choice.operation;

        //return operation + value;
        return {
            value,
            valueString: [operation,value].join(" "),
            operation,
            condition: choice.condition // TODO (1) return a function to randomize the value (again?)
        };
    }
}