"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = (function () {
		// TODO TileRegistry - where tiles are created and can be looked up and changed
		// TODO one registry per row - have them also store the main tile?

		function Tile(value, parentSelector) {
				var _this = this;

				var size = arguments.length <= 2 || arguments[2] === undefined ? "100%" : arguments[2];

				_classCallCheck(this, Tile);

				Utils.assert(typeof value === "string", "Invalid parameter: value" + (value !== undefined ? " (" + value + ")" : ""));
				Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + (parentSelector !== undefined ? " (" + parentSelector + ")" : ""));
				Utils.assert($(parentSelector).length === 1, "Invalid parentSelector (too many matches): " + parentSelector);

				var valueRegex = /^([^\d\s]*)\s?(\d+(?:(\/|\^)\d+)?)$/.exec(value);

				Utils.assert(valueRegex !== null, "Invalid parameter: value (" + value + ")");

				var operatorPart = valueRegex[1];
				var valuePart = valueRegex[2];
				var typePart = valueRegex[3];

				this.value = valuePart;

				if (operatorPart !== "") {
						Utils.assert(Tile._isOperator(operatorPart), "Invalid operation in value: " + operatorPart);
						this.operation = Tile.operations[operatorPart];
				} else this.operation = undefined;

				var isInteger = typePart === undefined;

				try {
						math.parse(this.value);
				} catch (e) {
						throw "Cannot parse math: " + value;
				}

				this.parentSelector = parentSelector;
				this.size = size;

				this.$element = $("<div>").addClass("tile");
				if (this.operation !== undefined) this.$element.attr("data-operation", this.operation);
				this.element = this.$element.get(0);

				var mathNode = math.parse(this.value);
				this.computedValue = mathNode.compile().eval();
				this.$element.attr("data-value", this.computedValue);

				if (isInteger) this.$element.html($("<div>").addClass("math").text(this.value));else {
						var tex = mathNode.toTex({ parenthesis: "auto" });
						this.element.innerHTML = "$$ " + tex + " $$";
				}

				this.$element.hide().appendTo($(this.parentSelector)).fadeIn(250);

				this.$element.outerHeight(this.size);
				this.$element.remove().appendTo($(this.parentSelector));
				this.$element.outerWidth(this.$element.outerHeight());

				if (!isInteger) {
						MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element], function () {
								return Utils.scaleToFit(_this.$element, ".math", .9);
						});
				} else Utils.scaleToFit(this.$element, ".math");
		}

		_createClass(Tile, null, [{
				key: "_isOperator",
				value: function _isOperator(op) {
						return Tile.operations.hasOwnProperty(op);
				}
		}]);

		return Tile;
})();

Tile.operations = {
		"+": "+",
		plus: "+",
		add: "+",
		addition: "+",

		"-": "-",
		sub: "-",
		subtract: "-",
		minus: "-",

		"*": "*",
		times: "*",
		multi: "*",
		multiply: "*"

};

//# sourceMappingURL=tile.js.map