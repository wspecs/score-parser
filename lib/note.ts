import * as Jimp from 'jimp';
import {getBinaryDistribution, getBoudary, getNextPositions} from './utils';
import {Range, Position} from './types';
import {NoteLabel} from './constant';

export interface NoteInfo {
  top: boolean;
  middle: boolean;
  bottom: boolean;
  filled: boolean;
  whole: boolean;
}

export function getNotCirleInfo(image: Jimp) {
    const distribution = getBinaryDistribution(
      image, image.bitmap.width / 2, image.bitmap.height / 2, 1, image.bitmap.height / 2);
    if (distribution.foreground > 0.80) {
      return NoteLabel.FILLED;
    }
    return NoteLabel.WHOLE;
}

export function getNoteBoundary(horizontalRange: Range, verticalRange: Position, selectionMap: {}, noteInfo: NoteInfo, noteCount = 2) {
    let boundary = getBoudary(horizontalRange, verticalRange);
    let previousPosition = verticalRange;
    for (let position = horizontalRange.start; position < horizontalRange.end; position++) {
      const positions = getNextPositions(previousPosition, selectionMap);
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