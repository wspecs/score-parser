import {GREY_INDEX, Classification} from './constant';
import {Range, Position, PositionMap} from './types';
import * as Jimp from 'jimp';

export function getBinaryDistribution(image: Jimp, x: number, y: number, width: number, height: number, greyIndex=GREY_INDEX) {
    const result = {white: 0, black: 0};
    image.scan(x, y, width, height, (x, y, idx) => {
      var red = image.bitmap.data[idx];
      var green = image.bitmap.data[idx+1];
      var blue = image.bitmap.data[idx+2];
  
      if (red < greyIndex && green < greyIndex && blue < greyIndex) {
        result.black++;
      } else {
        result.white++;
      }
    });
    return binaryDistribution(result.white, result.black);
  }

export function binaryDistribution(white: number, black: number) {
    return {
      white: white / (white + black),
      black: black / (white + black),
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
      // const positionRanges = new Set([...Array(position.end - position.start + 1).keys()].map(
      //   x => x + position.start));
      // const previousRanges = new Set([...Array(newPreviousPosition.end - newPreviousPosition.start + 1).keys()].map(
      //   x => x + newPreviousPosition.start));
      const positionRanges = new Set([...Array(position.end - position.start + 1).map(x => x + position.start)]);
      const previousRanges = new Set([...Array(newPreviousPosition.end - newPreviousPosition.start + 1).map(x => x + newPreviousPosition.start)]);
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