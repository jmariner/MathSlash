"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Randomizer = (function () {
    function Randomizer() {
        _classCallCheck(this, Randomizer);
    }

    _createClass(Randomizer, null, [{
        key: "rand",
        value: function rand(min, max, allowFloats) {
            if (min === undefined || Number.isNaN(min) || max === undefined || Number.isNaN(max)) return undefined;

            if (allowFloats) return min + Math.random() * (max - min);else return min + Math.floor(Math.random() * (max - min + 1));
        }
    }, {
        key: "pickWeightedRandom",
        value: function pickWeightedRandom(choices) {
            var ret = undefined;
            choices = $.extend(true, [], choices);
            if (choices.length === 1) ret = choices[0];else {
                var currentCumSum = 0;
                choices.forEach(function (c) {
                    Utils.assert(c.hasOwnProperty("weight"), "Invalid parameter format - each object in array needs a weight. (" + JSON.stringify(choices) + ")");
                    currentCumSum += c.weight;
                    c.cumSum = currentCumSum;
                });
                var r = Randomizer.rand(0, currentCumSum, true); // TODO this is inaccurate
                choices.forEach(function (c, i) {
                    if (r < c.cumSum && !ret) ret = choices[i];
                });
                delete ret.cumSum;
            }
            return ret;
        }
    }, {
        key: "genSingleChoiceTile",
        value: function genSingleChoiceTile(diff, group, mainNumber) {

            mainNumber = +mainNumber;

            var choice = Randomizer.getRandomTileData(diff);

            var reRoll = function reRoll() {
                return Randomizer.getRandomTileData(diff);
            };

            var count = function count(id) {
                var count = 0;
                group.choices.forEach(function (c) {
                    count += c.id === id;
                });
                return count;
            };

            var scope = function scope() {
                return {
                    mainNumber: mainNumber,
                    me: choice.value,
                    myCount: count(choice.id),
                    valueSoFar: group.totalValue
                };
            };

            while (choice.condition !== undefined && false === math.eval(choice.condition, scope())) {
                choice = reRoll();
            }
            while (choice.retryCondition !== undefined && math.eval(choice.retryCondition, scope())) {
                //TODO you are here
                console.log(choice.retryCondition + " is true. scope:");
                console.log(scope());
                choice.reRollMe(); // ex: if subtracting will make the result negative, reRoll the subtracted value
            }
            return choice;
        }
    }, {
        key: "getRandomTileData",
        value: function getRandomTileData(difficulty) {
            var isMain = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
            // this pulls from difficulty.js

            Utils.assert(typeof difficulty === "number" && DIFFICULTY_DATA[difficulty] !== undefined, "Invalid difficulty: " + difficulty);

            var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

            var choice = Randomizer.pickWeightedRandom(choices);

            var value = undefined;

            var roll = function roll() {
                var _Utils;

                switch (choice.type) {
                    case "integer":
                        value = (_Utils = Utils).rand.apply(_Utils, _toConsumableArray(choice.limits));
                        break;
                    case "fraction":
                        value = Utils.buildFraction(Randomizer.rand.apply(Randomizer, _toConsumableArray(choice.numeratorLimits || [NaN])), Randomizer.rand.apply(Randomizer, _toConsumableArray(choice.denominatorLimits || NaN)), Randomizer.rand.apply(Randomizer, _toConsumableArray(choice.resultLimits || [NaN]))).toString();
                        break;
                    case "power":
                    case "exponent":
                        value = Randomizer.rand.apply(Randomizer, _toConsumableArray(choice.baseLimits)) + " ^ " + (choice.power || Randomizer.rand.apply(Randomizer, _toConsumableArray(choice.powerLimits)));
                        break;
                    default:
                        value = NaN;
                }
            };

            roll();

            var operation = isMain ? "" : choice.operation;
            return {
                value: value,
                valueString: [operation, value].join(" "),
                operation: Tile.operations[operation],
                condition: choice.condition,
                retryCondition: choice.retryCondition,
                reRollMe: roll
            };
        }
    }]);

    return Randomizer;
})();

var RandomChoice = (function () {
    // TODO this

    function RandomChoice(choice) {
        var isMain = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        _classCallCheck(this, RandomChoice);

        this.value = undefined;
        this.operation = isMain ? "" : choice.operation;
        this.condition = choice.condition;
        this.retryCondition = choice.retryCondition;
        this.choice = choice;
    }

    _createClass(RandomChoice, [{
        key: "reRollMe",
        value: function reRollMe() {
            var _Utils2;

            switch (this.choice.type) {
                case "integer":
                    this.value = (_Utils2 = Utils).rand.apply(_Utils2, _toConsumableArray(this.choice.limits));
                    break;
                case "fraction":
                    this.value = Utils.buildFraction(Randomizer.rand.apply(Randomizer, _toConsumableArray(this.choice.numeratorLimits || [NaN])), Randomizer.rand.apply(Randomizer, _toConsumableArray(this.choice.denominatorLimits || NaN)), Randomizer.rand.apply(Randomizer, _toConsumableArray(this.choice.resultLimits || [NaN]))).toString();
                    break;
                case "power":
                case "exponent":
                    this.value = Randomizer.rand.apply(Randomizer, _toConsumableArray(this.choice.baseLimits)) + " ^ " + (this.choice.power || Randomizer.rand.apply(Randomizer, _toConsumableArray(this.choice.powerLimits)));
                    break;
                default:
                    this.value = NaN;
            }
        }
    }, {
        key: "valueString",
        get: function get() {
            return [this.operation, this.value].join(" ");
        }
    }]);

    return RandomChoice;
})();

//# sourceMappingURL=randomizer.js.map