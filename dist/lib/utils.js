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
    var result = { foreground: 0, background: 0 };
    image.scan(x, y, width, height, function (x, y, idx) {
        var red = image.bitmap.data[idx];
        var green = image.bitmap.data[idx + 1];
        var blue = image.bitmap.data[idx + 2];
        if (red === 0 && green === 0 && blue === 0) {
            result.background++;
        }
        else {
            result.foreground++;
        }
    });
    return binaryDistribution(result.foreground, result.background);
}
exports.getBinaryDistribution = getBinaryDistribution;
function binaryDistribution(foreground, background) {
    return {
        foreground: foreground / (foreground + background),
        background: background / (foreground + background),
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
        // Sets are undefined investigate
        var positionRanges = new Set(Array.from({ length: position.end - position.start }, function (x, i) { return i + position.start + 1; })); // new Set([...Array(position.end - position.start + 1)].map((_, x) => x + position.start));
        var previousRanges = new Set(Array.from({ length: newPreviousPosition.end - newPreviousPosition.start }, function (x, i) { return i + newPreviousPosition.start + 1; })); // new Set([...Array(position.end - position.start + 1)].map((_, x) => x + position.start));
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
function getSelectionBoundary(horizontalRange, verticalRange, selectionMap) {
    var boundary = getBoudary(horizontalRange, verticalRange);
    var previousPosition = verticalRange;
    for (var position = horizontalRange.start; position < horizontalRange.end; position++) {
        var positions = getNextPositions(previousPosition, selectionMap);
        if (positions.length === 0) {
            boundary = getBoudary(Object.assign({}, horizontalRange, { end: position }), previousPosition);
            break;
        }
        previousPosition = positions.reduce(function (res, curr) {
            res.start = Math.min(res.start, curr.start);
            res.end = Math.max(res.end, curr.end);
            res.position = curr.position;
            return res;
        }, previousPosition);
        boundary = getBoudary(horizontalRange, previousPosition);
    }
    return boundary;
}
exports.getSelectionBoundary = getSelectionBoundary;
function getBoundaries(classifications, selectionMap) {
    var boundaries = {};
    for (var _i = 0, classifications_1 = classifications; _i < classifications_1.length; _i++) {
        var classification = classifications_1[_i];
        var horizontalRanges = selectionMap[classification.start];
        for (var _a = 0, horizontalRanges_1 = horizontalRanges; _a < horizontalRanges_1.length; _a++) {
            var range = horizontalRanges_1[_a];
            var key = classification.start + "-" + range.start;
            boundaries[key] = getSelectionBoundary(classification, range, selectionMap);
        }
    }
    return boundaries;
}
exports.getBoundaries = getBoundaries;
