"use strict";

$(function () {

	$.fn._show = function () {
		$(this).removeClass("hidden hiddenAlt");
		return $(this);
	};

	$.fn._hide = function (alt) {
		$(this).addClass("hidden" + (alt ? "Alt" : ""));
		return $(this);
	};

	$.fn._setHidden = function (isHidden, alt) {
		if (isHidden) $(this)._hide(alt);else $(this)._show();
		return $(this);
	};

	$("body").keydown(function (e) {
		if (e.which === 192) // ~ or `
			Utils.toggleDebug();
	});
});

var Utils = {};

Utils.toggleDebug = function () {
	$("body").toggleClass("debug");
};

Utils.parseForm = function (formID) {
	var $form = $("#" + formID);
	var data = {};
	$form.find("[name]").each(function () {
		var val;
		switch (this.type) {
			case "checkbox":
				val = this.checked;
				break;
			case "select-one":
				val = this.value;
				break;
			case "number":
				val = +this.value;
				break;
			default:
				val = this.value;
		}

		if (val.length === 1 && val.charCodeAt(0) === 8734 && this.max) val = this.max;
		if ($.isNumeric(val)) val = +val;
		data[this.name] = val;
	});
	return data;
};

Utils.rand = function (min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
};

Utils.forEachIn = function (func, obj) {
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			func(i, obj[i]);
		}
	}
};

Utils.scaleToFit = function (parent, childSel, ratio) {

	var $parent;
	if (typeof parent === "string" || parent instanceof HTMLElement || parent instanceof HTMLCollection) $parent = $(parent);else if (parent instanceof $) $parent = parent;else throw "parent is not a selector, element, or jQuery object";

	if (typeof childSel !== "string") throw "childSelector must be a string";

	ratio = ratio || 1;

	$parent.each(function () {
		var $p = $(this);
		var $c = $p.find(childSel);

		var max, parentMax;
		if ($c.width() < $c.height()) {
			max = $c.height();
			parentMax = $p.height();
		} else {
			max = $c.width();
			parentMax = $p.width();
		}

		var scaleFactor = parentMax / max * ratio;
		var scale = "scale(" + scaleFactor + ")";

		$c.css("transform", scale);

		if ($c.css("display") === "inline") $c.css("display", "inline-block");
	});
};

Utils.generateStylesheet = function (templateID, globalStyles, customResultID) {
	customResultID = customResultID !== undefined ? "_" + customResultID : "";
	$("head style#" + templateID + customResultID + "_replaced").remove();
	var $template = $("head template#" + templateID);
	var s = $("<style>").html($template.html()).attr("id", templateID + customResultID + "_replaced").html(function (i, old) {

		var html = old.replace(/(;|\{)\n/gm, "$1").replace(/\t+/g, " ").replace(/\n\s/g, "\n");

		Utils.forEachIn(function (prop, style) {
			html = html.replace(new RegExp("\\{" + prop + "\\}", "g"), style);
		}, globalStyles);
		return html.trim();
	});
	$template.after(s);
};

Utils.assert = function (condition, errorMessage) {
	if (!condition) {
		if (Error) throw new Error(errorMessage || "Assert Failed");else throw errorMessage || "Assert Failed";
	}
};

Utils.buildFraction = function () {
	var n = arguments.length <= 0 || arguments[0] === undefined ? arguments[2] * arguments[1] : arguments[0];
	var d = arguments.length <= 1 || arguments[1] === undefined ? n / arguments[2] : arguments[1];
	var result = arguments.length <= 2 || arguments[2] === undefined ? n / d : arguments[2];
	return (function () {
		return {
			n: n, d: d, result: result,
			toString: function toString() {
				return n + " / " + d;
			}
		};
	})();
};

Utils.compare = function (condition, scope) {

	// TODO parse parenthesis in this (don't split if parenthesis maybe?)
	// other way: check each condition independently and run and/or logic on that
	//            use math.eval with trues/falses - accounts for parenthesis already

	var parts = condition.split(/or|\|\|/) // split into array of "or" parts
	.map(function (part) {
		return part.split(/and|&&/);
	}); // split each "or" part into "and" parts

	var boolean = false;

	for (var j = 0, orPart = undefined; (orPart = parts[j]) !== undefined; j++) {
		// for each "or" part: only one of these must be true

		var innerBoolean = false;

		for (var i = 0, part = undefined; (part = orPart[i]) !== undefined; i++) {
			// for each "and" part: all of these must be true
			if (part.trim().toLowerCase() === "true") {
				innerBoolean = true;
				break;
			} else if (part.trim().toLowerCase() === "false") {
				innerBoolean = false;
			} else if (Utils.simpleCompare(part, scope)) {
				innerBoolean = true;
				break;
			} else {
				innerBoolean = false;
			}
		}

		// TODO Utils.compare("true and false || false or false and false") == true ?
		if (innerBoolean) {
			boolean = true;
			break;
		}
	}

	return boolean;
};

Utils.simpleCompare = function (singleCondition, scope) {
	var comparers = /(?:<|>|==)=?|!==?/;
	var parts = /[^=!<>\s]+/;

	var condRegex = new RegExp("^\\s*(" + parts.source + ")\\s*(" + comparers.source + ")\\s*(" + parts.source + ")\\s*$").exec(singleCondition).slice(1);

	var literalRegex = /^'(.+)'|"(.+)"|([0-9]+)|(true|false)$/;

	var left = (literalRegex.exec(condRegex[0]) || []).sort(function (a, b) {
		return +(b === undefined);
	})[1] || _.get(scope, condRegex[0]);

	var logicOp = condRegex[1];

	var right = (literalRegex.exec(condRegex[2]) || []).sort(function (a, b) {
		return +(b === undefined);
	})[1] || _.get(scope, condRegex[2]);

	switch (logicOp) {
		case ">":
			return left > right;
		case "<":
			return left < right;
		case ">=":
			return left >= right;
		case "<=":
			return left <= right;
		case "==":
			return left == right;
		case "!=":
			return left != right;
		case "===":
			return left === right;
		case "!==":
			return left !== right;
	}
};

//# sourceMappingURL=utils.js.map