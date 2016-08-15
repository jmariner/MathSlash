$(function() {
	Pregame.skipToGame = true;
	Pregame.autoStartGame = true;
	Pregame.loadingAnim = false;
	Pregame.GAME = new Game(GAME_MODES.GREATEST_SUM);
	Pregame.init();
});