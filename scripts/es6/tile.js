class Tile { // TODO TileRegistry - where tiles are created and can be looked up and changed
			 // TODO one registry per row - have them also store the main tile?
	constructor(value, parentSelector, size="100%") {

		Utils.assert(typeof value === "string", "Invalid parameter: value" + ((value !== undefined) ? ` (${value})` : ""));

		var valueRegex = /^([^\d\s]*)\s?(\d+(?:(\/|\^)\d+)?)$/.exec(value);

		Utils.assert(valueRegex !== null, `Invalid parameter: value (${value})`);

		var operatorPart = valueRegex[1];
		var valuePart = valueRegex[2];
		var typePart = valueRegex[3];

		this.value = valuePart;

		if (operatorPart !== "") {
			Utils.assert(Tile._isOperator(operatorPart), `Invalid operation in value: ${operatorPart}`);
			this.operation = Tile.operations[operatorPart];
		}
		else this.operation = undefined;

		var isInteger = typePart === undefined;

		try { math.parse(this.value); }
		catch(e) { throw `Cannot parse math: ${value}`; }

		this.parentSelector = parentSelector;
		this.size = size;

		this.$element = $("<div>").addClass("tile");
		if (this.operation !== undefined) this.$element.attr("data-operation", this.operation);
		this.element = this.$element.get(0);

		var mathNode = math.parse(this.value);
		this.computedValue = mathNode.compile().eval();
		this.$element.attr("data-value", this.computedValue);

		if (isInteger) this.$element.html($("<div>").addClass("math").text(this.value));
		else {
			var tex = mathNode.toTex({parenthesis: "auto"});
			this.element.innerHTML = `$$ ${tex} $$`;
		}
		
		this.$element.hide().appendTo($(this.parentSelector)).fadeIn(250);

		this.$element.outerHeight(this.size);
		this.$element.remove().appendTo($(this.parentSelector));
		this.$element.outerWidth(this.$element.outerHeight());

		if (!isInteger) {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element],
				() => Utils.scaleToFit(this.$element, ".math", .9));
		}
		else Utils.scaleToFit(this.$element, ".math");
	}

	static _isOperator(op) {
		return Tile.operations.hasOwnProperty(op);
	}
}

Tile.operations = {};
Tile.operations["+"] = Tile.operations.plus =
	Tile.operations.add = Tile.operations.addition = "+";
Tile.operations["-"] = Tile.operations.sub =
	Tile.operations.subtract = Tile.operations.minus = "-";
Tile.operations["*"] = Tile.operations.multi =
	Tile.operations.times = Tile.operations.multiply = "*";
Tile.operations["/"] = Tile.operations.div =
	Tile.operations.divide = Tile.operations.over = "/";