import * as Jimp from 'jimp';
import {getBinaryDistribution, getBoudary, getNextPositions} from './utils';
import {Range, Position} from './types';
import {NoteLabel} from './constant';

export interface NoteInfo {
  top: boolean;
  middle: boolean;
  bottom: boolean;
}

function getNotCirleInfo(image: Jimp) {
    const distribution = getBinaryDistribution(
      image, image.bitmap.width / 2, image.bitmap.height / 2, 1, image.bitmap.height / 2);
    if (distribution.white > 0.80) {
      return NoteLabel.FILLED;
    }
    return NoteLabel.WHOLE;
}

function getNoteBoundary(horizontalRange: Position, verticalRange: Position, selectionMap: {}, noteInfo: NoteInfo, noteCount = 2) {
    let boundary = getBoudary(horizontalRange, verticalRange);
    let previousPosition = verticalRange;
    for (let position = horizontalRange.start; position < horizontalRange.end; position++) {
      const positions = getNextPositions(previousPosition, selectionMap);
      // if (horizontalRange.start === 557) console.log(positions);  // debug
      if (positions.length === 0) {
        boundary = getBoudary(Object.assign({}, horizontalRange, {end: position}), previousPosition);
        break;
      }
      previousPosition = positions.reduce((res, curr) => {
        res.start = Math.min(res.start, curr.start);
        res.end = Math.max(res.end, curr.end);
        res.position = curr.position;
        return res;
      }, previousPosition);
      boundary = getBoudary(horizontalRange, previousPosition);
    }
    if (boundary.height > boundary.width * 1.3) {
      const heightOffset = Math.floor(boundary.height / noteCount);
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