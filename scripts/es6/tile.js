class Tile {
	contructor() {
	}

	addToPage(parentSelector) {
		this.$element = $("<div>").addClass("tile");
		this.$element.html(
			$("<div>").html(this.value).addClass("scaleToFit")
		);

		this.hide();

		var $parent = $(parentSelector);

		this.$element.appendTo($parent);

		var h = $parent.rect().height;
		this.$element.outerHeight(h);
		this.$element.outerWidth(h);
	}

	hide() {
		(this.$element || $())._hide(true);
	}

	show() {
		(this.$element || $())._show();
	}

	remove() {
		(this.$element || $()).remove();
	}
}

class NumberTile extends Tile {
	constructor(value) {

		super();

		var valueRegex = /^([\d\-]+(?:\s?(\/|\^)\s?[\d\-]+)?)$/.exec(value);

		if ((value.match(/-/g) || []).length > 1)
			throw "More than one negative is not allowed";

		var valuePart = valueRegex[1];
		var typePart = valueRegex[2];

		this.value = valuePart;

		this.isInteger = typePart === undefined;

		this.$element = undefined;

		try { math.parse(this.value); }
		catch(e) { throw `Cannot parse math: ${value}`; }

		this.mathNode = math.parse(this.value);
		this.computedValue = this.mathNode.compile().eval();

		this.isNegative = this.computedValue < 0;

	}

	addToPage(parentSelector, startHidden) {

		var origValue = this.value;
		if (this.isNegative) this.value = this.value.replace("-", "");

		super.addToPage(parentSelector);

		this.$element.attr("data-operation", this.isNegative ? "-" : "+");
		this.$element.attr("data-value", this.computedValue);

		if (!this.isInteger) {
			var tex = math.parse(this.value).toTex({parenthesis: "auto"});
			this.$element.html(`$$ ${tex} $$`);
		}

		this.value = origValue;

		var ready = () => {
			this.$element.find(".math").addClass("scaleToFit");
			Utils.scaleToFit(this.$element, ".scaleToFit");
			if (!startHidden) this.show();
		};

		if (!this.isInteger) {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.$element.get(0)], ready);
		}
		else ready();
	}
}

class StringTile extends Tile {
	constructor(value) {
		super();
		this.value = value.replace(/\n/g, "<br>");
		this.$element = undefined;
	}

	addToPage(parentSelector) {
		super.addToPage(parentSelector);
		this.$element.addClass("text");
		Utils.scaleToFit(this.$element, ".scaleToFit", .9);
		this.show();
	}
}