import {GREY_INDEX, Classification} from './constant';
import {Range, Position, PositionMap, ClassficationType, ClassificationPositionMap, BoundaryMap} from './types';
import * as Jimp from 'jimp';

export function getBinaryDistribution(image: Jimp, x: number, y: number, width: number, height: number, greyIndex=GREY_INDEX) {
    const result = {foreground: 0, background: 0};
    image.scan(x, y, width, height, (x, y, idx) => {
      var red = image.bitmap.data[idx];
      var green = image.bitmap.data[idx+1];
      var blue = image.bitmap.data[idx+2];
  
      if (red === 0 && green === 0 && blue === 0) {
        result.background++;
      } else {
        result.foreground++;
      }
    });
    return binaryDistribution(result.foreground, result.background);
  }

export function binaryDistribution(foreground: number, background: number) {
    return {
      foreground: foreground / (foreground + background),
      background: background / (foreground + background),
    };
  }

export function getBoudary(horizontalRange: Range, verticalRange: Range, padding = 2) {
    if (horizontalRange.start === 0 || verticalRange.start === 0) {
      padding = 0;
    }
    return {
      x: horizontalRange.start - padding,
      y: verticalRange.start - padding,
      height: verticalRange.end - verticalRange.start + (padding * 2),
      width: horizontalRange.end - horizontalRange.start + (padding * 2)
    }
  }

export function getNextPositions(previousPosition: Position, selectionMap: PositionMap) {
    const positions = [];
    let newPreviousPosition = {...previousPosition};
    for (const position of selectionMap[String(previousPosition.position + 1)]) {
      // Sets are undefined investigate
      const positionRanges = new Set(Array.from({length: position.end - position.start}, (x,i) => i + position.start + 1)); // new Set([...Array(position.end - position.start + 1)].map((_, x) => x + position.start));
      const previousRanges = new Set(Array.from({length: newPreviousPosition.end - newPreviousPosition.start}, (x,i) => i + newPreviousPosition.start + 1)); // new Set([...Array(position.end - position.start + 1)].map((_, x) => x + position.start));
      const intersection = Array.from(positionRanges).filter(x => previousRanges.has(x));
      if (intersection.length > 0) {
        positions.push(position);
        newPreviousPosition = position;
      }
    }
    return positions;
  }
  
  export function getSpaceClassication(start: number, end: number, staffSpaceSize: number) {
    const diff = end - start;
    if (diff > staffSpaceSize * 1.3) {
      return Classification.BEAM;
    }
    if (diff >= staffSpaceSize * 0.9) {
      return Classification.NOTE;
    }
    if (diff > staffSpaceSize * 0.5) {
      return Classification.VARIATION;
    }
    if (diff >= staffSpaceSize * 0.1 && diff) {
      return Classification.DOT;
    }
    return Classification.NOISE;
  }

  export function getSelectionBoundary(horizontalRange: Range, verticalRange: Position, selectionMap: {}) {
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
    return boundary;
  }

  export function getBoundaries(classifications: ClassficationType[], selectionMap: ClassificationPositionMap) {
    const boundaries: BoundaryMap = {};
    for (const classification of classifications) {
      const horizontalRanges = selectionMap[classification.start];
      for (const range of horizontalRanges) {
        const key = `${classification.start}-${range.start}`;
        boundaries[key] = getSelectionBoundary(classification, range, selectionMap);
      }
    }
    return boundaries;
  }