//tictactoe
//!function(){
	const gameDomEsclusion = ["#board", "#start", "#finish"];
	const gameInit = ["N","N","N"];
	const clickedValues = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]];
	const movePriority = [4,0,6,2,8,1,3,5,7];
	const diagonalBoxesBS = [0,4,8];
	const diagonalBoxesFS = [2,4,6];
	const xVictory = "XXX";
	const oVictory = "OOO";
	const $boxes = $(".boxes li");
	const allClassesToReset = ["screen-win-tie", "screen-win-one", "screen-win-two",
		"box-filled-1", "box-filled-2"];
	var remainingMoves = 9;
	var rows, cols, diagonal; 
	var xSelection = true;
	var currentGame = [];
	var computerMoves = [];
	var computerMoved = [];
	var playerVictor = "";
	var namePlayer1, namePlayer2, currentPlayer, moveValue, movedIndex;
	var computerPlayerExists = false;

	console.log("version 3.9.5");
//* --------------------- *//
//* Function section      *//
//* --------------------- *//
	const clickedToArrayConversion = (data) => {
		return clickedValues[data];
	};

	const newGameLogic = () => {
		setDomExclusion("#board", gameDomEsclusion);								// only show the board div

    currentGame = [["N","N","N"],["N","N","N"],["N","N","N"]];	// reset to no moves taken.
    computerMoves = movePriority.slice();											// copy entire array.
    remainingMoves = 9;
    moveValue = Math.floor( remainingMoves / 2);
    rows = [0,0,0];
    cols = [0,0,0];
    diagonal = [0,0];
    $('#player1').removeClass("active");												// neither player is active
    $('#player2').removeClass("active");
    removeClassesAll(allClassesToReset);												// remove all classes we set

		var coinToss = Math.floor(Math.random() * 2);								// random the starting player.
		if (coinToss) {
			xSelection = false;																				// #player1 is O
			$('#player1').addClass("active");
		} else {
			xSelection = true;																				// #player2 is X
			$('#player2').addClass("active");
		};
		playerVictor= "";																						// nobody has won.
		setPlayerName();
	};
	const removeClassesAll = (classArray) => {										// take the classArray
		for (let i = 0; i<classArray.length; i++) {									// process all entries
			removeClasses(classArray[i]);															// call removeClass function for this array entry
		}
	};
	const removeClasses = (thisClass) => {												// take the class to remove
			let $domArray = $("." +thisClass);												// set the domArray to grab all elements that have "thisClass" prepended . (JQuery CSS selector)
			$domArray.removeClass(thisClass);													// JQuery removeClass function.
	};
	const victoryCheck = (thisBox) => {														// thisBox is the zero based Math of which box was clicked.
		let rowCol = clickedValues[thisBox];												// get the two dimensional array represendataion.
		let theMoves = "";																					// initialize theMoves
		function checkForWin() {																		// function that checks to see if the row/column/diagonal is all X or O
			if (xSelection) {																				
				if (theMoves === xVictory) { 
					playerVictor = "X";
					return true;
				} else { 
					theMoves = "";
				}
			} else if (theMoves === oVictory) { 
				playerVictor = "O";
				return true;
			} else {
				theMoves = "";
			};
		};		// end of function checkForWin

		for (let i = 0; i < 3; i++) {
			theMoves += currentGame[rowCol[0]][i];
		};
		if (checkForWin()) {
			return true
		}

		for (let i = 0; i < 3; i++) {
			theMoves += currentGame[i][rowCol[1]];
		};

		if (checkForWin()) {
			return true;
		}

		if ((diagonalBoxesBS).indexOf(thisBox) < 0) {
			// do nothing
		} else {
			theMoves = currentGame[0][0] + currentGame[1][1] + currentGame[2][2];
			if (checkForWin()) {
				return true;
			}
		};
		if ((diagonalBoxesFS).indexOf(thisBox) < 0) {
			//
		} else {
			theMoves = currentGame[0][2] + currentGame[1][1] + currentGame[2][0];
			if (checkForWin()) {
				return true;
			}
		};
		return false;
	};
	const switchPlayersTurn = (thisBox) => {
		var stopPlaying = victoryCheck(thisBox);
		remainingMoves--;
		if (stopPlaying) {
				$('.message').text("Winner " + currentPlayer);
				if (playerVictor === "O") {
					$('#finish').addClass("screen-win-one");
				} else if (playerVictor === "X") {
					$('#finish').addClass("screen-win-two");	
				}
				setDomExclusion("#finish", gameDomEsclusion);
				return false;
		} else {
			if (remainingMoves === 0) {
				playerVictor = "N";
				$('.message').text("It's a Tie!");
				$('#finish').addClass("screen-win-tie");
				setDomExclusion("#finish", gameDomEsclusion);
				return false;
			};
		};
		
		$('#player2').toggleClass("active");
		$('#player1').toggleClass("active");
		xSelection = !xSelection;	
		setPlayerName();
		return true;
	};
	const setPlayerName = () => {
		let nInterval = "";
		if (xSelection) {
			currentPlayer = namePlayer2;
		} else {
			currentPlayer = namePlayer1;
		};	
		$("#player-name").text(currentPlayer);
		if ( (currentPlayer.toLowerCase()) == "computer") {
 			computerMove(); 
 		}
	};

	const computerMove = () => {

	//	lots of refactoring .if (remainingMoves > 6) { myMove = computerMoves[0]	} else {	
		let myMove = computerMoves[0];											// take your move from the front of the array
		handleMouseEnterLeave( $($boxes[myMove]) );					//	causes the correct background to be set. $(DomElement) creates the JQuery object
		setBoxIfAvailable(myMove);		// setBoxIfAvailable calls SwitchPlayersTurn calls setPlayerName which should clearInterval;
	};

	const handleMouseEnterLeave = (domElement) => {						// not a domElement. this is actually a JQuery Object.

		let index = $(".box").index(domElement);								// which one did you ' mouse enter/leave'
		let moveIndex = clickedToArrayConversion(index);				// get the two dimensional value of..		
		if (currentGame[moveIndex[0]][moveIndex[1]] === "N") {	// make sure you can select it.
			if (xSelection) {																			// set the correct class based upon whose turn it is
				domElement.toggleClass("box-filled-2");
			} else { 
				domElement.toggleClass("box-filled-1");
			}
		};	
	};

	const setBoxIfAvailable = (index) => {										// potential refactor between handlemouseenterleave and this

	  let moveIndex = clickedToArrayConversion(index); 											// lookup two dimensional array from box click index
  	if (currentGame[moveIndex[0]][moveIndex[1]] === "N") {								// only allow a change if available.
  		currentGame[moveIndex[0]][moveIndex[1]] = xSelection ? "X" : "O";		// set player selection
  		processComputerMoves(index, "remove");
  		console.log(computerMoves);
  		if (computerPlayerExists) {
  			moveAIdefence(index);
  			setMovePriority();
  		};
  		let weContinue = switchPlayersTurn(index);													// switchPlayersTurn checks for victory also. 
  	} else {
  		console.log("Fatal logic error");
  	}
	};
	const setMovePriority = () => {
		let priorityMove = 0;
		let threatOfLosing = 4;
		let findWinningMove = -4
		function priorityInRow (myRow) {
			for (let t=0; t<3; t++) {
				let tile = (myRow*3) + t;
					let cmIndex = computerMoves.indexOf(tile);
				if (!(cmIndex < 0 ) )  {
					processComputerMoves(tile, "reorder");
					return true;
				}
			};
			return false;
		};  // end priorityInRow
		function priorityInCol (myCol) {
			for (let t=0; t<3; t++) {
				let tile = myCol + (3 * t);
				let cmIndex = computerMoves.indexOf(tile);
				if (!(cmIndex < 0 ) ) {
					processComputerMoves(tile,"reorder");
					return true;
				}
			};
			return false;
		};  // end priorityInRow
		function checkForLosingMove(value, moveType) {
			let foundOne = false;
			for (let i = 0; i < 3; i++) {
				if (rows[i] > value) {
					foundOne = priorityInRow(i);
				};
				if (cols[i] > value) {
					foundOne = priorityInCol(i);
				}
			};
			if (foundOne && moveType === "losing") {
				return true;
			} else {
				return false;
			};
		};
		function checkForWinningMove(value, moveType) {
			console.log("checkForWinningMove");
			for (let i = 0; i < 3; i++) {
				if (rows[i] < value) {
					foundOne = priorityInRow(i);
				};
				if (cols[i] < value) {
					foundOne = priorityInCol(i);
				}
			};
		};
		
		if (!(checkForLosingMove(threatOfLosing, "losing")) || remainingMoves < 7) {
			checkForWinningMove(findWinningMove, "winning");
		};
		console.log("Exit setBoxIfAvailable computerMoves:" + computerMoves);
	};

	const moveAIdefence = (index) => {

		movedIndex = clickedToArrayConversion(index);
		moveValue = Math.floor( remainingMoves / 2);
		if (currentPlayer == "computer") {
			rows[movedIndex[0]] -= moveValue;
			cols[movedIndex[1]] -= moveValue;
			if (!(diagonalBoxesBS.indexOf(index) < 0) ) {
				diagonal[0] -= moveValue;
			}	
			if (!(diagonalBoxesFS.indexOf(index) < 0) ) {
				diagonal[1] -= moveValue;
			}			
		} else {
			rows[movedIndex[0]] += moveValue;
			cols[movedIndex[1]] += moveValue;	
			if (!(diagonalBoxesBS.indexOf(index) < 0) ) {
				diagonal[0] += moveValue;
			}	
			if (!(diagonalBoxesFS.indexOf(index) < 0) ) {
				diagonal[1] += moveValue;
			}	
		}
	};
	const processComputerMoves = (tile, processType) => {
		let thisEntry = computerMoves.indexOf(tile);
		let moveTile = [];																		// because splice returns an array. Thank to @nhamilton's help.
		if (processType === "remove") {
  		//if (thisEntry === 0) { computerMoves.shift(); 	} else  {
	  		moveTile = computerMoves.splice(thisEntry, 1);
	  	//}	
		} else if (processType === "reorder" ) {
			moveTile = computerMoves.splice(thisEntry,1);
			computerMoves.unshift(moveTile[0]);			
		} else {
			console.log("Invalid " + processType + " in processComputerMoves");
		};
	};

	function setDomExclusion (showDom, thisDomExclusion) {
		for (let i=0; i< thisDomExclusion.length; i++) {
			if (showDom === thisDomExclusion[i]) {
				$(thisDomExclusion[i]).show();
			} else {
				$(thisDomExclusion[i]).hide();
			}
		}
	};

setDomExclusion("#start", gameDomEsclusion);

//* --------------------- *//
//* Events   section      *//
//* --------------------- *//
$( ".box" ).click(function() {
  let index = $( ".box" ).index( this );														// `this` is the DOM element OBJECT that was clicked
  setBoxIfAvailable(index);
});

$(".box")
	.mouseenter(function() {
		handleMouseEnterLeave($(this));
	})
	.mouseleave(function() {
		handleMouseEnterLeave($(this));
	});

$("#start .button").click( function() {
	namePlayer1 = $("#name-player1").val();								// grab player names.
	namePlayer2 = $("#name-player2").val();
	if ( (namePlayer1 > " ") || (namePlayer2 > " ") ) {		// one needs to be valid
		if ( !(namePlayer1 > " ")  ) {											// the other is set to computer
			namePlayer1 = "computer";
			computerPlayerExists = true;
		}
		if ( !(namePlayer2 > " ")  ) {
			namePlayer2 = "computer";
			computerPlayerExists = true;
		}
		newGameLogic();																			// start the game.
	} else {
		alert("Please enter player names");									// else you need to add one name.
	};	
});

$("#finish .button").click( function() {
	newGameLogic();
});

//}(); // wrapper end. DO NOT put code below here.
