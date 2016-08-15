$(function() {

	$.fn._show = function() {
		$(this).removeClass("hidden hiddenAlt");
		return $(this);
	};

	$.fn._hide = function(alt) {
		$(this).addClass("hidden" + (alt ? "Alt" : ""));
		return $(this);
	};

	$.fn._setHidden = function(isHidden, alt) {
		if (isHidden) $(this)._hide(alt);
		else $(this)._show();
		return $(this);
	};

	$.fn.rect = function(roundEverything) {
		var r =  $(this).get(0).getBoundingClientRect();
		if (roundEverything) {
			r = $.extend({}, r); // can't edit ClientRect so copy it
			Utils.forEachIn(function (prop, val) {
				if (typeof val === "number")
					r[prop] = Math.round(val);
			}, r);
		}
		return r;
	};

	$("body").keydown(function(e) {
		if (e.which === Input["`"]) {
			Utils.toggleDebug();
			return false;
		}
		if (e.which === Input.F4) {
			Utils.toggleEasterEgg();
			return false;
		}
	});

});

class Utils {

	static toggleDebug() {
		$("body").toggleClass("debug");
	}
	static toggleEasterEgg() {
		$("body").toggleClass("easterEgg");
	}

	static parseForm(formID) {
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
	}

	static forEachIn(func, obj) {
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				func(i, obj[i]);
			}
		}
	}

	static scaleToFit(parent, childSel, ratio) {

		var $parent;
		if (typeof parent === "string" || parent instanceof HTMLElement || parent instanceof HTMLCollection)
			$parent = $(parent);
		else if (parent instanceof $) $parent = parent;
		else throw "parent is not a selector, element, or jQuery object";

		if (typeof childSel !== "string") throw "childSelector must be a string";

		ratio = ratio || 1;

		$parent.each(function () {
			var $p = $(this);
			var $c = $p.find(childSel);

			var max, parentMax;
			if ($c.width() < $c.height()) {
				max = $c.height();
				parentMax = $p.height();
			}
			else {
				max = $c.width();
				parentMax = $p.width();
			}

			var scaleFactor = parentMax / max * ratio;
			var scale = "scale(" + scaleFactor + ")";

			$c.css("transform", scale);

			if ($c.css("display") === "inline") $c.css("display", "inline-block");

		});
	}

	static generateStylesheet(templateID, globalStyles, customResultID) {
		customResultID = (customResultID !== undefined) ? "_" + customResultID : "";
		$("head style#" + templateID + customResultID + "_replaced").remove();
		var $template = $("head template#" + templateID);
		var s = $("<style>").html($template.html()).attr("id", templateID + customResultID + "_replaced").html(function (i, old) {

			var html = old.replace(/(;|\{)\n/gm, "$1").replace(/\t+/g, " ").replace(/\n\s/g, "\n");

			Utils.forEachIn(function (prop, style) {
				html = html.replace(
					new RegExp("\\{" + prop + "\\}", "g"),
					style
				);
			}, globalStyles);
			return html.trim();
		});
		$template.after(s);
	}

	static assert(condition, errorMessage) {
		if (!condition) {
			if (Error) throw new Error(errorMessage || "Assert Failed");
			else throw errorMessage || "Assert Failed";
		}
	}

	static buildFraction(n = (arguments[2] * arguments[1]), d = (n / arguments[2]), result = (n / d)) {
		return {
			n, d, result,
			toString: () => `${n} / ${d}`
		};
	}

	static compare(condition, scope) {

		var parenGroups = [];
		condition = condition.replace(/\(([^\(\)]+)\)/g, (nul, g) => {
			parenGroups.push(g);
			return "" + Utils.compare(g, scope);
		});

		var trySimple = Utils.simpleCompare(condition);
		if (trySimple !== undefined) return trySimple;

		var parts = condition
			.split(/or|\|\|/) // split into array of "or" parts
			.map(part => part.split(/and|&&/)); // split each "or" part into "and" parts

		var boolean = false;

		for (let j = 0, orPart; (orPart = parts[j]) !== undefined; j++) { // for each "or" part: only one of these must be true

			var innerBoolean = false;

			for (let i = 0, part; (part = orPart[i]) !== undefined; i++) {// for each "and" part: all of these must be true
				innerBoolean = Utils.simpleCompare(part, scope);
				if (!innerBoolean) break;
			}

			if (innerBoolean) {
				boolean = true;
				break;
			}
		}

		return boolean;
	}

	static simpleCompare(singleCondition, scope) {

		if (singleCondition.trim().toLowerCase() === "true") return true;
		if (singleCondition.trim().toLowerCase() === "false") return false;

		var comparers = /(?:<|>|==)=?|!==?/;
		var parts = /[^=!<>\s]+/;

		var condRegex = new RegExp("^\\s*(" + parts.source + ")\\s*(" + comparers.source + ")\\s*(" + parts.source + ")\\s*$").exec(singleCondition);
		if (condRegex === null) return undefined;
		else condRegex = condRegex.slice(1);

		var literalRegex = /^'(.+)'|"(.+)"|([0-9]+)|(true|false)$/;

		var left = (literalRegex.exec(condRegex[0]) || []).sort((a, b) => +(b === undefined))[1] || _.get(scope, condRegex[0]);
		if (/^\d+$/.test(left)) left = +left;

		var logicOp = condRegex[1];

		var right = (literalRegex.exec(condRegex[2]) || []).sort((a, b) => +(b === undefined))[1] || _.get(scope, condRegex[2]);
		if (/^\d+$/.test(right)) right = +right;

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
	}

	static newWorker(script, onMessage) {
		var worker = new Worker(`scripts/workers/${script}.js`);
		worker.onmessage = onMessage;
		return worker;
	}
}