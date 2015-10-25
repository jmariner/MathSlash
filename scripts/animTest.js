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

////$(document).on('keydown', function(e) {
////	if (e.keyCode === 68) { // 68 is the letter D on the keyboard
////		var knightDelay = 200;
////		var monsterDelay = 0;
////		setTimeout(function() { $('.knight').addClass('animate'); }, knightDelay);
////		setTimeout(function() { $('.knight').removeClass('animate'); }, knightDelay+700);
////
////		setTimeout(function() { $(".monster").addClass("animate"); }, monsterDelay);
////		setTimeout(function() { $(".monster").removeClass("animate"); }, monsterDelay+700);
////
////	}
////});

function tileTest() {
	var t = new Tile("15", ".bigTileArea");
	var tiles = [];
}