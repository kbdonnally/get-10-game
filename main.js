/*
 * Title: "Just Get 10!" JS Game
 *
 * By: Katherine Donnally, December 2017
 *
 */

(function() {
	var gameParent,
		gameGrid,
		items,
		gameManager;

	gameParent = document.querySelector(".game-container--parent");
	gameGrid = document.querySelector(".game-container__grid");
	items = document.getElementsByClassName("game-grid__item");

	// generate random number, assign to HTML & attribute
	for (var i = 0; i < items.length; i++) {
		var num = Math.floor((Math.random() * 3) + 1);
		items[i].innerHTML = num;
		items[i].setAttribute("data-value", num.toString());
	}

	// recognize tap, pan, swipe in game container
	gameManager = new Hammer.Manager(gameGrid, {
		recognizers: [
			[Hammer.Tap],
			[Hammer.Tap,{ event: 'doubletap', taps: 2}],
			[Hammer.Pan,{ threshold:0 }],
			[Hammer.Swipe,{ direction: Hammer.DIRECTION_HORIZONTAL }],
		]
	});

	// change item style if tapped
	gameManager.on("tap", function(e) {
		console.log(e.type);
		e.target.classList.toggle('item-selected');
		item = {
			value: parseInt(e.target.getAttribute('data-value')),
			row:  parseInt(e.target.getAttribute('data-grid-row')),
			column:  parseInt(e.target.getAttribute('data-grid-col')),
			get rowAbove() {
				return this.row - 1;
			},
			get rowBelow() {
				return this.row + 1;
			},
			get rowItems() {
				return document.querySelectorAll(`[data-grid-row="${this.row}"]`);
			},
			get columnItems() {
				return document.querySelectorAll(`[data-grid-col="${this.column}"]`);
			},
		}
		console.log(item.rowItems);
		console.log(item.columnItems);
	});


})();