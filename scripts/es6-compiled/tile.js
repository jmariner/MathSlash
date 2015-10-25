"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = (function () {
	function Tile(value, parentSelector) {
		var _this = this;

		var size = arguments.length <= 2 || arguments[2] === undefined ? "100%" : arguments[2];

		_classCallCheck(this, Tile);

		Utils.assert(typeof value === "string", "Invalid parameter: value" + (value !== undefined ? " (" + value + ")" : ""));

		if (Tile._isOperator(value.charAt(0)) !== undefined && /^\d+$/.test(value.substr(1))) {
			this.operation = Tile.operations[value.charAt(0)];
			this.value = value.substr(1);
		} else if (Tile._isOperator(value.split(" ")[0]) !== undefined && /^\d+$/.test(value.split(" ")[1])) {
			this.operation = Tile.operations[value.split(" ")[0]];
			this.value = value.split(" ")[1];
		} else if (/^\d+$/.test(value)) {
			this.value = value;
			this.operation = undefined;
		}

		try {
			math.parse(this.value);
		} catch (e) {
			throw "Invalid parameter: value" + (value !== undefined ? " (" + value + ")" : "");
		}

		this.parentSelector = parentSelector;
		this.size = size;

		this.$element = $("<div>").addClass("tile");
		if (this.operation !== undefined) this.$element.attr("data-operation", this.operation);
		this.element = this.$element.get(0);

		var mathNode = math.parse(this.value);
		this.computedValue = mathNode.compile().eval();

		var tex = mathNode.toTex({ parenthesis: "auto" });

		this.element.innerHTML = "$$ " + tex + " $$";

		this.$element.hide().appendTo($(this.parentSelector).addClass("tileParent")).fadeIn(250);

		this.$element.outerHeight(this.size);
		this.$element.remove().appendTo($(this.parentSelector));
		this.$element.outerWidth(this.$element.outerHeight());

		MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element], function () {
			return Utils.scaleToFit(_this.$element, ".math", .9);
		});
	}

	_createClass(Tile, null, [{
		key: "_isOperator",
		value: function _isOperator(op) {
			return Tile.operations.hasOwnProperty(op);
		}
	}]);

	return Tile;
})();

Tile.operations = {};
Tile.operations["+"] = Tile.operations.plus = Tile.operations.add = Tile.operations.addition = "+";
Tile.operations["-"] = Tile.operations.sub = Tile.operations.subtract = Tile.operations.minus = "-";
Tile.operations["*"] = Tile.operations.multi = Tile.operations.times = Tile.operations.multiply = "*";
Tile.operations["/"] = Tile.operations.div = Tile.operations.divide = Tile.operations.over = "/";

//# sourceMappingURL=tile.js.map