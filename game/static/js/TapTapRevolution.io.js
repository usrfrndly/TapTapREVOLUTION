/**
 * Created by jaclyn on 11/26/14.
 */

TapTapRevolution = function (io) {
    io.setBGColor('#5e3f6b');

    var leftArrowImage = new Image();
    leftArrowImage.src = 'DiscoBallIconNoTip.png';
    leftArrowImage.onload = function () {
        var leftArrow = new iio.SimpleRect(io.canvas.center.x, 0)
            .createWithImage(leftArrowImage)
            .enableKinematics()
            .setVel(0, 2)
            .setBound('bottom', io.canvas.height+80);
        io.addObj(leftArrow);
        io.setFramerate(60);
    }


};
