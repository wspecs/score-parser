"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./constant");
function getBinaryDistribution(image, x, y, width, height, greyIndex) {
    if (greyIndex === void 0) { greyIndex = constant_1.GREY_INDEX; }
    var result = { white: 0, black: 0 };
    image.scan(x, y, width, height, function (x, y, idx) {
        var red = image.bitmap.data[idx];
        var green = image.bitmap.data[idx + 1];
        var blue = image.bitmap.data[idx + 2];
        if (red < greyIndex && green < greyIndex && blue < greyIndex) {
            result.black++;
        }
        else {
            result.white++;
        }
    });
    return binaryDistribution(result.white, result.black);
}
exports.getBinaryDistribution = getBinaryDistribution;
function binaryDistribution(white, black) {
    return {
        white: white / (white + black),
        black: black / (white + black),
    };
}
exports.binaryDistribution = binaryDistribution;
function getBoudary(horizontalRange, verticalRange, padding) {
    if (padding === void 0) { padding = 2; }
    if (horizontalRange.start === 0 || verticalRange.start === 0) {
        padding = 0;
    }
    return {
        x: horizontalRange.start - padding,
        y: verticalRange.start - padding,
        height: verticalRange.end - verticalRange.start + (padding * 2),
        width: horizontalRange.end - horizontalRange.start + (padding * 2)
    };
}
exports.getBoudary = getBoudary;
function getNextPositions(previousPosition, selectionMap) {
    var positions = [];
    var newPreviousPosition = __assign({}, previousPosition);
    var _loop_1 = function (position) {
        // const positionRanges = new Set([...Array(position.end - position.start + 1).keys()].map(
        //   x => x + position.start));
        // const previousRanges = new Set([...Array(newPreviousPosition.end - newPreviousPosition.start + 1).keys()].map(
        //   x => x + newPreviousPosition.start));
        var positionRanges = new Set(Array(position.end - position.start + 1).map(function (x) { return x + position.start; }).slice());
        var previousRanges = new Set(Array(newPreviousPosition.end - newPreviousPosition.start + 1).map(function (x) { return x + newPreviousPosition.start; }).slice());
        var intersection = Array.from(positionRanges).filter(function (x) { return previousRanges.has(x); });
        if (intersection.length > 0) {
            positions.push(position);
            newPreviousPosition = position;
        }
    };
    for (var _i = 0, _a = selectionMap[String(previousPosition.position + 1)]; _i < _a.length; _i++) {
        var position = _a[_i];
        _loop_1(position);
    }
    return positions;
}
exports.getNextPositions = getNextPositions;
function getSpaceClassication(start, end, staffSpaceSize) {
    var diff = end - start;
    if (diff > staffSpaceSize * 1.3) {
        return constant_1.Classification.BEAM;
    }
    if (diff >= staffSpaceSize * 0.9) {
        return constant_1.Classification.NOTE;
    }
    if (diff > staffSpaceSize * 0.5) {
        return constant_1.Classification.VARIATION;
    }
    if (diff >= staffSpaceSize * 0.1 && diff) {
        return constant_1.Classification.DOT;
    }
    return constant_1.Classification.NOISE;
}
exports.getSpaceClassication = getSpaceClassication;
