class Tile {
	contructor() {
	}

	addToPage(parentSelector) {
		this.$element = $("<div>").addClass("tile");
		this.$element.html($("<div>").html(this.value));

		this.hide();

		this.$element.appendTo($(parentSelector));

		this.$element.outerHeight("100%");
		this.$element.remove().appendTo($(parentSelector));
		this.$element.outerWidth(this.$element.outerHeight());
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

		var valuePart = valueRegex[1];
		var typePart = valueRegex[2];

		this.value = valuePart;

		this.isInteger = typePart === undefined;

		this.$element = undefined;

		try { math.parse(this.value); }
		catch(e) { throw `Cannot parse math: ${value}`; }

		this.mathNode = math.parse(this.value);
		this.computedValue = this.mathNode.compile().eval();

	}

	addToPage(parentSelector, startHidden) {

		super.addToPage(parentSelector);

		this.$element.attr("data-value", this.computedValue);

		if (!this.isInteger) {
			var tex = this.mathNode.toTex({parenthesis: "auto"});
			this.$element.html(`$$ ${tex} $$`);
		}

		var ready = () => {
			Utils.scaleToFit(this.$element, "> div");
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
		Utils.scaleToFit(this.$element, "> div", .9);
		this.show();
	}
}