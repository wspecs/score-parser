"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var constant_1 = require("./constant");
function getNotCirleInfo(image) {
    var distribution = utils_1.getBinaryDistribution(image, image.bitmap.width / 2, image.bitmap.height / 2, 1, image.bitmap.height / 2);
    if (distribution.white > 0.80) {
        return constant_1.NoteLabel.FILLED;
    }
    return constant_1.NoteLabel.WHOLE;
}
function getNoteBoundary(horizontalRange, verticalRange, selectionMap, noteInfo, noteCount) {
    if (noteCount === void 0) { noteCount = 2; }
    var boundary = utils_1.getBoudary(horizontalRange, verticalRange);
    var previousPosition = verticalRange;
    for (var position = horizontalRange.start; position < horizontalRange.end; position++) {
        var positions = utils_1.getNextPositions(previousPosition, selectionMap);
        // if (horizontalRange.start === 557) console.log(positions);  // debug
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
    if (boundary.height > boundary.width * 1.3) {
        var heightOffset = Math.floor(boundary.height / noteCount);
        boundary.height = boundary.height - heightOffset;
        if (noteInfo.bottom) {
            boundary.y = boundary.y + heightOffset;
        }
    }
    return boundary;
}
// function getPixelForFirstNote(originalImage) {
//   const image = originalImage.clone();
//   darkenWhitePixels(image);
//   const distributions = [];
//   let interval = 4;
//   for (let width = 0; width < image.bitmap.width; width+=interval) {
//    const distribution = getBinaryDistribution(image, width, 0, interval, image.bitmap.height);
//    distributions.push({percentage: distribution.white, index: width});
//  }
//  const threshold = 0.05;
//  let candidates = distributions.filter(x => x.percentage > threshold);
//  let firstNoteXIndex = 0;
//  if (candidates.length === 0) {
//    return firstNoteXIndex;
//  }
//  const max = Math.max(...candidates.map(x => x.percentage));
//  const maxIndex = candidates.find(x => x.percentage === max).index;
//  candidate = candidates.slice(candidates.findIndex(x => x.percentage === max) + 1);
//  // Remove outliers
//  firstNoteXIndex = candidates.reduce((res, curr, idx) => {
//    const previous = idx > 0 ? candidates[idx - 1] : {};
//    if (res === 0 && previous.index && curr.index - previous.index > interval) {
//      if (Math.abs(previous.percentage - curr.percentage) < threshold && previous.percentage < 0.20 && curr.percentage < 0.20) {
//        res = previous.index;
//      } else {
//        res = curr.index;
//      }
//    } else if (curr.index < (image.bitmap.width / 4) && curr.percentage > 0.25) {
//      res = 0;
//    }
//    return res;
//  }, 0);
//  return firstNoteXIndex;
// }
