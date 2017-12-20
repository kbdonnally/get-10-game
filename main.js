/*
 * Title: "Just Get 10!" JS Game
 *
 * By: Katherine Donnally, December 2017
 *
 */

(function() {
	var canvas,
		ctx;

	canvas = document.getElementById("game-canvas");

	if (ctx = canvas.getContext('2d')) {
		ctx.fillStyle = "rgba(212,0,255,.5)";
		ctx.fillRect(50,50,100,100);

		ctx.fillStyle = "rgba(125,0,255,.5)";
		ctx.fillRect(75,75,100,100);
	}
	// fallback
	else {
		canvas.innerHTML = "<img src='img/classy-fabric.png' alt='fallback image'>";
	}
})();