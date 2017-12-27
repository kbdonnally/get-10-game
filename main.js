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
		gameManager,
		parentManager,
		attrsTemplate;

	gameParent 	= document.querySelector(".game-container--parent");
	gameGrid 	= document.querySelector(".game-container__flex");
	items 		= document.getElementsByClassName("game-grid__item");

	// manager for entire container
	parentManager = new Hammer.Manager(gameParent, {
		recognizers: [ 
			[Hammer.Tap, { event: 'doubletap', taps:2 }],
			[Hammer.Tap, { event: 'singletap', taps:1 }]
		]
	});

	// manager for game space
	gameManager = new Hammer.Manager(gameGrid, {
				recognizers: [
					[Hammer.Tap,{ event: 'doubletap', taps:2 }],
					[Hammer.Tap,{ event: 'singletap', taps:1 }],
					[Hammer.Pan,{ threshold:0 }]
				]
	});

	// simultaneously recognize both events
	gameManager.get('doubletap').recognizeWith('singletap');

	// take DOM elem  		   -> props: {value:n, row:i, col:j, position: ri-cj}
	attrsTemplate = (elem) => ({
		value: 				   parseInt(elem.getAttribute('data-value')),
		row:  				   parseInt(elem.getAttribute('data-grid-row')),
		col:  				   parseInt(elem.getAttribute('data-grid-col')),
		position: 			   elem.getAttribute('data-position')
	});

	// take attrsTemplate obj  -> props:   {value: n, row: i, col: j, position: ri-cj}
	//						   -> getters: {itemsSameVal: NodeList, neighbors: Array(4)}
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

	// SETUP:
	// on load take game items -> assign int from 1-3
	for (var i = 0; i < items.length; i++) {
		var num = Math.floor((Math.random() * 3) + 1);
		items[i].innerHTML = num;
		items[i].setAttribute("data-value", num.toString());
	}

	// EVENT HANDLERS:
	// 1. deselect if tap outside game region
	parentManager.on("doubletap singletap", function(e) {
		if (e.target.classList.contains('game-grid__item') == false) {
			for (let child of document.querySelectorAll('.item-selected')) {
				child.classList.remove('item-selected');
			}
		}
	});

	// 2. game interactions
	gameManager.on("singletap doubletap", function(e) {
		console.log(e.type);
		console.log(e.tapCount);
	
		// CASE 1.0: there are already selected items present
		if (document.querySelectorAll('.item-selected').length != 0) {
			// FUNCTIONS:
			// 1. delay by t (ms)
			function delay(t) {
			   return new Promise(function(resolve) { 
			       setTimeout(resolve, t)
			   });
			}
			// 2. x,y translate for each item
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
			// END FUNCTIONS

			// CASE 1.1: e.target is not in the group of selected items
			if (document.querySelector('.item-selected').innerHTML != e.target.innerHTML ||
				Array.prototype.includes.call(document.querySelectorAll('.item-selected'), e.target) == false) {
				for (let child of document.querySelectorAll('.item-selected')) {
					child.classList.remove('item-selected');
				}
			}

			// CASE 1.2: e.target is in group of selected items
			else if (Array.prototype.includes.call(document.querySelectorAll('.item-selected'), e.target) ||
					 e.type == 'doubletap') {
				// increment & deselect target
				e.target.innerHTML = parseInt(e.target.innerHTML) + 1;
				e.target.setAttribute('data-value', e.target.innerHTML);
				e.target.classList.remove('item-selected');

				// all items *except* target:
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
			}

			// CASE 1.3: computer wat r u doin
			else {
				console.log('This happened?');
			}
		}

		// CASE 2.0: no items selected yet
		else {
			var tappedItem,
				sameVal,
				nextRound,
				active;

			e.target.classList.toggle('item-selected');

			tappedItem 	= new GameItem(attrsTemplate(e.target));
			sameVal 	= tappedItem.itemsSameVal; // type: NodeList

			// FUNCTION:
			// 1. define flood fill
			function highlightNeighbors(array) {
				nextRound = [];
				for (var x=0; x < array.length; x++) {
					active = new GameItem(attrsTemplate(array[x]));
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
			var roundTwo 	= highlightNeighbors([e.target]);
			var roundThree 	= highlightNeighbors(roundTwo);
			var roundFour 	= highlightNeighbors(roundThree);
			var roundFive 	= highlightNeighbors(roundFour);
			var roundSix 	= highlightNeighbors(roundFive);
			var roundSeven 	= highlightNeighbors(roundSix);
		}
	});
})();