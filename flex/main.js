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
	gameGrid 	= document.querySelector(".game-container__flex");
	items 		= document.getElementsByClassName("game-grid__item");

	// take gameGrid           -> enable tap, pan in it
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
		position: 			   elem.getAttribute('data-position')
	});

	/* take attrsTemplate obj  -> props:   {value: n, row: i, col: j, gridArea: ri-cj}
	 *						   -> getters: {itemsSameVal: NodeList, neighbors: Array(4)}
	 */
	class GameItem {
		constructor(attrs) {
			this.value 		   = attrs.value;
			this.row 		   = attrs.row;
			this.col 		   = attrs.col;
			this.position	   = attrs.position;
		}
		get itemsSameVal() { 
							   let elems = document.querySelectorAll(`[data-value="${this.value}"]`);
							   return Array.prototype.filter.call(elems, elem => 
							   	parseInt(elem.getAttribute('data-grid-row')) > 9);
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

	// handle taps
	gameManager.on("tap", function(e) {
		console.log(e.type);
		console.log(e.tapCount);

		/* NB: 
		 * if items already highlighted & they're a diff value, deselect them
		 * if same value and already highlighted, squish them together and up the value
		 */
		if (document.querySelectorAll('.item-selected').length != 0) {
			if (document.querySelector('.item-selected').innerHTML != e.target.innerHTML) {
				console.log(document.querySelector('.item-selected').innerHTML);
				console.log(gameGrid.children);
				for (let child of document.querySelectorAll('.item-selected')) {
					console.log(child);
					child.classList.remove('item-selected');
				}
			}
			else if (document.querySelector('.item-selected').innerHTML == e.target.innerHTML) {
				e.target.innerHTML = parseInt(e.target.innerHTML) + 1;
				e.target.setAttribute('data-value', e.target.innerHTML);
				for (let child of document.querySelectorAll('.item-selected')) {
					child.classList.remove('item-selected');
					if (child != e.target) {
						console.log(child.parentNode.firstElementChild);
						child.parentNode.insertBefore(child, child.parentNode.firstChild);
						// reset value
						let num = Math.floor((Math.random() * 3) + 1);
						child.innerHTML = num;
						child.setAttribute("data-value", num.toString());
					}
				}
				for (let column of document.querySelectorAll('[class*="game-flex__col--"]')) {
					for (let item of column.children) {
						item.style.order = Array.prototype.indexOf.call(column.children, item);
						item.setAttribute('data-grid-row', item.style.order);
					}
				}	
			}
			else {
				console.log('This happened?');
			}
		}

		// highlight target
		e.target.classList.toggle('item-selected');

		// make event target a GameItem
		var tappedItem = new GameItem(attrsTemplate(e.target));
		console.log(tappedItem.itemsSameVal);

		// NodeList of all elems w/ same number as target
		var sameVal = tappedItem.itemsSameVal;

		// flood fill
		function highlightNeighbors(array) {
			var nextRound = [];
			for (var x=0; x < array.length; x++) {
				var active = new GameItem(attrsTemplate(array[x]));
				for (var i=0; i < sameVal.length; i++) {
					for (var g=0; g < active.neighbors.length; g++) {
						if (sameVal[i].getAttribute('data-position') == active.neighbors[g]) {
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

		for (let column of document.querySelectorAll('[class*="game-flex__col--"]')) {
			for (let item of column.children) {
				item.style.order = Array.prototype.indexOf.call(column.children, item);
				item.setAttribute('data-grid-row', item.style.order);
				let col = item.getAttribute('data-grid-col');
				item.setAttribute('data-position', `r${item.style.order}-c${col}`);
			}
		}
		
		var roundTwo = highlightNeighbors([e.target]);
		var roundThree = highlightNeighbors(roundTwo);
		var roundFour = highlightNeighbors(roundThree);
		var roundFive = highlightNeighbors(roundFour);
		var roundSix = highlightNeighbors(roundFive);
	});
})();