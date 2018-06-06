"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var constant_1 = require("./constant");
function getNotCirleInfo(image) {
    var distribution = utils_1.getBinaryDistribution(image, image.bitmap.width / 2, image.bitmap.height / 2, 1, image.bitmap.height / 2);
    if (distribution.foreground > 0.80) {
        return constant_1.NoteLabel.FILLED;
    }
    return constant_1.NoteLabel.WHOLE;
}
exports.getNotCirleInfo = getNotCirleInfo;
function getNoteBoundary(horizontalRange, verticalRange, selectionMap, noteInfo, noteCount) {
    if (noteCount === void 0) { noteCount = 2; }
    var boundary = utils_1.getBoudary(horizontalRange, verticalRange);
    var previousPosition = verticalRange;
    for (var position = horizontalRange.start; position < horizontalRange.end; position++) {
        var positions = utils_1.getNextPositions(previousPosition, selectionMap);
        if (positions.length === 0) {
            boundary = utils_1.getBoudary(Object.assign({}, horizontalRange, { end: position }), previousPosition);
            break;
        }
        previousPosition = positions.reduce(function (res, curr) {
            res.start = Math.min(res.start, curr.start);
            res.end = Math.max(res.end, curr.end);
            res.position = curr.position;
            return res;
        }, previousPosition);
        boundary = utils_1.getBoudary(horizontalRange, previousPosition);
    }
    // console.log(boundary);
    // if (boundary.height > boundary.width * 1.3) {
    //   const heightOffset = Math.floor(boundary.height / noteCount);
    //   boundary.height = boundary.height - heightOffset;
    //   if (noteInfo.bottom) {
    //     boundary.y = boundary.y + heightOffset;
    //   }
    // }
    return boundary;
}
exports.getNoteBoundary = getNoteBoundary;
