"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Jimp = require("jimp");
var image_1 = require("./image");
var color_1 = require("./color");
var staff_1 = require("./staff");
function analyzeScore(path) {
    Jimp.read(path).then(function (image) {
        image.greyscale();
        image.contrast(1);
        image.invert();
        color_1.setBinary(image);
        image_1.cropLeft(image);
        image_1.cropRight(image);
        staff_1.findStaffs(image);
        image.write('score.jpg');
        return true;
    }).catch(function (err) { return console.log(err); });
}
exports.analyzeScore = analyzeScore;
