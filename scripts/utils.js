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

	$("body").keydown(function(e) {
		if (e.which === 192) // ~ or `
			Utils.toggleDebug();
	});

});

Utils = {};

Utils.toggleDebug = function() { $("body").toggleClass("debug"); };

Utils.parseForm = function(formID) {
	var $form = $("#" + formID);
	var data = {};
	$form.find("[name]").each(function() {
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

Utils.rand = function(min, max) {
	return min + Math.floor((Math.random() * (max - min + 1)));
};

Utils.forEachIn = function(func, obj) {
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			func(i, obj[i]);
		}
	}
};

Utils.scaleToFit = function(parent, childSel) {

	var $parent;
	if (typeof parent === "string" || parent instanceof HTMLElement || parent instanceof HTMLCollection)
		$parent = $(parent);
	else if (parent instanceof $) $parent = parent;
	else throw "parent is not a selector, element, or jQuery object";

	if (typeof childSel !== "string") throw "childSelector must be a string";

	$parent.each(function() {
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

			var scaleFactor = parentMax / max;
			var scale = "scale(" + scaleFactor + ")";

			$c.css("transform", scale);

			if ($c.css("display") === "inline") $c.css("display", "inline-block");

	});
};

Utils.generateStylesheet = function(templateID, globalStyles, customResultID) {
	if (!customResultID) $("head style#" + templateID + "_replaced").remove();
	var $template = $("head template#" + templateID);
	var s = $("<style>").html($template.html()).attr("id", templateID + "_" + customResultID + "_replaced").html(function(i, old) {

		var html = old.replace(/(;|\{)\n/gm, "$1").replace(/\t+/g, " ").replace(/\n\s/g, "\n");

		Utils.forEachIn(function(prop, style) {
			html = html.replace(
				new RegExp("\\{" + prop + "\\}", "g"),
				style
			);
		}, globalStyles);
		return html.trim();
	});
	$template.after(s);
};