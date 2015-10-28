class Tile {
	constructor(value, parentSelector, size="100%") {

		Utils.assert(typeof value === "string", "Invalid parameter: value" + ((value !== undefined) ? ` (${value})` : ""));
		Utils.assert($(parentSelector).length > 0, "Invalid parameter: parentSelector" + ((parentSelector !== undefined) ? ` (${parentSelector})` : ""));
		Utils.assert($(parentSelector).length === 1, `Invalid parentSelector (too many matches): ${parentSelector}`);

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

		this.hide();
		
		this.$element.appendTo($(this.parentSelector));
		
		// TODO delay fade in to allow mathjax to do its thing (maybe even pre-load the tiles?)

		this.$element.outerHeight(this.size);
		this.$element.remove().appendTo($(this.parentSelector));
		this.$element.outerWidth(this.$element.outerHeight());

		if (!isInteger) {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element],
				() => Utils.scaleToFit(this.$element, ".math", .9));
		}
		else Utils.scaleToFit(this.$element, ".math");

		//console.log(`tile created: ${value} in ${parentSelector}`)
	}

	hide() {
		this.$element._hide(true);
	}

	show() {
		this.$element._show();
	}

	remove() {
		this.$element.remove();
	}

	static _isOperator(op) {
		return Tile.operations.hasOwnProperty(op);
	}
}

Tile.operations = {
	"+": "+",
	plus: "+",
	add: "+",
	addition: "+",

	"-" : "-",
	sub: "-",
	subtract: "-",
	minus: "-",

	"*": "*",
	times: "*",
	multi: "*",
	multiply: "*", // displays "x" on page
	
	"/": "/",
	div: "/",
	over: "/",
	divide: "/",
	"divided by": "/" // displays division symbol on page
};