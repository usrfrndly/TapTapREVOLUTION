{%
    load
    staticfiles %
}
<!doctype html>
    <html>
        <head>


        </head>
        <body>

            <script type='text/javascript' src="{% static 'game/soundmanager2/script/soundmanager2.js' %}"></script>

            <script type='text/javascript' src="{% static 'game/js/iioEngine.min.js' %}"></script>
            <script type="text/javascript" src="{% static 'game/js/iioDebugger.js' %}"></script>


            <script type="text/javascript">
            function TapTapRevolution(io) {
                var songinfo =
                {{ song | safe }}
                var bpm_overall;
                bpm_overall = songinfo[0].bpm;
                var beat_times = songinfo[0].beats_position.split(',')
                var bpm_measured = songinfo[0].bpm_estimates.split(',')
                var length = songinfo[0].length;
                var chord_progression = songinfo[0].chord_progression.split(',')
                var song_file = songinfo[0].song_file;
                console.log(songinfo[0])
                var staticurl;
                io.activateDebugger();
                staticurl = '/static/';
                var CANVAS_WIDTH = io.canvas.width;
                var CANVAS_HEIGHT = io.canvas.height;
                var canvasHorizontalSpacing = CANVAS_WIDTH / 8.0;
                var ARROW_SIZE = 42.0;
                var score = 0;
                var main_arrows;
                main_arrows = [];
                var moving_arrows = [];
                var scoreText;
                var bpsoverall = bpm_overall / 60.0;
                var current_framerate = 60.0

                //beats per sec

                soundManager.setup({
                url: "{% static 'soundmanager2/swf/' %}",
                onready: function () {

                var mySound = soundManager.createSound({
                id: 'aSound',
                url: song_file
                onload: function () {
                var bpm_chunks = bpm_measured.chunk(10);
                var beat_times_chunked = beat_times.chunk(10);
                for (i = 0; i < beat_times_chunked.length; i++) {
                var avg = bpm_chunks[i].average();
                var interval_avg_bps = avg / 60.0
                var factor = interval_avg_bps / bpsoverall
                var beatchunks = [beat_times_chunked[i], bpm_chunks[i], factor]
                }

                for (i = 0; i < beatchunks.length; i++) {
                soundManager.onPosition(beatchunks[i][0], function (eventPosition) {
                console.log(this.id + ' reached ' + eventPosition);
                //divide it for seconds
                current_framerate = beatchunks[i][3] * current_framerate
                console.log(this.id + ' reached ' + eventPosition)

                });
                fireBeat(current_framerate)

                }
                )

                mySound.play();
                console.log('sound loaded!', this);
                }
                // other options here..
                });
                },
                ontimeout: function () {
                // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
                }
                });

                (function () {

                io.setBGColor('#5e3f6b');

                //io.addObj(new iio.Text('Your Score:', CANVAS_WIDTH - 100, 70)
                io.addObj(new iio.Text('Your Score:', io.canvas.width - 150, 70)
                .setFont('30px Century Gothic')
                .setTextAlign('right')
                .setFillStyle('#ffffff'));
                scoreText = io.addObj(new iio.Text(score, io.canvas.width - 100, 70)
                .setFont('30px Century Gothic')
                .setTextAlign('right')
                .setFillStyle('#ffffff'));
                })();


                // Move to top
                var moveToTop = function (obj, direction) {
                if (direction == 0) {
                obj.setPos(CANVAS_WIDTH - canvasHorizontalSpacing, 0)
                }
                else if (direction == 1) {
                obj.setPos(CANVAS_WIDTH - (canvasHorizontalSpacing * 3.0), 0)
                return true;
                }
                else if (direction == 2) {
                obj.setPos((canvasHorizontalSpacing * 3.0), 0)
                }
                else if (direction == 3) {
                obj.setpos(canvasHorizontalSpacing, 0)
                }


                }

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

//      for (var i = 0; i < main_arrows.length; i++) {
//          io.addObj(main_arrows[i])
//      }

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
                .setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE, moveToTop(0));
                moving_arrows.push(rightArrowMoving)
                io.addObj(rightArrowMoving)

                }

                upArrowMovingImage.onload = function () {
                upArrowMoving = new iio.SimpleRect(CANVAS_WIDTH - (canvasHorizontalSpacing * 3.0), 0, 42, 42)
                .createWithImage(upArrowMovingImage)
                .enableKinematics()
                .setVel(0, 2)
                .setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE, moveToTop(1));

                moving_arrows.push(upArrowMoving);
                io.addObj(upArrowMoving)

                }

                downArrowMovingImage.onload = function () {
                downArrowMoving = new iio.SimpleRect(canvasHorizontalSpacing * 3.0, 0, 42, 42)
                .createWithImage(downArrowMovingImage)
                .enableKinematics()
                .setVel(0, 2)
                .setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE, moveToTop(2));
                moving_arrows.push(downArrowMoving);
                io.addObj(downArrowMoving)

                }

                leftArrowMovingImage.onload = function () {
                leftArrowMoving = new iio.SimpleRect(canvasHorizontalSpacing, 0, 42, 42).createWithImage(leftArrowMovingImage)
                .enableKinematics()
                .setVel(0, 2)
                .setBound('bottom', CANVAS_HEIGHT + ARROW_SIZE, moveToTop(3));
                moving_arrows.push(leftArrowMoving);
                io.addObj(leftArrowMoving)
                }
//      for (var ix = 0; ix < moving_arrows.length; ix++) {
//          io.addObj(moving_arrows[ix])
//      }
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

                // fireBeat(framerate) = io.setFramerate(bpm_overall, function () {
                //     //update the player
                //     updateScore();

                var fireBeat;
                fireBeat = function (framerate) {
                io.setFramerate(framerate, function () {
                var arrowkey = iio.getRandomInt(1, 4)
                moving_arrows[arrowkey].setVel(0, 2)
                //     //update the player
                updateScore();
                })
                };

                //create new meteors 2% of the time
//      if (iio.getRandomNum() < .02)
//          for (var i = 0; i < meteorDensity; i++) {
//              var x = iio.getRandomInt(30, io.canvas.width - 30);
//              var y = iio.getRandomInt(-800, -50);
//              if (iio.getRandomNum() < smallToBig)
//                  createMeteor(true, x, y);
//              else createMeteor(false, x, y);
//          }

                }
                )


                Array.prototype.average = function () {
                var sum = 0;
                var j = 0;
                for (var i = 0; i < this.length; i++) {
                if (isFinite(this[i])) {
                sum = sum + parseFloat(this[i]);
                j++;
                }
                }
                if (j === 0) {
                return 0;
                } else {
                return sum / j;
                }

                }
                Array.prototype.chunk = function (chunkSize) {
                var array = this;
                return [].concat.apply([],
                array.map(function (elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
                })
                );
                };

                }
            iio.start(TapTapRevolution);
            </script>

        </body>
    </html>
/**
 * Created by jaclyn on 12/12/14.
 */
