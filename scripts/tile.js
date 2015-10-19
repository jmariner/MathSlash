"use strict";
var Tile = function() { // TODO tiles are categorized by what operation is used before them
                        //      so, generate a symbol before each tile to show which one it is
//argument parsing
	var args = {};
	if (arguments.length === 1) {
		if (typeof arguments[0] === "string")  args = {value: arguments[0]};
		else if (typeof arguments[0] === "object") args = $.extend({}, arguments[0]);
		else throw "Argument must be value string or options object";
	}
	else if (arguments.length === 2) {
		if (typeof arguments[0] !== "string" || typeof arguments[1] !== "object")
			throw "Incorrect argument syntax. Use (value, {option:optionVal, ...})";
		else args = $.extend({}, arguments[1], {value: arguments[0]});
	}
	else throw "Function requires arguments";

	this.value = args.value;

//element creation
	var $el = $("<div>")
		.addClass("tile")
		.addClass(Tile.styles.classes.tileAndParent)
		.addClass(Tile.styles.classes.tile);

//checking if math or operator tile
	if (Tile._getOperator(this.value) === undefined) { //is math

		try {
			var node = math.parse(this.value);
		} catch (e) {
			throw 'Error parsing math: "' + this.value + "'";
		}

		this.computedValue = node.compile().eval();
		this.isOperator = false;
		this.operator = undefined;

		var tex = node.toTex({
			parenthesis: "auto",
			handler: function (n, o) {
				if ((n.type === 'OperatorNode') && (n.fn === 'multiply'))
					return n.args[0].toTex(o) + ' ' + n.args[1].toTex(o);
			}
		});

		$el.html("$$" + tex + "$$");

		this.options = $.extend({}, Tile.defaultOptions.math, args);
	}
	else { //is operator
		var op = Tile._getOperator(this.value);
		this.computedValue = undefined;
		this.isOperator = true;
		this.operator = op;

		$el.addClass("isOperator").html(Tile.operatorNames.display[op]);

		this.options = $.extend({}, Tile.defaultOptions.operator, args);
	}

	this.options = this._checkOptions();

	this.element = $el.get(0);
	
	this.resize(this.options.size);

	$el.hide().appendTo(
		$(this.options.parentSelector)
			.addClass("tile-parent")
			.addClass(Tile.styles.classes.tileAndParent)
			.addClass(Tile.styles.classes.tileParent)
	).fadeIn(500);
	
	MathJax.Hub.Queue(
		["Typeset", MathJax.Hub, this.element],
		function(){ Utils.scaleToFit($el, ".math"); }
	);

};

Tile.prototype.resize = function(newSize, ratio) {
	if (ratio !== undefined) this.options.widthToHeightRatio = ratio;
	this.options.size = newSize;
	this._checkOptions();
	var $el = $(this.element);
	$el.outerHeight(newSize);
	$el.remove().appendTo($(this.options.parentSelector));
	$el.outerWidth($el.outerHeight() * this.options.widthToHeightRatio);
	if (this.isOperator) $el.css("font-size", $el.height());
};

Tile.prototype._checkOptions = function(o) {
	var con = console || {warn:function(){}};
	o = o || $.extend({}, this.options);
	var $parent = $(o.parentSelector);
	if (typeof o.value !== "string") throw "value must be a string";
	if (typeof o.parentSelector !== "string") throw "parentSelector must be a string";
	if (typeof o.size !== "string" && typeof o.size !== "number") throw "size must be a string or number";
	if (typeof o.widthToHeightRatio !== "number") throw "widthToHeightRatio must be a number";
	if ($parent.length === 0) {
		con.warn("Parent Element '" + o.parentSelector + "' does not exist, creating it");
		$("body").append($("<div>").addClass("tile-parent"));
	}
	if ($parent.length > 1) throw "Parent selector '" + o.parentSelector + "' matches more than one element";
	return o;
};

Tile._getOperator = function(str) {
	str = str.toLowerCase();
	var ret = undefined;
	Utils.forEachIn(function(key, val) {
		if (key === str) ret = key;
		if (val instanceof Array && val.indexOf(str) > -1) ret = key;
	}, Tile.operatorNames);
	return ret;
};

Tile.operatorNames = {
	"+": ["add", "plus"],
	"-": ["sub", "subtract", "minus"],
	"*": ["min", "multiply", "times"],
	"/": ["div", "divide", "divided by", "over"],
	display: {
		"+": "+",
		"-": "-",
		"*": "×",
		"/": "÷"
	}
};

Tile.defaultOptions = {
	math: {
		parentSelector: "body > .tile-parent",
		size: "100%",
		widthToHeightRatio: 1
	},
	operator: {
		parentSelector: "body > .tile-parent",
		size: "48.5%",
		widthToHeightRatio: 1
	}
};

Tile.styles = {
	classes: {
		tileParent: "justify-start",
		tileAndParent: "flex-row border-box"
	}
};