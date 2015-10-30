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
                var r = Randomizer.rand(0, currentCumSum, true);
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
            var choicesSoFar = group.choices;

            var reRoll = function reRoll() {
                return Randomizer.getRandomTileData(diff);
            };

            var count = function count(id) {
                var count = 0;
                choicesSoFar.forEach(function (c) {
                    count += c.id === id;
                });
                return count;
            };

            var scope = function scope() {
                return { mainNumber: mainNumber, myCount: count(choice.id) };
            };

            while (choice.condition !== undefined && false === math.eval(choice.condition, scope())) {
                choice = reRoll(); // TODO (1) reRoll the problematic value instead of entire choice?
                // ex: if subtracting will make the result negative, reRoll the subtracted value
            }
            return choice;
        }
    }, {
        key: "getRandomTileData",
        value: function getRandomTileData(difficulty) {
            var _Utils;

            var isMain = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
            // this pulls from difficulty.js

            Utils.assert(typeof difficulty === "number" && DIFFICULTY_DATA[difficulty] !== undefined, "Invalid difficulty: " + difficulty);

            var choices = DIFFICULTY_DATA[difficulty][isMain ? "main" : "choices"];

            var choice = Randomizer.pickWeightedRandom(choices);

            var value = undefined;
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

            var operation = isMain ? "" : choice.operation;

            //return operation + value;
            return {
                value: value,
                valueString: [operation, value].join(" "),
                operation: operation,
                condition: choice.condition // TODO (1) return a function to randomize the value (again?)
            };
        }
    }]);

    return Randomizer;
})();

//# sourceMappingURL=randomizer.js.map