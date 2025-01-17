

function TapTapRevolution(io) {
	var staticurl;
	io.activateDebugger();
	staticurl = '/static/';
	var CANVAS_WIDTH = io.canvas.width;
	var CANVAS_HEIGHT = io.canvas.height;
	var canvasHorizontalSpacing = CANVAS_WIDTH / 8.0;
	var ARROW_SIZE = 42.0;
	var score = 0;
	var main_arrows = [];
	var moving_arrows = [];
	var scoreText;
	(function () {

		io.setBGColor('#5e3f6b');

		//io.addObj(new iio.Text('Your Score:', CANVAS_WIDTH - 100, 70)
		io.addObj(new iio.Text('Your Score:', io.canvas.width-150, 70)
			.setFont('30px Century Gothic')
			.setTextAlign('right')
			.setFillStyle('#ffffff'));
		scoreText = io.addObj(new iio.Text(score, io.canvas.width - 100, 70)
			.setFont('30px Century Gothic')
			.setTextAlign('right')
			.setFillStyle('#ffffff'));
	})();


	// Move to top

	/**
	 * Score Board
	 */
	(function () {
		var playerSpeed = 8;
		/*
		 //    Nonmoving arrows
		 */
		var rightArrowImage = new Image();
		var upArrowImage = new Image();
		var downArrowImage = new Image();
		var leftArrowImage = new Image();

		rightArrowImage.src = staticurl + "game/images/right-border@1.5x.png";
		upArrowImage.src = staticurl + "game/images/up-border@1.5x.png";
		downArrowImage.src = staticurl + "game/images/down-border@1.5x.png";
		leftArrowImage.src = staticurl + "game/images/left-border@1.5x.png";
		var rightArrow, upArrow, downArrow, leftArrow;
		rightArrowImage.onload = function () {
			rightArrow = new iio.SimpleRect(CANVAS_WIDTH - canvasHorizontalSpacing, CANVAS_HEIGHT - ARROW_SIZE, 42, 42)
				.createWithImage(rightArrowImage);
			main_arrows.push(rightArrow)
			io.addObj(rightArrow)

		}

		upArrowImage.onload = function () {
			upArrow = new iio.SimpleRect(CANVAS_WIDTH - (canvasHorizontalSpacing * 3.0), CANVAS_HEIGHT - ARROW_SIZE, 42, 42)
				.createWithImage(upArrowImage);
			main_arrows.push(upArrow)
			io.addObj(upArrow)

		}

		downArrowImage.onload = function () {
			downArrow = new iio.SimpleRect(canvasHorizontalSpacing * 3.0, CANVAS_HEIGHT - ARROW_SIZE, 42, 42)
				.createWithImage(downArrowImage);
			main_arrows.push(downArrow)
			io.addObj(downArrow)


		}

		leftArrowImage.onload = function () {
			leftArrow = new iio.SimpleRect(canvasHorizontalSpacing, CANVAS_HEIGHT - ARROW_SIZE, 42, 42)
				.createWithImage(leftArrowImage);
			main_arrows.push(leftArrow)
			io.addObj(leftArrow)


		}

//		for (var i = 0; i < main_arrows.length; i++) {
//			io.addObj(main_arrows[i])
//		}

		/*******************/
		/*  Moving arrows */

		var rightArrowMovingImage = new Image();
		var upArrowMovingImage = new Image();
		var downArrowMovingImage = new Image();
		var leftArrowMovingImage = new Image();

		rightArrowMovingImage.src = staticurl + "game/images/right-filled@1.5x.png";
		upArrowMovingImage.src = staticurl + "game/images/up-filled@1.5x.png";
		downArrowMovingImage.src = staticurl + "game/images/down-filled@1.5x.png";
		leftArrowMovingImage.src = staticurl + "game/images/left-filled@1.5x.png";
		var rightArrowMoving, upArrowMoving, downArrowMoving, leftArrowMoving;
		rightArrowMovingImage.onload = function () {
			rightArrowMoving = new iio.SimpleRect(CANVAS_WIDTH - canvasHorizontalSpacing, 0, 42, 42)
				.createWithImage(rightArrowMovingImage)
				.enableKinematics()
				.setVel(0, 2)
				.setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE);
			moving_arrows.push(rightArrowMoving)
			io.addObj(rightArrowMoving)

		}

		upArrowMovingImage.onload = function () {
			upArrowMoving = new iio.SimpleRect(CANVAS_WIDTH - (canvasHorizontalSpacing * 3.0), 0, 42, 42)
				.createWithImage(upArrowMovingImage)
				.enableKinematics()
				.setVel(0, 2)
				.setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE);

			moving_arrows.push(upArrowMoving);
			io.addObj(upArrowMoving)

		}

		downArrowMovingImage.onload = function () {
			downArrowMoving = new iio.SimpleRect(canvasHorizontalSpacing * 3.0, 0, 42, 42)
				.createWithImage(downArrowMovingImage)
				.enableKinematics()
				.setVel(0, 2)
				.setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE);
			moving_arrows.push(downArrowMoving);
			io.addObj(downArrowMoving)

		}

		leftArrowMovingImage.onload = function () {
			leftArrowMoving = new iio.SimpleRect(canvasHorizontalSpacing, 0, 42, 42).createWithImage(leftArrowMovingImage)
				.enableKinematics()
				.setVel(0, 2)
				.setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE);
			moving_arrows.push(leftArrowMoving);
			io.addObj(leftArrowMoving)
		}
//		for (var ix = 0; ix < moving_arrows.length; ix++) {
//			io.addObj(moving_arrows[ix])
//		}
		var RIGHT = 0;
		var UP = 1;
		var DOWN = 2;
		var LEFT = 3;
		var input = [];
		updateInput = function (event, boolValue) {
			if (iio.keyCodeIs('left arrow', event)) {
				input[LEFT] = boolValue;
			}
			if (iio.keyCodeIs('right arrow', event)) {
				input[RIGHT] = boolValue;
			}

			if (iio.keyCodeIs('up arrow', event)) {
				input[UP] = boolValue;
				event.preventDefault();


			}
			if (iio.keyCodeIs('down arrow', event)) {
				input[DOWN] = boolValue;
				event.preventDefault();

			}
		}

		updateScore = function () {
			var overlaps = [];

			if (input[LEFT] == true && (iio.intersects(moving_arrows[LEFT], main_arrows[LEFT]) == true)) {
				overlaps.push(LEFT);
			}
			if (input[RIGHT] == true && (iio.intersects(moving_arrows[RIGHT], main_arrows[RIGHT]) == true)) {
				overlaps.push(RIGHT);
			}
			if (input[UP] == true && (iio.intersects(moving_arrows[UP], main_arrows[UP]) == true)) {
				overlaps.push(UP);
			}
			if (input[DOWN] == true && (iio.intersects(moving_arrows[DOWN], main_arrows[DOWN]) == true)) {
				overlaps.push(DOWN);
			}
			if (overlaps.length > 0) {
				var pointsToAdd = 0;
				for (var o = 0; o < overlaps.length; o++) {
					pointsToAdd += 2
				}
				score += pointsToAdd;
				scoreText.setText(score.toString());
			}
		}

		window.addEventListener('keydown', function (event) {
			updateInput(event, true);
		});

		window.addEventListener('keyup', function (event) {
			updateInput(event, false);
		});

	})();
//Main Update Function
	io.setFramerate(bpm_overall, function(){
		//update the player
		updateScore();

		//create new meteors 2% of the time
//		if (iio.getRandomNum() < .02)
//			for (var i = 0; i < meteorDensity; i++) {
//				var x = iio.getRandomInt(30, io.canvas.width - 30);
//				var y = iio.getRandomInt(-800, -50);
//				if (iio.getRandomNum() < smallToBig)
//					createMeteor(true, x, y);
//				else createMeteor(false, x, y);
//			}

	});




}