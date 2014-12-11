/**
 * Created by jaclyn on 11/26/14.
 */
var staticurl
function myStatic(staticu) {
 staticurl = staticu
}
var CANVAS_WIDTH, CANVAS_HEIGHT, canvasHorizontalSpacing, ARROW_SIZE;
var main_arrows = [];
var moving_arrows = [];
TapTapRevolution = function(io){
    io.setBGColor('#5e3f6b');
    CANVAS_WIDTH = io.canvas.width
    CANVAS_HEIGHT = io.canvas.height
    canvasHorizontalSpacing = CANVAS_WIDTH / 8.0
    ARROW_SIZE = 42.0


//    Nonmoving arrows
    var rightArrowImage = new Image();
    var upArrowImage = new Image();
    var downArrowImage = new Image();
    var leftArrowImage = new Image();

    rightArrowImage.src = staticurl + "game/images/right-border@1.5x.png";
    upArrowImage.src = staticurl + "game/images/up-border@1.5x.png";
    downArrowImage.src = staticurl + "game/images/down-border@1.5x.png";
    leftArrowImage.src = staticurl + "game/images/left-border@1.5x.png";
    var rightArrow, upArrow, downArrow, leftArrow;
    rightArrowImage.onload = function(){
        rightArrow = new iio.SimpleRect(CANVAS_WIDTH - canvasHorizontalSpacing,CANVAS_HEIGHT-ARROW_SIZE, 42, 42).createWithImage(rightArrowImage);
        main_arrows.push(rightArrow)
    }
    upArrowImage.onload = function(){
            upArrow = new iio.SimpleRect(CANVAS_WIDTH - (canvasHorizontalSpacing * 3.0), CANVAS_HEIGHT-ARROW_SIZE, 42, 42).createWithImage(upArrowImage);
        main_arrows.push(upArrow)
    }
    downArrowImage.onload = function(){
                downArrow = new iio.SimpleRect(canvasHorizontalSpacing * 3.0, CANVAS_HEIGHT-ARROW_SIZE, 42, 42).createWithImage(downArrowImage);
                main_arrows.push(downArrow)

    }

    leftArrowImage.onload = function() {
        leftArrow = new iio.SimpleRect(canvasHorizontalSpacing, CANVAS_HEIGHT-ARROW_SIZE, 42, 42).createWithImage(leftArrowImage);
        main_arrows.push(leftArrow)
    }


     // Moving arrows

    var rightArrowMovingImage = new Image();
    var upArrowMovingImage = new Image();
    var downArrowMovingImage = new Image();
    var leftArrowMovingImage = new Image();

    rightArrowMovingImage.src = staticurl + "game/images/right-filled.5x.png";
    upArrowMovingImage.src = staticurl + "game/images/up-filled@1.5x.png";
    downArrowMovingImage.src = staticurl + "game/images/down-filled@1.5x.png";
    leftArrowMovingImage.src = staticurl + "game/images/left-filled@1.5x.png";
    var rightArrowMoving, upArrowMoving, downArrowMoving, leftArrowMoving;
    rightArrowMovingImage.onload = function(){
            rightArrowMoving = new iio.SimpleRect(CANVAS_WIDTH - canvasHorizontalSpacing, 0, 42, 42)
                .createWithImage(rightArrowMovingImage)
                .enableKinematics()
                .setVel(0,2)
                .setBound('bottom',CANVAS_HEIGHT+ARROW_SIZE);

    }

        upArrowMovingImage.onload = function(){
             upArrowMoving = new iio.SimpleRect(CANVAS_WIDTH - (canvasHorizontalSpacing * 3.0), 0, 42, 42)
                 .createWithImage(upArrowMovingImage)
                 .enableKinematics()
                 .setVel(0,2)
                 .setBound('bottom',CANVAS_HEIGHT+ARROW_SIZE);

        }
        downArrowMovingImage.onload = function(){
             downArrowMoving = new iio.SimpleRect(canvasHorizontalSpacing * 3.0, 0, 42, 42)
                 .createWithImage(downArrowMovingImage)
                 .enableKinematics()
                  .setVel(0,2)
                  .setBound('bottom',CANVAS_HEIGHT+ARROW_SIZE);
        }

        leftArrowMovingImage.onload = function() {
            leftArrowMoving = new iio.SimpleRect(canvasHorizontalSpacing, 0, 42, 42).createWithImage(leftArrowMovingImage)
                 .enableKinematics()
                 .setVel(0,2)
                 .setBound('bottom',CANVAS_HEIGHT+ARROW_SIZE);
        }



        io.addObj(leftArrow);
        io.setFramerate(60);
    };


};

function starttap() {
    iio.start(TapTapRevolution);
}