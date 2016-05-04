$(function() {
	Pregame.skipToGame = false;
	Pregame.autoStartGame = true;
	Pregame.loadingAnim = true;
	Pregame.GAME = new Game(GAME_MODES.GREATEST_SUM);
	Pregame.init();
});