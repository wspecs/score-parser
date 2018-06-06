"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./constant");
var RED_LUMINANCE = 0.2126;
var GREEN_LUMINANCE = 0.7152;
var BLUE_LUMINANCE = 0.0722;
exports.RED = [255, 0, 0];
exports.GREEN = [0, 255, 0];
exports.BLUE = [0, 0, 255];
exports.WHITE = [255, 255, 255];
exports.YELLOW = [255, 255, 0];
exports.PURPLE = [255, 0, 255];
exports.BROWN = [255, 153, 18];
exports.BLACK = [0, 0, 0];
exports.TEAL = [56, 142, 142];
function verifyColor(image, idx, rgb) {
    if (rgb === void 0) { rgb = exports.WHITE; }
    return image.bitmap.data[idx] === rgb[0] &&
        image.bitmap.data[idx + 1] === rgb[1] &&
        image.bitmap.data[idx + 2] === rgb[2];
}
exports.verifyColor = verifyColor;
function setColor(image, idx, rgb) {
    if (rgb === void 0) { rgb = [255, 255, 255]; }
    image.bitmap.data[idx] = rgb[0];
    image.bitmap.data[idx + 1] = rgb[1];
    image.bitmap.data[idx + 2] = rgb[2];
}
exports.setColor = setColor;
function setColorRed(image, idx) {
    setColor(image, idx, exports.RED);
}
exports.setColorRed = setColorRed;
function setColorWhite(image, idx) {
    setColor(image, idx, exports.WHITE);
}
exports.setColorWhite = setColorWhite;
function setColorGreen(image, idx) {
    setColor(image, idx, exports.GREEN);
}
exports.setColorGreen = setColorGreen;
function setColorBlue(image, idx) {
    setColor(image, idx, exports.BLUE);
}
exports.setColorBlue = setColorBlue;
function setColorBlack(image, idx) {
    setColor(image, idx, exports.BLACK);
}
exports.setColorBlack = setColorBlack;
function setColorYellow(image, idx) {
    setColor(image, idx, exports.YELLOW);
}
exports.setColorYellow = setColorYellow;
function replace(image, original, rep, x, y, width, height) {
    if (original === void 0) { original = exports.WHITE; }
    if (rep === void 0) { rep = exports.RED; }
    image.scan(x, y, width, height, function (newX, newY, idx) {
        if (verifyColor(image, idx, original)) {
            setColor(image, idx, rep);
        }
    });
}
exports.replace = replace;
function setBinary(image) {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var rgb = getRGB(image, idx);
        if (passForegroudTest(rgb.red, rgb.green, rgb.blue, 0)) {
            setColorWhite(image, idx);
        }
        else {
            setColorBlack(image, idx);
        }
    });
}
exports.setBinary = setBinary;
function getRGB(image, idx) {
    return {
        red: image.bitmap.data[idx],
        green: image.bitmap.data[idx + 1],
        blue: image.bitmap.data[idx + 2],
    };
}
exports.getRGB = getRGB;
function passForegroudTest(red, green, blue, treshhold) {
    if (treshhold === void 0) { treshhold = 0.3; }
    return ((RED_LUMINANCE * red) + (GREEN_LUMINANCE * green) + (BLUE_LUMINANCE * blue)) > (treshhold * 255);
}
exports.passForegroudTest = passForegroudTest;
function highlight(image, x, y, width, height, rgb, highlightForeground, greyIndex) {
    if (rgb === void 0) { rgb = exports.RED; }
    if (highlightForeground === void 0) { highlightForeground = true; }
    if (greyIndex === void 0) { greyIndex = constant_1.GREY_INDEX; }
    image.scan(x, y, width, height, function (x, y, idx) {
        var pixelRGB = getRGB(image, idx);
        if ((highlightForeground && passForegroudTest(pixelRGB.red, pixelRGB.green, pixelRGB.blue)) || !highlightForeground) {
            setColor(image, idx, rgb);
        }
    });
}
exports.highlight = highlight;
function getHighlightRangeSelection(image, color) {
    if (color === void 0) { color = exports.RED; }
    var selections = [];
    var _loop_1 = function (x) {
        var position = {};
        image.scan(x, 0, 1, image.bitmap.height, function (x, y, idx) {
            if (verifyColor(image, idx, color)) {
                if (!position.start) {
                    position.position = x;
                    position.start = y;
                }
                else {
                    position.end = y;
                }
            }
            else if (position.end && position.end - position.start >= 2) {
                selections.push(position);
                position = {};
            }
            else {
                position = {};
            }
        });
    };
    for (var x = 0; x < image.bitmap.width; x++) {
        _loop_1(x);
    }
    return selections;
}
exports.getHighlightRangeSelection = getHighlightRangeSelection;
function darkenWhitePixels(image, greyIndex) {
    if (greyIndex === void 0) { greyIndex = constant_1.GREY_INDEX; }
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var red = image.bitmap.data[idx];
        var green = image.bitmap.data[idx + 1];
        var blue = image.bitmap.data[idx + 2];
        if (red > greyIndex && green > greyIndex && blue > greyIndex) {
            setColorBlack(image, idx);
        }
    });
}
