/*
 * Title: "Just Get 10!" JS Game
 *
 * By: Katherine Donnally, December 2017
 *
 */
"use strict";

(function() {
	var gameParent,
		gameGrid,
		items,
		gameManager;

	gameParent 	= document.querySelector(".game-container--parent");
	gameGrid 	= document.querySelector(".game-container__grid");
	items 		= document.getElementsByClassName("game-grid__item");

	// take gameGrid           -> enable tap, pan, swipe inside
	gameManager = new Hammer.Manager(gameGrid, {
				recognizers: [
					[Hammer.Tap,{ interval: 500 }],
					[Hammer.Pan,{ threshold:0 }]
				]
	});

	// on load take items[i]  -> assign int from 1-3
	for (var i = 0; i < items.length; i++) {
		var num = Math.floor((Math.random() * 3) + 1);
		items[i].innerHTML = num;
		items[i].setAttribute("data-value", num.toString());
	}

	// take DOM elem 	       -> props:   {value:n, row:i, col:j, gridAreaFull:<str>}
	var attrsTemplate = (elem) => ({
		value: 				   parseInt(elem.getAttribute('data-value')),
		row:  				   parseInt(elem.getAttribute('data-grid-row')),
		col:  				   parseInt(elem.getAttribute('data-grid-col')),
		gridAreaFull: 		   elem.style.gridArea
	});

	/* take attrsTemplate obj  -> props:   {value: n, row: i, col: j, gridArea: ri-cj}
	 *						   -> getters: {itemsSameVal: NodeList, neighbors: Array(4)}
	 */
	class GameItem {
		constructor(attrs) {
			this.value 		   = attrs.value;
			this.row 		   = attrs.row;
			this.col 		   = attrs.col;
			this.gridArea 	   = attrs.gridAreaFull.slice(0,5);
		}
		get itemsSameVal() {
							   return document.querySelectorAll(`[data-value="${this.value}"]`);
		}
		get neighbors() {
							   return [
								  		`r${this.row + 1}-c${this.col}`,
								  		`r${this.row - 1}-c${this.col}`, 
								  		`r${this.row}-c${this.col + 1}`, 
								  		`r${this.row}-c${this.col - 1}`
								  	  ];
		}
	}

	// tap handler
	gameManager.on("tap", function(e) {
		console.log(e.type);
		console.log(e.tapCount);

		/* NB: 
		 * if items already highlighted & they're a diff value, deselect them
		 * if same value and already highlighted, squish them together and up the value
		 */
		if (document.querySelectorAll('.item-selected').length != 0) {
			if (document.querySelector('.item-selected').innerHTML != e.target.innerHTML) {
				for (let child of gameGrid.children) {
					child.classList.remove('item-selected');
				}
			}
			else {
				e.target.innerHTML = parseInt(e.target.innerHTML) + 1;
				e.target.setAttribute('data-value', e.target.innerHTML);
				for (let child of gameGrid.children) {
					if (child != e.target && child.classList.contains('item-selected')) {
					//	child.innerHTML = "test";
						child.remove();
					}
					child.classList.remove('item-selected');
				}	
			}
		}

		// highlight target
		e.target.classList.toggle('item-selected');

		// make event target a GameItem
		var tappedItem = new GameItem(attrsTemplate(e.target));
		console.log(tappedItem);

		// NodeList of all elems w/ same number as target
		var sameVal = tappedItem.itemsSameVal;

		// flood fill
		function highlightNeighbors(array) {
			var nextRound = [];
			for (var x=0; x < array.length; x++) {
				var active = new GameItem(attrsTemplate(array[x]));
				for (var i=0; i < sameVal.length; i++) {
					for (var g=0; g < active.neighbors.length; g++) {
						if (sameVal[i].style.gridArea.slice(0,5) == active.neighbors[g]) {
							sameVal[i].classList.add('item-selected');
							nextRound.push(sameVal[i]);
						}
					}
				}
			}
			if (nextRound.length == 0) {
				e.target.classList.remove('item-selected');
			}
			return nextRound;
		}
		
		var roundTwo = highlightNeighbors([e.target]);
		var roundThree = highlightNeighbors(roundTwo);
		var roundFour = highlightNeighbors(roundThree);
		var roundFive = highlightNeighbors(roundFour);
		var roundSix = highlightNeighbors(roundFive);

		/* Kristina's math school: make a loop for 25 of them ffs */

		/*

		// highlight next neighbors
		if (roundTwo.length > 0) {
			console.log(roundTwo);
			for (var i=0; i < roundTwo.length; i++) {
				console.log(roundTwo[i]);
				var active = new GameItem(attrsTemplate(roundTwo[i]));
				console.log(active);
				for (var j=0; j < sameVal.length; j++) {
					if (sameVal[i].style.gridArea.slice(0,5) == active.)	
				}
			}
		} */

		// highlight neighbors' neighbors
	/*	for (var i=0; i < sameVal.length; i++) {
			console.log(roundTwo[i]);
			var currentItem = new GameItem(attrsTemplate(roundTwo[i]));
			for (var g=0; g < currentItem.neighbors.length; g++) {
				if (sameVal[i].style.gridArea.slice(0,5) == currentItem.neighbors[g]) {
					sameVal[i].classList.add('item-selected');	
				}
			}
		} */
		


	});

	

})();


// function lessons:
/*
var player = new GamePlayer("John Smith", 15, 3);
The code above creates an instance of GamePlayer and stores the returned value in the variable player. In this case, you may want to define the function like this:

function GamePlayer(name,totalScore,gamesPlayed) {
  // `this` is the instance which is currently being created
  this.name =  name;
  this.totalScore = totalScore;
  this.gamesPlayed = gamesPlayed;
  // No need to return, but you can use `return this;` if you want
} */