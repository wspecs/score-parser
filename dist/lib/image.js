"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./constant");
var utils_1 = require("./utils");
function getAllPixels(image, border) {
    if (border === void 0) { border = 0; }
    var pixels = [];
    for (var x = border; x < image.bitmap.width - border; x++) {
        for (var y = border; y < image.bitmap.height - border; y++) {
            pixels.push({ x: x, y: y });
        }
    }
    return pixels;
}
exports.getAllPixels = getAllPixels;
function cropImage(image, x, y, width, height, treshhold, greyIndex) {
    if (treshhold === void 0) { treshhold = 0.005; }
    if (greyIndex === void 0) { greyIndex = constant_1.GREY_INDEX; }
    return utils_1.getBinaryDistribution(image, x, y, width, height, greyIndex).foreground < treshhold;
}
exports.cropImage = cropImage;
function cropLeft(image) {
    var crop = 0;
    for (var width = 5; width < image.bitmap.width; width += 10) {
        if (cropImage(image, 0, 0, width, image.bitmap.height)) {
            crop = width;
        }
        else {
            break;
        }
    }
    if (crop) {
        image.crop(crop, 0, image.bitmap.width - crop, image.bitmap.height);
    }
}
exports.cropLeft = cropLeft;
function cropRight(image) {
    var crop = 0;
    var interval = 5;
    for (var width = interval; width < image.bitmap.width; width += interval) {
        if (cropImage(image, image.bitmap.width - width, 0, width, image.bitmap.height, 0.01)) {
            crop = width;
        }
        else {
            break;
        }
    }
    if (crop) {
        image.crop(0, 0, image.bitmap.width - crop, image.bitmap.height);
    }
}
exports.cropRight = cropRight;
function saveClone(image, path, x, y, width, height) {
    var clone = image.clone();
    clone.crop(x, y, width, height);
    clone.write(path);
}
exports.saveClone = saveClone;
