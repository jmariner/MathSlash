$(document).on('keydown', function(e) {
	if (e.keyCode === 68) { // 68 is the letter D on the keyboard
		var knightDelay = 200;
		var monsterDelay = 0;
		setTimeout(function() { $('.knight').addClass('animate'); }, knightDelay);
		setTimeout(function() { $('.knight').removeClass('animate'); }, knightDelay+700);

		setTimeout(function() { $(".monster").addClass("animate"); }, monsterDelay);
		setTimeout(function() { $(".monster").removeClass("animate"); }, monsterDelay+700);

	}
});