//$(function() {
//	window.animManager = new AnimationManager("ken.png");
//	var ken = animManager.registerCharacter("ken", {
//		selector: ".ken",
//		startY: 0,
//		size: "70x80",
//		position: {top: "50%", left: "50%"},
//		styles: {transform: "scale(2)"}
//	});
//	ken.registerAnimation("idle" , {index:1, frames:4, duration:500});
//	ken.registerAnimation("punch", {index:2, frames:3, duration:400});
//	ken.registerAnimation("kick" , {index:4, frames:5, duration:600});
//});

"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

$(function () {
	var _keyToRow;

	window.game = new Game();
	window.reg = game.registry;

	//from http://stackoverflow.com/a/12476699
	// 37:"Left",38:"Up",39:"Right",40:"Down"
	var keyCodeToChar = { 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt", 19: "Pause/Break", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 45: "Insert", 46: "Delete", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 65: "A", 66: "B", 67: "C", 68: "D", 69: "E", 70: "F", 71: "G", 72: "H", 73: "I", 74: "J", 75: "K", 76: "L", 77: "M", 78: "N", 79: "O", 80: "P", 81: "Q", 82: "R", 83: "S", 84: "T", 85: "U", 86: "V", 87: "W", 88: "X", 89: "Y", 90: "Z", 91: "Windows", 93: "RightClick", 96: "Numpad0", 97: "Numpad1", 98: "Numpad2", 99: "Numpad3", 100: "Numpad4", 101: "Numpad5", 102: "Numpad6", 103: "Numpad7", 104: "Numpad8", 105: "Numpad9", 106: "Numpad*", 107: "Numpad+", 109: "Numpad-", 110: "Numpad.", 111: "Numpad/", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 182: "MyComputer", 183: "MyCalculator", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'" };
	var keyCharToCode = { "Backspace": 8, "Tab": 9, "Enter": 13, "Shift": 16, "Ctrl": 17, "Alt": 18, "Pause/Break": 19, "CapsLock": 20, "Esc": 27, "Space": 32, "PageUp": 33, "PageDown": 34, "End": 35, "Home": 36, "Left": 37, "Up": 38, "Right": 39, "Down": 40, "Insert": 45, "Delete": 46, "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57, "A": 65, "B": 66, "C": 67, "D": 68, "E": 69, "F": 70, "G": 71, "H": 72, "I": 73, "J": 74, "K": 75, "L": 76, "M": 77, "N": 78, "O": 79, "P": 80, "Q": 81, "R": 82, "S": 83, "T": 84, "U": 85, "V": 86, "W": 87, "X": 88, "Y": 89, "Z": 90, "Windows": 91, "RightClick": 93, "Numpad0": 96, "Numpad1": 97, "Numpad2": 98, "Numpad3": 99, "Numpad4": 100, "Numpad5": 101, "Numpad6": 102, "Numpad7": 103, "Numpad8": 104, "Numpad9": 105, "Numpad*": 106, "Numpad+": 107, "Numpad-": 109, "Numpad.": 110, "Numpad/": 111, "F1": 112, "F2": 113, "F3": 114, "F4": 115, "F5": 116, "F6": 117, "F7": 118, "F8": 119, "F9": 120, "F10": 121, "F11": 122, "F12": 123, "NumLock": 144, "ScrollLock": 145, "MyComputer": 182, "MyCalculator": 183, ";": 186, "=": 187, ",": 188, "-": 189, ".": 190, "/": 191, "`": 192, "[": 219, "\\": 220, "]": 221, "'": 222 };

	var keyToRow = (_keyToRow = {}, _defineProperty(_keyToRow, keyCharToCode.Up, 1), _defineProperty(_keyToRow, keyCharToCode.Right, 2), _defineProperty(_keyToRow, keyCharToCode.Down, 3), _keyToRow);

	$(function () {
		$(document).keydown(function (e) {
			if (keyToRow.hasOwnProperty(e.which || e.keyCode)) {
				game.chooseRow(keyToRow[e.which || e.keyCode]);
			}
		});
	});
});

//# sourceMappingURL=tests.js.map