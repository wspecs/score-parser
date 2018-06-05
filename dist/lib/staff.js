"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./constant");
var utils_1 = require("./utils");
var color = require("./color");
var constant_2 = require("./constant");
var image_1 = require("./image");
function getHorizontalClassications(image, positions) {
    var classifications = positions.reduce(function (res, curr) {
        if (res.length > 0 && res[res.length - 1].end + 1 == curr) {
            res[res.length - 1].end = curr;
        }
        else {
            res.push({ start: curr, end: curr });
        }
        return res;
    }, []);
    var staffSpaceSize = getStaffSpaceSize(image);
    classifications = classifications.map(function (x) { return Object.assign(x, { classfication: utils_1.getSpaceClassication(x.start, x.end, staffSpaceSize)
    }); });
    return classifications;
}
exports.getHorizontalClassications = getHorizontalClassications;
function getStaffSpaceSize(image, staffLines, staffPadding) {
    if (staffLines === void 0) { staffLines = constant_1.STAFF_LINE_COUNT; }
    if (staffPadding === void 0) { staffPadding = constant_1.STAFF_PADDING; }
    return (image.bitmap.height - (2 * staffPadding)) / (staffLines - 1);
}
exports.getStaffSpaceSize = getStaffSpaceSize;
function removeLine(image, line) {
    image.scan(0, line, image.bitmap.width, 1, function (x, y, idx) {
        color.setColorBlack(image, idx);
    });
}
exports.removeLine = removeLine;
function fillLineGap(image, line) {
    image.scan(0, line, image.bitmap.width, 1, function (x, y, idx) {
        var fill = false;
        var topPixel = image.bitmap.data[image.getPixelIndex(x, y - 1)];
        if (topPixel > constant_2.GREY_INDEX) {
            fill = true;
        }
        if (fill) {
            color.setColorWhite(image, idx);
        }
    });
}
exports.fillLineGap = fillLineGap;
function getStaffLines(image) {
    var interval = 1;
    var heights = [];
    var staffLines = [];
    for (var height = 0; height < image.bitmap.height; height += interval) {
        heights.push(height);
        var distribution = utils_1.getBinaryDistribution(image, 0, height, image.bitmap.width, 1);
        if (distribution.white > 0.75) {
            staffLines.push(height);
        }
    }
    return staffLines;
}
exports.getStaffLines = getStaffLines;
function getStaffBoundaries(staffLines) {
    return staffLines.reduce(function (res, curr) {
        if (res.length === 0) {
            // First line for the staff
            res.push({ start: curr, end: curr });
        }
        else if (curr > (res[res.length - 1].end + 20)) {
            // End too far new staff
            res.push({ start: curr, end: curr });
        }
        else {
            // Update staff end.
            res[res.length - 1].end = curr;
        }
        return res;
    }, []);
}
exports.getStaffBoundaries = getStaffBoundaries;
function findStaffs(image) {
    var staffLines = getStaffLines(image);
    var staffBoundaries = getStaffBoundaries(staffLines);
    console.log(staffLines);
    saveStaffs(image, staffBoundaries);
}
exports.findStaffs = findStaffs;
/**
 * Saves the images for each staff found in the piece.
 */
function saveStaffs(image, staffBoundaries) {
    for (var _i = 0, staffBoundaries_1 = staffBoundaries; _i < staffBoundaries_1.length; _i++) {
        var boundary = staffBoundaries_1[_i];
        var boundaryOffset = (boundary.end - boundary.start) * constant_1.STAFF_PADDING; // Pixels to go up and down staff;
        image_1.saveClone(image, constant_1.TEMP_IMAGE_PATH + "/staff/" + boundary.start + ".jpg", 0, boundary.start - boundaryOffset, image.bitmap.width, boundary.end - boundary.start + (boundaryOffset * 2));
    }
}
exports.saveStaffs = saveStaffs;
