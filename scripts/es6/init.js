$(function() {
	Pregame.skipToGame = true;
	Pregame.autoStartGame = false;
	Pregame.loadingAnim = false;
	Pregame.GAME = new Game(GAME_MODES.GREATEST_SUM);
	Pregame.init();
});