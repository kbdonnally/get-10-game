/*
 * Title: "Just Get 10!" JS Game
 *
 * By: Katherine Donnally, December 2017
 *
 */
//"use strict";

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

	// manager for entire container
	var parentManager = new Hammer.Manager(gameParent, {
		recognizers: [ [Hammer.Tap, { interval: 500 }] ]
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


	// deselect if tap outside game region
	parentManager.on("tap", function(e) {
		if (e.target.classList.contains('game-grid__item') == false) {
			for (let child of document.querySelectorAll('.item-selected')) {
				child.classList.remove('item-selected');
			}
		}
	});

	// handle game interactions
	gameManager.on("tap", function(e) {
		console.log(e.type);
		console.log(e.tapCount);

		
		// CASE: there are already selected items present
		if (document.querySelectorAll('.item-selected').length != 0) {

			// simple delay function
			function delay(t) {
			   return new Promise(function(resolve) { 
			       setTimeout(resolve, t)
			   });
			}

			// x,y translate for each item
			function moveDown(child) {
				var childNums = attrsTemplate(child);
				var targetNums = attrsTemplate(e.target);
				var s = parseInt(e.target.offsetWidth);
				var changeX = (targetNums.col - childNums.col) * (s) + "px";
				var changeY = (targetNums.row - childNums.row) * (s) + "px";

				return new Promise(function(resolve, reject) {
					child.style.transform = `translate(${changeX}, ${changeY})`;

					if (child.style.transform == `translate(${changeX}, ${changeY})`) {
						resolve(child);
					}
					else {
						reject(Error(child.style));
					}
				});
			}

			// CASE: e.target is not in the group of selected items
			if (document.querySelector('.item-selected').innerHTML != e.target.innerHTML ||
				Array.prototype.includes.call(document.querySelectorAll('.item-selected'), e.target) == false) {
				for (let child of document.querySelectorAll('.item-selected')) {
					child.classList.remove('item-selected');
				}
			}

			// CASE: e.target is in group of selected items
			else if (Array.prototype.includes.call(document.querySelectorAll('.item-selected'), e.target)) {
				// increment target
				e.target.innerHTML = parseInt(e.target.innerHTML) + 1;
				e.target.setAttribute('data-value', e.target.innerHTML);
				e.target.classList.remove('item-selected');

				// all items except target:
				let selected = document.querySelectorAll('.item-selected');
				// PROMISES:
				Promise.all(selected).then( (items) => {
					for (let item of items) {
						moveDown(item);
					}
					return items;
				}).then( (items) => {
					return delay(1000).then( () => {
						for (let child of items) {
							child.parentNode.insertBefore(child, child.parentNode.firstChild);
						}
						return items;
					});
				}).then ( (items) => {
					for (let child of items) {
						let num = Math.floor((Math.random() * 3) + 1);
						child.innerHTML = num;
						child.setAttribute("data-value", num.toString());
						child.classList.remove('item-selected');
						child.style.transform = "translate(0,0)";
					}
					return items;
				}).then( (items) => {
					return delay(100).then( () => {
						let columns = document.querySelectorAll('[class*="game-flex__col--"]');
						Promise.all(columns).then( (columns) => {
							for (let column of columns) {
								for (let item of column.children) {
									item.style.order = Array.prototype.indexOf.call(column.children, item);
									item.setAttribute('data-grid-row', item.style.order);
								}
							}
							return columns;
						});
					});
				}).catch( (error) => console.log(error));
				/* MOVE THIS: 
				e.target.innerHTML = parseInt(e.target.innerHTML) + 1;
				e.target.setAttribute('data-value', e.target.innerHTML); */
			/*	for (let child of document.querySelectorAll('.item-selected')) {
					child.classList.remove('item-selected');
					if (child != e.target) {
						/* insert x/y transitions here! */
				/*		var childNums = attrsTemplate(child);
						var targetNums = attrsTemplate(e.target);
						var s = parseInt(e.target.offsetWidth);
						var changeX = (targetNums.col - childNums.col) * (s) + "px";
						var changeY = (targetNums.row - childNums.row) * (s) + "px";
					//	child.style.transform = `translate(${changeX}, ${changeY})`; */

						// PROMISES!!!

						

					/*	moveDown(child).then( function(div) {
							console.log("test");
							return delay(1000).then( function() {
								div.style.order = -8;
								div.style.backgroundColor = "purple";
								console.log("another test");
								return div;
							});
						}).then( function(div) {
							return delay(1000).then( function() {
								console.log("un-transform!");
								div.style.transform = "translate(0,0)";
								return div;
							});
						}).catch(function(error) {
							console.log(error);
						}); */
					



						/* now move elems up */
					//	child.parentNode.insertBefore(child, child.parentNode.firstChild);
					//	child.style.transform = "translate(0,0)";
						// reset value
					/*	let num = Math.floor((Math.random() * 3) + 1);
						child.innerHTML = num;
						child.setAttribute("data-value", num.toString()); */
				
			/*	for (let column of document.querySelectorAll('[class*="game-flex__col--"]')) {

					for (let item of column.children) {
						item.style.order = Array.prototype.indexOf.call(column.children, item);
						item.setAttribute('data-grid-row', item.style.order);
					}
				} */
			}
			else {
				console.log('This happened?');
			}
		}

		else {
			// highlight target
			e.target.classList.toggle('item-selected');

			// make event target a GameItem
			var tappedItem = new GameItem(attrsTemplate(e.target));
			console.log(tappedItem.itemsSameVal);

			// NodeList of all elems w/ same number as target
			var sameVal = tappedItem.itemsSameVal;

			// define flood fill
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

			// reset all row numbers
			for (let column of document.querySelectorAll('[class*="game-flex__col--"]')) {
				for (let item of column.children) {
					item.style.order = Array.prototype.indexOf.call(column.children, item);
					item.setAttribute('data-grid-row', item.style.order);
					let col = item.getAttribute('data-grid-col');
					item.setAttribute('data-position', `r${item.style.order}-c${col}`);
				}
			}
			
			// execute flood fill
			var roundTwo = highlightNeighbors([e.target]);
			var roundThree = highlightNeighbors(roundTwo);
			var roundFour = highlightNeighbors(roundThree);
			var roundFive = highlightNeighbors(roundFour);
			var roundSix = highlightNeighbors(roundFive);
			var roundSeven = highlightNeighbors(roundSix);
		}
		
	});
})();