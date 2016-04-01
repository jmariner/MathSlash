class Pregame {
	static init() {
		// set Pregame.skipToGame to true before calling init()
		if (Pregame.skipToGame === true) {
			Pregame.goToPage(Pregame.lastPage);
			Pregame.setupForm();
			Pregame.setupGame();
			Pregame.startGame();
			return;
		}

		// set up keydown even on first page
		$(document).on("keydown.continue", function(e) {
			if (Input.isAnyKey(e)) Pregame.onContinue(1);
		});

		// generate buttons to continue
		$("body div[data-page]:not(.last-page)").append(
			$("<div>")
				.addClass("click-to-continue")
				.text("Continue >>")
				.click(() => { $(document).trigger("keydown.continue"); })
		);
	}

	static nextPage() {
		var curPage = document.body.dataset.currentPage;
		if (curPage < Pregame.lastPage) {
			var newPage = ++document.body.dataset.currentPage;
			if (newPage < Pregame.lastPage) {
				$(document).on("keydown.continue", function(e) {
					if (Input.isAnyKey(e)) Pregame.onContinue(newPage);
				});
			}
		}
	}

	static goToPage(p) {
		if (p > 0 && p <= Pregame.lastPage)
			document.body.dataset.currentPage = p;
	}

	static get lastPage() {
		return +$("body div.last-page").data("page");
	}

	static onContinue(oldPage) {
		$(document).off("keydown.continue");
		Pregame.nextPage();
		(Pregame[Pregame.getPageEl(oldPage).dataset.after] || $.noop)();
	}

	static getPageEl(p) {
		return $(`body div[data-page="${p}"]`).get(0);
	}

	static getCurPageEl() {
		//noinspection JSUnresolvedVariable
		return Pregame.getPageEl(document.body.dataset.currentPage);
	}

	static setupForm() {
		// generate game mode list
		var $form = $("#gamemode-form");
		Object.keys(GAME_MODES).forEach(function(gameMode) {
			var disabled = GAME_DATA[gameMode][0].disabled;
			var inputAttr = {
				type: "radio",
				id: "gm_"+gameMode,
				name: "gameMode",
				disabled
			};
			var labelAttr = {
				"for": "gm_"+gameMode,
				disabled,
				title: disabled ? "Game Mode Disabled" : ""
			};

			var $label = $("<label>").attr(labelAttr).text(gameMode.replace(/_/g," "));
			var $input = $("<input>").attr(inputAttr).on("change", function() {
				$(this).parent().parent().find(".checked").removeClass("checked");
				$(this).parent().addClass("checked");
			});
			$form.append($label.append($input));
		});
		$form.find("label:first-child").addClass("checked").find("input").attr("checked", true);
	}

	static submitForm() {
		var options = Pregame.setupGame();
		var $info = $(".info-page");
		var gm = options.gameMode;
		$info.find(".subtitle").text("for " + gm.replace(/_/g," ") + " mode");
		$info.find(".instructions").text(GAME_DATA[gm][0].instructions);
	}

	static setupGame() {
		var $form = $("#gamemode-form");
		var gm = $form.find("input:checked").attr("id").replace("gm_","");
		window.GAME = new Game(GAME_MODES[gm]);

		var a = GAME.animationManager = new AnimationManager("jane/idle.png");

		a.registerCharacter("jane", {
			selector:".jane",
			startY:0,
			size:"50x70",
			position:{ bottom:"12.5%", left:"7.5%"},
			styles:{transform:"scale(2)"}
		});

		a.characters["jane"].registerAnimation("idle", {
			index:0,
			frames:4,
			duration:1400
		});

		$(".knight").css({
			"background-image": 'url("images/knight.png")',
			right: "15%",
			bottom: "25%",
			transform: "scale(-4, 4)",
			width: "40px",
			height: "60px",
			position: "absolute"
		});

		return {gameMode: gm};
	}

	static startGame() {
		$(document).keydown(Input.onKeyDown);
		GAME.display.init(3000, 1000, 1000, 0, () => { GAME.startLevel(1); });
	}
}
Pregame.skipToGame = false;

class Input {

	static onKeyDown(e) {
		if (e.which === Input.F4)
			$("body").toggleClass("easterEgg");

		GAME.onKeyDown(e.which);
	}

	static isAnyKey(e) {
		return  !e.shiftKey && !e.ctrlKey &&
			!e.altKey && !e.metaKey &&
			[16, 17, 18, 91, 92].indexOf(e.which) === -1;
	}

	static getKey(code) {
		return Input._keyCodeToChar[code];
	}

}
//from http://stackoverflow.com/a/12476699
Input._keyCodeToChar = {8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause/Break",20:"CapsLock",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",45:"Insert",46:"Delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",91:"Windows",93:"RightClick",96:"Numpad0",97:"Numpad1",98:"Numpad2",99:"Numpad3",100:"Numpad4",101:"Numpad5",102:"Numpad6",103:"Numpad7",104:"Numpad8",105:"Numpad9",106:"Numpad*",107:"Numpad+",109:"Numpad-",110:"Numpad.",111:"Numpad/",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",182:"MyComputer",183:"MyCalculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"};
Input._keyCharToCode = {"Backspace":8,"Tab":9,"Enter":13,"Shift":16,"Ctrl":17,"Alt":18,"Pause/Break":19,"CapsLock":20,"Esc":27,"Space":32,"PageUp":33,"PageDown":34,"End":35,"Home":36,"Left":37,"Up":38,"Right":39,"Down":40,"Insert":45,"Delete":46,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"A":65,"B":66,"C":67,"D":68,"E":69,"F":70,"G":71,"H":72,"I":73,"J":74,"K":75,"L":76,"M":77,"N":78,"O":79,"P":80,"Q":81,"R":82,"S":83,"T":84,"U":85,"V":86,"W":87,"X":88,"Y":89,"Z":90,"Windows":91,"RightClick":93,"Numpad0":96,"Numpad1":97,"Numpad2":98,"Numpad3":99,"Numpad4":100,"Numpad5":101,"Numpad6":102,"Numpad7":103,"Numpad8":104,"Numpad9":105,"Numpad*":106,"Numpad+":107,"Numpad-":109,"Numpad.":110,"Numpad/":111,"F1":112,"F2":113,"F3":114,"F4":115,"F5":116,"F6":117,"F7":118,"F8":119,"F9":120,"F10":121,"F11":122,"F12":123,"NumLock":144,"ScrollLock":145,"MyComputer":182,"MyCalculator":183,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222};
Utils.forEachIn(function(key, code) { Input[key] = code;}, Input._keyCharToCode);